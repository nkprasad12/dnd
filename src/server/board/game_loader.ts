import {RemoteBoardModel} from '_common/board/remote_board_model';
import {checkDefined} from '_common/preconditions';
import {isStringArray} from '_common/verification';
import {StorageCache} from '_server/storage/cache';
import {CacheItemFactory} from '_server/storage/cache_item';
import {storageUtil} from '_server/storage/storage_util';

const ACTIVE_DB = 'active.db';
const ALL_BOARD_DB = 'all_boards.db';

/** Returns the file key to find the given board id. */
function getBoardKey(boardId: string): string {
  return `${boardId}.txt`;
}

/** Saves a board to storage. */
function saveBoard(fileKey: string, board: RemoteBoardModel): void {
  storageUtil().saveToFile(JSON.stringify(board), fileKey);
}

class CachedGameFactory extends CacheItemFactory<RemoteBoardModel> {
  constructor() {
    super('CachedGameFactory', storageUtil().loadFromFile);
  }
  validate(item: any): item is RemoteBoardModel {
    return RemoteBoardModel.isValid(item);
  }
  correct(item: any): void {
    return RemoteBoardModel.fillDefaults(item);
  }
}

const cachedGameFactory = new CachedGameFactory();

class GameLoader {
  private activeBoard: string | undefined;
  private allBoardIds: string[] | undefined;
  private gameCache = StorageCache.create<RemoteBoardModel>(
    'RemoteBoardModel',
    cachedGameFactory,
    saveBoard
  );

  /** Returns the ID of the active board. */
  async getActiveBoard(): Promise<string> {
    if (this.activeBoard !== undefined) {
      console.log('Got active board from cache');
      return this.activeBoard;
    }
    console.log('Getting active board from disk');
    try {
      this.activeBoard = await storageUtil().loadFromFile(ACTIVE_DB);
    } catch {
      this.activeBoard = 'ERROR';
    }
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
    let allBoards: undefined | string = undefined;
    try {
      allBoards = await storageUtil().loadFromFile(ALL_BOARD_DB);
    } catch {}
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
  async saveBoard(board: RemoteBoardModel): Promise<void> {
    await this.gameCache.update(getBoardKey(board.id), board);
    await this.updateAllBoardIds(board.id);
  }

  async createNewBoard(board: RemoteBoardModel): Promise<void> {
    this.gameCache.addNew(getBoardKey(board.id), board);
    await this.updateAllBoardIds(board.id);
  }

  async retrieveBoard(boardId: string): Promise<RemoteBoardModel> {
    return this.gameCache.get(getBoardKey(boardId));
  }
}

let cachedGameLoader: GameLoader | undefined = undefined;

export function gameLoader(): GameLoader {
  if (cachedGameLoader === undefined) {
    console.log('Creating new game loader');
    cachedGameLoader = new GameLoader();
  }
  return cachedGameLoader;
}
