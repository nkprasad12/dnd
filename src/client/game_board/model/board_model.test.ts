import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {TokenDiff} from '_client/game_board/model/token_model';
import {FakeImage} from '_client/utils/fake_image';
import {getBackgroundData, LoadedImage} from '_client/utils/image_utils';
import {
  RemoteBoardDiff,
  RemoteTokenDiff,
} from '_common/board/remote_board_model';
import {
  remoteBoardModel,
  remoteTokenModel,
  TEST_BOARD_ID,
  TEST_BOARD_NAME,
  TEST_TOKEN_ID,
  TEST_TOKEN_NAME,
} from '_common/board/test_constants';
import {checkDefined} from '_common/preconditions';
import {copyGrid, createGrid, Grid} from '_common/util/grid';
import {isGrid} from '_common/verification';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

const IMAGE: any = new FakeImage.FakeImage();
const LOADED_IMAGE = new LoadedImage(IMAGE, TEST_BOARD_NAME);
const TILE_SIZE = 20;

describe('BoardModel.fromRemoteModel', () => {
  const remote = remoteBoardModel();

  it('uses input remote model as inner', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.inner).toBe(remote);
    done();
  });

  it('has the expected background source', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.backgroundImage.source).toBe(remote.imageSource);
    done();
  });

  it('starts with context menu not visible', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.contextMenuState.isVisible).toBe(false);
    done();
  });

  it('has expected isPeeked array', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(isGrid(model.peekedTiles, remote.cols, remote.rows)).toBe(true);
    expect(model.peekedTiles[0][0]).toBe(false);
    done();
  });

  it('has expected tokens', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.tokens.length).toBe(remote.tokens.length);
    expect(model.tokens[0].inner).toBe(remote.tokens[0]);
    expect(model.tokens[0].isActive).toBe(false);
    done();
  });
});

describe('BoardModel.createNew', () => {
  const model = BoardModel.createNew(TEST_TOKEN_NAME, LOADED_IMAGE, TILE_SIZE);
  const backgroundData = getBackgroundData(LOADED_IMAGE, TILE_SIZE, {
    x: 0,
    y: 0,
  });

  it('makes an inner model with the expected dimensions', () => {
    expect(model.inner.cols).toBe(backgroundData.cols);
    expect(model.inner.rows).toBe(backgroundData.rows);
    expect(model.inner.width).toBe(backgroundData.width);
    expect(model.inner.height).toBe(backgroundData.height);
  });

  it('has the expected other background parameters', () => {
    expect(model.backgroundImage.image).toBe(IMAGE);
    expect(model.inner.gridOffset).toStrictEqual({x: 0, y: 0});
    expect(model.inner.tileSize).toBe(TILE_SIZE);
  });

  it('initialized context menu invisible', () => {
    expect(model.contextMenuState.isVisible).toBe(false);
  });

  it('has correctly initialized peekedTiles', () => {
    expect(
      isGrid(model.peekedTiles, backgroundData.cols, backgroundData.rows)
    ).toBe(true);
    expect(model.peekedTiles[0][0]).toBe(false);
  });

  it('has correctly initialized publicSelection', () => {
    expect(
      isGrid(
        model.inner.publicSelection,
        backgroundData.cols,
        backgroundData.rows
      )
    ).toBe(true);
    expect(model.inner.publicSelection[0][0]).toBe('0');
  });

  it('has correctly initialized fogOfWar', () => {
    expect(
      isGrid(model.inner.fogOfWar, backgroundData.cols, backgroundData.rows)
    ).toBe(true);
    expect(model.inner.fogOfWar[0][0]).toBe('0');
  });
});

