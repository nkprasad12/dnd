import {ContextMenuModel} from '_client/game_board/context_menu/context_menu_model';
import {Location} from '_common/coordinates';
import {
  RemoteBoardDiff,
  RemoteBoardModel,
} from '_common/board/remote_board_model';
import {
  getBackgroundData,
  LoadedImage,
  loadImages,
} from '_client/utils/image_utils';
import {checkDefined} from '_common/preconditions';
import {TokenDiff, TokenModel} from './token_model';
import {maybeMerge, notUndefined, prefer} from '_common/verification';
import {getId} from '_client/common/id_generator';
import {createGrid} from '_common/util/grid';

/** Data model representing the game board. */
export class BoardModel implements Readonly<MutableBoardModel> {
  /** Creates a new full model from a remote board model. */
  static async createFromRemote(
    remoteModel: RemoteBoardModel
  ): Promise<BoardModel> {
    const imageSources = remoteModel.tokens.map((token) => token.imageSource);
    imageSources.push(remoteModel.imageSource);
    const imageMap = await loadImages(imageSources);
    const background = new LoadedImage(
      checkDefined(imageMap.get(remoteModel.imageSource)),
      remoteModel.imageSource
    );
    const tokens = remoteModel.tokens.map((remoteToken) =>
      TokenModel.fromRemoteAndMap(remoteToken, imageMap)
    );
    return new BoardModel(
      remoteModel,
      background,
      {clickPoint: {x: 0, y: 0}, isVisible: false},
      createGrid(remoteModel.rows, remoteModel.cols, false),
      tokens
    );
  }

  static createNew(
    name: string,
    backgroundImage: LoadedImage,
    tileSize: number
  ): BoardModel {
    const backgroundData = getBackgroundData(backgroundImage, tileSize, {
      x: 0,
      y: 0,
    });
    const inner: RemoteBoardModel = {
      id: getId(),
      tileSize: tileSize,
      name: name,
      imageSource: backgroundImage.source,
      tokens: [],
      gridOffset: {x: 0, y: 0},
      rows: backgroundData.rows,
      cols: backgroundData.cols,
      width: backgroundData.width,
      height: backgroundData.height,
      publicSelection: createGrid(
        backgroundData.rows,
        backgroundData.cols,
        '0'
      ),
      fogOfWar: createGrid(backgroundData.rows, backgroundData.cols, '0'),
    };
    return new BoardModel(
      inner,
      backgroundImage,
      {clickPoint: {x: 0, y: 0}, isVisible: false},
      createGrid(backgroundData.rows, backgroundData.cols, false)
    );
  }

  private constructor(
    readonly inner: RemoteBoardModel,
    readonly backgroundImage: LoadedImage,
    readonly contextMenuState: ContextMenuModel,
    readonly peekedTiles: ReadonlyArray<ReadonlyArray<boolean>>,
    readonly tokens: readonly TokenModel[] = [],
    readonly localSelection: readonly Location[] = [],
    readonly scale: number = 1
  ) {}

  async mergedWith(diff: BoardDiff): Promise<BoardModel> {
    if (
      diff.inner !== undefined &&
      (diff.inner as any).tokenDiffs !== undefined
    ) {
      throw new Error('Inner diff of BoardDiff cannot have tokenDiffs');
    }
    const tokens = await this.mergeTokens(diff.inner, diff.tokenDiffs);

    const dimsChanged =
      (diff.inner?.rows !== undefined &&
        diff.inner?.rows !== this.inner.rows) ||
      (diff.inner?.cols !== undefined && diff.inner?.cols !== this.inner.cols);

    let peekedTiles = this.peekedTiles;
    if (diff.peekDiff !== undefined && !dimsChanged) {
      const newValue = diff.peekDiff.isPeeked;
      const colTest = inRange(diff.peekDiff.start.col, diff.peekDiff.end.col);
      const rowTest = inRange(diff.peekDiff.start.row, diff.peekDiff.end.row);
      peekedTiles = peekedTiles.map((col, i) =>
        colTest(i)
          ? col.map((oldValue, j) => (rowTest(j) ? newValue : oldValue))
          : col
      );
    }
    peekedTiles = dimsChanged
      ? createGrid(
          prefer(diff.inner?.rows, this.inner.rows),
          prefer(diff.inner?.cols, this.inner.cols),
          false
        )
      : peekedTiles;
    return new BoardModel(
      maybeMerge(
        this.inner,
        BoardDiff.extractRemoteDiff(this.inner.id, diff),
        RemoteBoardModel.mergedWith
      ),
      this.backgroundImage,
      prefer(diff.contextMenuState, this.contextMenuState),
      peekedTiles,
      tokens,
      prefer(diff.localSelection, this.localSelection),
      prefer(diff.scale, this.scale)
    );
  }

