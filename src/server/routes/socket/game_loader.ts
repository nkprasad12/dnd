import {RemoteBoardModel} from '_common/board/remote_board_model';
import {checkDefined} from '_common/preconditions';
import {storageUtil} from '_server/storage/storage_util';


const CACHE_SAVE_INTERNAL_MS = 60000;
const ACTIVE_DB = 'active.db';
const ALL_BOARD_DB = 'all_boards.db';


/** Returns the file key to find the given board id. */
function getBoardKey(boardId: string): string {
  return `${boardId}.txt`;
}

/** Loads a board from storage. */
async function loadBoard(fileKey: string): Promise<RemoteBoardModel> {
  const contents = await storageUtil().loadFromFile(fileKey);
  const parsedContent = JSON.parse(contents);
  if (!RemoteBoardModel.isValid(parsedContent)) {
    RemoteBoardModel.fillDefaults(parsedContent);
    if (!RemoteBoardModel.isValid(parsedContent)) {
      throw new Error(`${fileKey} does not represent a valid board!`);
    }
  }
  return parsedContent;
}

/** Saves a board to storage. */
function saveBoard(fileKey: string, board: RemoteBoardModel): void {
  // Do we need to handle this further? (JSON.stringify)
  storageUtil().saveToFile(JSON.stringify(board), fileKey);
}

interface CachedGame {
  fileKey: string;
  updateTime: number;
  saveTime: number;
  gameData: RemoteBoardModel;
}

async function loadFromDisk(boardId: string): Promise<CachedGame> {
  const fileKey = getBoardKey(boardId);
  const board = await loadBoard(fileKey);

  const currentTime = Date.now();
  // Make sure it's before the current time.
  const updateTime = currentTime - 1;
  return {
    fileKey: fileKey,
    updateTime: updateTime,
    saveTime: currentTime,
    gameData: board,
  };
}

function newBoard(boardId: string, board: RemoteBoardModel): CachedGame {
  const fileKey = getBoardKey(boardId);
  const currentTime = Date.now();
  return {
    fileKey: fileKey,
    updateTime: currentTime,
    saveTime: -1,
    gameData: board,
  };
}

class GameCache {
  static create(): GameCache {
    const cache = new GameCache();
    console.log('Created new game cache, setting timeout');
    setTimeout(() => cache.save(), CACHE_SAVE_INTERNAL_MS);
    return cache;
  }

  private readonly cache: Map<string, CachedGame> = new Map();

  private constructor() {}

  /**
   * Updates the cache with the board with given ID and data.
   *
   * @param id the board ID to update.
   * @param board the board data to update.
   *
   * @returns whether a new board was created.
   */
  updateBoard(id: string, board: RemoteBoardModel): boolean {
    if (this.getBoard(id) === undefined) {
      this.cache.set(id, newBoard(id, board));
      return true;
    }
    const cachedBoard = checkDefined(this.cache.get(id));
    const currentTime = Date.now();
    cachedBoard.gameData = board;
    cachedBoard.updateTime = currentTime;
    return false;
  }

  /**
   * Returns the board with the given ID.
   *
   * If it is not in the cache, try to load it from storage.
   * If is is not storage, returns undefined.
   */
  async getBoard(id: string): Promise<RemoteBoardModel> {
    let result = this.cache.get(id);
    if (result === undefined) {
      const loadedBoard = await loadFromDisk(id);
      this.cache.set(id, loadedBoard);
      result = loadedBoard;
    }
    return result.gameData;
  }

  /** Saves cache items to storage. */
  private save(): void {
    console.log('Checking cache for items that need to be saved.');
    this.cache.forEach((cachedGame) => {
      if (cachedGame.saveTime < cachedGame.updateTime) {
        cachedGame.saveTime = cachedGame.updateTime;
        saveBoard(cachedGame.fileKey, cachedGame.gameData);
      }
    });
    setTimeout(() => this.save(), CACHE_SAVE_INTERNAL_MS);
  }
}

function isStringArray(input: any): input is string[] {
  if (!Array.isArray(input)) {
    return false;
  }
  for (const item of input) {
    if (typeof item !== 'string') {
      return false;
    }
  }
  return true;
}

class GameLoader {
  private activeBoard: string|undefined;
  private allBoardIds: string[]|undefined;
  private gameCache = GameCache.create();

  /** Returns the ID of the active board. */
  async getActiveBoard(): Promise<string> {
    if (this.activeBoard !== undefined) {
      console.log('Got active board from cache');
      return this.activeBoard;
    }
    console.log('Getting active board from disk');
    this.activeBoard = await storageUtil().loadFromFile(ACTIVE_DB);
    return this.activeBoard;
  }

  /** Sets the given board as active. */
  setActiveBoard(id: string): void {
    this.activeBoard = id;
    storageUtil().saveToFile(id, ACTIVE_DB);
  }

  async retrieveAllBoardIds(): Promise<string[]> {
    if (this.allBoardIds !== undefined) {
      console.log('Returning all board ids from cache');
      return this.allBoardIds;
    }
    console.log('Reading all board ids from storage');
    const allBoards = await storageUtil().loadFromFile(ALL_BOARD_DB);
    if (allBoards === undefined) {
      this.allBoardIds = [];
    } else {
      const parsedBoards = JSON.parse(allBoards);
      if (!isStringArray(parsedBoards)) {
        this.allBoardIds = [];
      } else {
        this.allBoardIds = parsedBoards;
      }
    }
    return this.allBoardIds;
  }

  async updateAllBoardIds(newId: string): Promise<void> {
    const allIds = await this.retrieveAllBoardIds();
    if (!allIds.includes(newId)) {
      this.allBoardIds = checkDefined(this.allBoardIds);
      this.allBoardIds.push(newId);
      storageUtil().saveToFile(JSON.stringify(this.allBoardIds), ALL_BOARD_DB);
    }
  }

  /**
   * Saves the input board.
   *
   * If there is an existing board with the same id, overwrites it.
   */
  saveBoard(board: RemoteBoardModel): void {
    this.gameCache.updateBoard(board.id, board);
    this.updateAllBoardIds(board.id);
  }

  async retrieveBoard(boardId: string): Promise<RemoteBoardModel> {
    return this.gameCache.getBoard(boardId);
  }
}


let cachedGameLoader: GameLoader|undefined = undefined;

export function gameLoader(): GameLoader {
  if (cachedGameLoader === undefined) {
    console.log('Creating new game loader');
    cachedGameLoader = new GameLoader();
  }
  return cachedGameLoader;
}