describe('boardModel.mergedWith', () => {
  const model = BoardModel.createNew(TEST_TOKEN_NAME, LOADED_IMAGE, TILE_SIZE);
  const NEW_SPEED = 5678769867;

  it('returns a difference instance', async (done) => {
    const innerDiff: RemoteBoardDiff = {
      id: model.inner.id,
      // By default, FakeImage has dimensions 57 x 420
      rows: 14,
      cols: 2,
      tileSize: 30,
    };
    const merged = await model.mergedWith({inner: innerDiff});
    expect(model === merged).toBe(false);
    done();
  });

  it('retains original grids on resize with same size', async (done) => {
    const innerDiff: RemoteBoardDiff = {
      id: model.inner.id,
      // By default, FakeImage has dimensions 57 x 420
      rows: model.inner.rows,
      cols: model.inner.cols,
      tileSize: model.inner.tileSize,
    };

    const merged = await model.mergedWith({inner: innerDiff});
    expect(merged.peekedTiles).toBe(model.peekedTiles);
    expect(merged.inner.fogOfWar).toStrictEqual(model.inner.fogOfWar);
    expect(merged.inner.publicSelection).toStrictEqual(
      model.inner.publicSelection
    );
    done();
  });

  it('updates grid sizes on resize', async (done) => {
    const innerDiff: RemoteBoardDiff = {
      id: model.inner.id,
      // By default, FakeImage has dimensions 57 x 420
      rows: 14,
      cols: 2,
      tileSize: 30,
    };

    const merged = await model.mergedWith({inner: innerDiff});
    expect(merged.peekedTiles).toStrictEqual(createGrid(14, 2, false));
    expect(merged.inner.fogOfWar).toStrictEqual(createGrid(14, 2, '0'));
    expect(merged.inner.publicSelection).toStrictEqual(createGrid(14, 2, '0'));
    done();
  });

  it('updates grid sizes on only col resize', async (done) => {
    const board = BoardModel.createNew(TEST_TOKEN_NAME, LOADED_IMAGE, 57);
    const innerDiff: RemoteBoardDiff = {
      id: board.inner.id,
      // By default, FakeImage has dimensions 57 x 420
      cols: 2,
      tileSize: 56,
    };

    const merged = await board.mergedWith({inner: innerDiff});
    expect(merged.peekedTiles).toStrictEqual(createGrid(8, 2, false));
    expect(merged.inner.fogOfWar).toStrictEqual(createGrid(8, 2, '0'));
    expect(merged.inner.publicSelection).toStrictEqual(createGrid(8, 2, '0'));
    done();
  });

  it('has same inner model if no inner or token diff', async (done) => {
    const peekDiff: Grid.SimpleDiff<boolean> = {
      area: {
        start: {col: 1, row: 0},
        end: {col: 2, row: 3},
      },
      value: true,
    };

    const merged = await model.mergedWith({peekDiff: peekDiff});
    expect(merged.inner).toBe(model.inner);
    done();
  });

  it('does not mutate original if diff has peekDiff', async (done) => {
    const peekDiff: Grid.SimpleDiff<boolean> = {
      area: {
        start: {col: 1, row: 0},
        end: {col: 2, row: 3},
      },
      value: true,
    };

    const originalPeek = copyGrid(model.peekedTiles);
    await model.mergedWith({peekDiff: peekDiff});
    expect(model.peekedTiles).toStrictEqual(originalPeek);
    done();
  });

  it('updates peekTiles if diff has peekDiff', async (done) => {
    const peekDiff: Grid.SimpleDiff<boolean> = {
      area: {
        start: {col: 1, row: 0},
        end: {col: 2, row: 3},
      },
      value: true,
    };

    const merged = await model.mergedWith({peekDiff: peekDiff});
    for (let i = 0; i < merged.inner.cols; i++) {
      for (let j = 0; j < merged.inner.rows; j++) {
        const expected = 1 <= i && i <= 2 && 0 <= j && j <= 3;
        expect(merged.peekedTiles[i][j]).toBe(expected);
      }
    }
    done();
  });

  it('updates scale if diff has scale', async (done) => {
    const newScale = 3;
    const merged = await model.mergedWith({scale: newScale});
    expect(merged.scale).toBe(newScale);
    expect(model.scale).toBe(1);
    done();
  });

  it('updates localSelection if diff has localSelection', async (done) => {
    const localSelection = {
      area: {start: {col: 1, row: 1}, end: {col: 1, row: 1}},
    };
    const merged = await model.mergedWith({
      localSelection: localSelection,
    });
    expect(merged.localSelection).toStrictEqual(localSelection);
    expect(model.localSelection).toEqual({});
    done();
  });

  it('updates contextMenu if diff has contextMenu', async (done) => {
    const contextMenu = {isVisible: true, clickPoint: {x: 1, y: 1}};
    const merged = await model.mergedWith({contextMenuState: contextMenu});
    expect(merged.contextMenuState).toBe(contextMenu);
    expect(model.contextMenuState).toEqual({
      isVisible: false,
      clickPoint: {x: 0, y: 0},
    });
    done();
  });

  it('adds new token in diff to BoardModel', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const newToken = remoteTokenModel() as any;
    newToken.id = '345345';
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      newTokens: [newToken],
    };
    const merged = await board.mergedWith({inner: diff});
    const expectedTokenIds = merged.tokens.map((token) => token.inner.id);

    expect(expectedTokenIds.length).toBe(2);
    expect(expectedTokenIds).toContain(newToken.id);
    expect(expectedTokenIds).toContain(TEST_TOKEN_ID);
    done();
  });

  it('adds new token in diff to inner model', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const newToken = remoteTokenModel() as any;
    newToken.id = '345345';
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      newTokens: [newToken],
    };
    const merged = await board.mergedWith({inner: diff});
    const expectedTokenIds = merged.inner.tokens.map((token) => token.id);

    expect(expectedTokenIds.length).toBe(2);
    expect(expectedTokenIds).toContain(newToken.id);
    expect(expectedTokenIds).toContain(TEST_TOKEN_ID);
    done();
  });

  it('on diff with new token does not mutate original', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const newToken = remoteTokenModel() as any;
    newToken.id = '345345';
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      newTokens: [newToken],
    };
    await board.mergedWith({inner: diff});

    expect(board.tokens.length).toBe(1);
    expect(board.tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(board.inner.tokens.length).toBe(1);
    expect(board.inner.tokens[0].id).toBe(TEST_TOKEN_ID);
    done();
  });

  it('removes tokens filtered in diff from BoardModel', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      removedTokens: [TEST_TOKEN_ID],
    };
    const merged = await board.mergedWith({inner: diff});

    expect(merged.tokens.length).toBe(0);
    done();
  });

  it('removes tokens filtered in diff from inner model', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      removedTokens: [TEST_TOKEN_ID],
    };
    const merged = await board.mergedWith({inner: diff});

    expect(merged.inner.tokens.length).toBe(0);
    done();
  });

  it('on diff with removed token not mutate original', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      removedTokens: [TEST_TOKEN_ID],
    };
    await board.mergedWith({inner: diff});

    expect(board.tokens.length).toBe(1);
    expect(board.tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(board.inner.tokens.length).toBe(1);
    expect(board.inner.tokens[0].id).toBe(TEST_TOKEN_ID);
    done();
  });

  it('modifies in BoardModel tokens changed in diff', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: TokenDiff = {
      inner: {id: TEST_TOKEN_ID, speed: NEW_SPEED},
    };
    const merged = await board.mergedWith({tokenDiffs: [diff]});

    expect(merged.tokens.length).toBe(1);
    expect(merged.tokens[0].inner.speed).toBe(NEW_SPEED);
    done();
  });

  it('modifies in inner model tokens changed in diff', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: TokenDiff = {
      inner: {id: TEST_TOKEN_ID, speed: NEW_SPEED},
    };
    const merged = await board.mergedWith({tokenDiffs: [diff]});

    expect(merged.inner.tokens.length).toBe(1);
    expect(merged.inner.tokens[0].speed).toBe(NEW_SPEED);
    done();
  });

  it('on diff with modified tokens does not mutate original', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: TokenDiff = {
      inner: {id: TEST_TOKEN_ID, speed: NEW_SPEED},
    };
    await board.mergedWith({tokenDiffs: [diff]});

    expect(board.tokens.length).toBe(1);
    expect(board.tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(board.inner.tokens.length).toBe(1);
    expect(board.inner.tokens[0].id).toBe(TEST_TOKEN_ID);
    done();
  });

  it('does not modify result if token diffs have invalid ids', async (done) => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: TokenDiff = {
      inner: {id: TEST_TOKEN_ID, speed: NEW_SPEED},
    };
    await board.mergedWith({tokenDiffs: [diff]});

    expect(board.tokens.length).toBe(1);
    expect(board.tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(board.inner.tokens.length).toBe(1);
    expect(board.inner.tokens[0].id).toBe(TEST_TOKEN_ID);
    done();
  });

  it('throws if inner model has token diffs', async () => {
    const board = await BoardModel.createFromRemote(remoteBoardModel());
    const diff: RemoteBoardDiff = {
      id: board.inner.id,
      tokenDiffs: [{id: TEST_TOKEN_ID}],
    };
    return expect(board.mergedWith({inner: diff})).rejects.toThrowError(
      'Inner diff of BoardDiff cannot have tokenDiffs'
    );
  });
});

describe('BoardDiff.extractRemoteDiff', () => {
  it('attaches tokenDiffs to inner diff', () => {
    const tokenDiff: TokenDiff = {
      inner: {id: TEST_TOKEN_ID, speed: 444},
    };
    const remoteDiff = {id: TEST_BOARD_ID};

    const result = BoardDiff.extractRemoteDiff(TEST_BOARD_ID, {
      inner: remoteDiff,
      tokenDiffs: [tokenDiff],
    });
    expect(result?.tokenDiffs).toBeDefined();
    expect(checkDefined(result?.tokenDiffs)[0]).toStrictEqual(tokenDiff.inner);
  });
});

describe('BoardDiff.fromRemoteDiff', () => {
  const tokenDiff: RemoteTokenDiff = {
    id: TEST_TOKEN_ID,
    speed: 444,
  };
  const remoteDiff: RemoteBoardDiff = {
    id: TEST_BOARD_ID,
    tokenDiffs: [tokenDiff],
  };

  const result = BoardDiff.fromRemoteDiff(remoteDiff);
  expect(result).toStrictEqual({
    inner: {
      id: TEST_BOARD_ID,
    },
    tokenDiffs: [{inner: tokenDiff}],
  });
});