  private async mergeTokens(
    diff?: PrunedRemoteBoardDiff,
    tokenDiffs?: TokenDiff[]
  ): Promise<readonly TokenModel[]> {
    let result = this.tokens;
    if (
      diff !== undefined &&
      diff.removedTokens &&
      diff.removedTokens.length > 0
    ) {
      result = result.filter(
        (token) => !prefer(diff.removedTokens, []).includes(token.inner.id)
      );
    }
    if (tokenDiffs !== undefined && tokenDiffs.length > 0) {
      result = result.map((token) => {
        const diffMatch = tokenDiffs.find(
          (tokenDiff) => tokenDiff.inner?.id === token.inner.id
        );
        return diffMatch === undefined
          ? token
          : TokenModel.merge(token, diffMatch);
      });
    }
    if (diff !== undefined && diff.newTokens && diff.newTokens.length > 0) {
      result = result.concat(
        await Promise.all(diff.newTokens.map(TokenModel.fromRemote))
      );
    }
    return result;
  }
}

interface MutableBoardModel {
  backgroundImage: LoadedImage;
  inner: RemoteBoardModel;
  contextMenuState: ContextMenuModel;
  peekedTiles: ReadonlyArray<ReadonlyArray<boolean>>;
  tokens: readonly TokenModel[];
  localSelection: readonly Location[];
  scale: number;
}

function inRange(lower: number, upper: number): (value: number) => boolean {
  return (value) => lower <= value && value <= upper;
}

export interface PeekDiff {
  /** The top left corner of the changed area. */
  start: Location;
  /** The bottom right corner of the changed area. */
  end: Location;
  /** Whether the area was peeked or unpeeked. */
  isPeeked: boolean;
}

type PrunedRemoteBoardDiff = Omit<RemoteBoardDiff, 'tokenDiffs'>;

interface AdditionalFields {
  inner?: PrunedRemoteBoardDiff;
  tokenDiffs?: TokenDiff[];
  peekDiff?: PeekDiff;
}

export type BoardDiff = Partial<
  Omit<MutableBoardModel, 'inner' | 'mergedFrom'>
> &
  AdditionalFields;

export namespace BoardDiff {
  export function extractRemoteDiff(
    boardId: string,
    diff: BoardDiff
  ): RemoteBoardDiff | undefined {
    const remoteDiff = diff.inner;
    const tokenDiffs = diff.tokenDiffs;
    if (remoteDiff === undefined && tokenDiffs === undefined) {
      return undefined;
    }
    const remoteTokenDiffs = prefer(
      tokenDiffs?.map((tokenDiff) => tokenDiff.inner).filter(notUndefined),
      []
    );
    const result = prefer(remoteDiff, {
      id: boardId,
    });
    (result as any).tokenDiffs = remoteTokenDiffs;
    return result as RemoteBoardDiff;
  }

  export function fromRemoteDiff(diff: RemoteBoardDiff): BoardDiff {
    const boardDiff: BoardDiff = {inner: diff};
    if (diff.tokenDiffs) {
      const tokenDiffs = diff.tokenDiffs;
      delete (diff as any).tokenDiffs;
      boardDiff.tokenDiffs = tokenDiffs.map((tokenDiff) => {
        return {inner: tokenDiff};
      });
    }
    return boardDiff;
  }
}
