import {EntityController} from '_client/game_board/controller/entity_controller';
import {
  ModelHandler,
  UpdateListener,
} from '_client/game_board/controller/model_handler';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {
  BoardModelParameters,
  createBoardModel,
} from '_client/game_board/model/test_constants';
import {TokenModel} from '_client/game_board/model/token_model';
import {FakeImage} from '_client/utils/fake_image';
import {
  DEFAULT_LOCATION,
  DEFAULT_SIZE,
  RemoteModelParameters,
  remoteTokenModel,
  TEST_TOKEN_ID,
} from '_common/board/test_constants';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

interface Rect {
  readonly top: number;
  readonly left: number;
}

class FakeView {
  topCanvas: any;

  constructor(rect: Rect = {top: 0, left: 0}) {
    this.topCanvas = {
      getBoundingClientRect: () => rect,
    };
  }
}

async function setupTest(
  remoteModelParams?: RemoteModelParameters,
  boundingRect?: Rect,
  boardModelParams?: BoardModelParameters
): Promise<[EntityController, jest.Mock<BoardDiff, [BoardModel, BoardDiff]>]> {
  const listener = jest.fn((_model: BoardModel, diff: BoardDiff) => diff);
  const boardModel = await createBoardModel(
    remoteModelParams,
    boardModelParams
  );
  const handler = new ModelHandler(boardModel);
  handler.addListeners([UpdateListener.forAll(listener)]);
  listener.mockClear();
  return [
    EntityController.create(handler, new FakeView(boundingRect) as any),
    listener,
  ];
}

describe('addNewToken', () => {
  const JUSTINIAN = 'Justinian';

  it('adds a new token if id is not yet in the board', async (done) => {
    const [controller, listener] = await setupTest();
    const tokenModel = await TokenModel.fromRemote(remoteTokenModel());
    (tokenModel.inner as any).id = JUSTINIAN;
    await controller.addNewToken(tokenModel);

    const tokens = listener.mock.calls[0][0].tokens;
    expect(tokens.length).toBe(2);
    expect(tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(tokens[1].inner.id).toBe(JUSTINIAN);
    expect(listener.mock.calls[0][1].inner?.newTokens).toBeDefined();
    done();
  });

  it('modifies existing token if id is in the board', async (done) => {
    const [controller, listener] = await setupTest();
    const tokenModel = await TokenModel.fromRemote(remoteTokenModel());
    (tokenModel.inner as any).name = JUSTINIAN;
    await controller.addNewToken(tokenModel);

    const tokens = listener.mock.calls[0][0].tokens;
    expect(tokens.length).toBe(1);
    expect(tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(tokens[0].inner.name).toBe(JUSTINIAN);
    expect(listener.mock.calls[0][1].tokenDiffs).toBeDefined();
    done();
  });
});

describe('tileForPoint', () => {
  it('on corner scale 1 and no offset returns expected', async (done) => {
    const point = {x: 0, y: 0};
    const [controller] = await setupTest({gridOffsetOverride: {x: 0, y: 0}});

    const tile = controller.tileForPoint(point);
    expect(tile).toStrictEqual({col: 0, row: 0});
    done();
  });

  it('without flush bounding rect returns expected', async (done) => {
    const point = {x: 0, y: 0};
    const [controller] = await setupTest(
      {gridOffsetOverride: {x: 10, y: 10}},
      {top: 10, left: 10}
    );

    const tile = controller.tileForPoint(point);
    expect(tile).toStrictEqual({col: 0, row: 0});
    done();
  });

  it('on corner scale 1 and no offset returns expected', async (done) => {
    const point = {x: 19, y: 19};
    const [controller] = await setupTest(
      {gridOffsetOverride: {x: 0, y: 0}, tileSizeOverride: 10},
      undefined,
      {scale: 1}
    );

    const tile = controller.tileForPoint(point);
    expect(tile).toStrictEqual({col: 1, row: 1});
    done();
  });

  it('on first tile scale 2 and no offset returns expected', async (done) => {
    const point = {x: 19, y: 19};
    const [controller] = await setupTest(
      {gridOffsetOverride: {x: 0, y: 0}, tileSizeOverride: 10},
      undefined,
      {scale: 2}
    );

    const tile = controller.tileForPoint(point);
    expect(tile).toStrictEqual({col: 0, row: 0});
    done();
  });
});

describe('activeTokenIndex', () => {
  it('Returns undefined if no token is active', async () => {
    const [controller] = await setupTest();
    const result = controller.activeTokenIndex();
    expect(result).toBeUndefined();
  });

  it('Returns index if token is active', async () => {
    const [controller] = await setupTest(undefined, undefined, {
      activeTokenIndex: 0,
    });
    const result = controller.activeTokenIndex();
    expect(result).toBe(0);
  });
});

describe('wouldCollide', () => {
  it('Detects collision on token corner', async () => {
    const [controller] = await setupTest();
    const result = controller.wouldCollide(DEFAULT_LOCATION, 1);
    expect(result).toStrictEqual([0]);
  });

  it('Detects collision on token opposite corner', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE - 1,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE - 1,
    };
    const result = controller.wouldCollide(target, 1);
    expect(result).toStrictEqual([0]);
  });

  it('Detects collision on token corner', async () => {
    const [controller] = await setupTest();
    const result = controller.wouldCollide(DEFAULT_LOCATION, 1);
    expect(result).toStrictEqual([0]);
  });

  it('Does not detect collision before token', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col - 1,
      row: DEFAULT_LOCATION.row - 1,
    };
    const result = controller.wouldCollide(target, 1);
    expect(result).toStrictEqual([]);
  });

  it('Does not detect collision after token', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE,
    };
    const result = controller.wouldCollide(target, 1);
    expect(result).toStrictEqual([]);
  });

  it('Detects collision before token with large target size', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col - 1,
      row: DEFAULT_LOCATION.row - 1,
    };
    const result = controller.wouldCollide(target, 2);
    expect(result).toStrictEqual([0]);
  });

  it('Does not detect collision after token with large target', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE,
    };
    const result = controller.wouldCollide(target, 2);
    expect(result).toStrictEqual([]);
  });
});

describe('collisionIds', () => {
  it('Detects collision on token corner', async () => {
    const [controller] = await setupTest();
    const result = controller.collisionIds(DEFAULT_LOCATION, 1);
    expect(result).toStrictEqual([TEST_TOKEN_ID]);
  });

  it('Detects collision on token opposite corner', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE - 1,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE - 1,
    };
    const result = controller.collisionIds(target, 1);
    expect(result).toStrictEqual([TEST_TOKEN_ID]);
  });

  it('Detects collision on token corner', async () => {
    const [controller] = await setupTest();
    const result = controller.collisionIds(DEFAULT_LOCATION, 1);
    expect(result).toStrictEqual([TEST_TOKEN_ID]);
  });

  it('Does not detect collision before token', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col - 1,
      row: DEFAULT_LOCATION.row - 1,
    };
    const result = controller.collisionIds(target, 1);
    expect(result).toStrictEqual([]);
  });

  it('Does not detect collision after token', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE,
    };
    const result = controller.collisionIds(target, 1);
    expect(result).toStrictEqual([]);
  });

  it('Detects collision before token with large target size', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col - 1,
      row: DEFAULT_LOCATION.row - 1,
    };
    const result = controller.collisionIds(target, 2);
    expect(result).toStrictEqual([TEST_TOKEN_ID]);
  });

  it('Does not detect collision after token with large target', async () => {
    const [controller] = await setupTest();
    const target = {
      col: DEFAULT_LOCATION.col + DEFAULT_SIZE,
      row: DEFAULT_LOCATION.row + DEFAULT_SIZE,
    };
    const result = controller.collisionIds(target, 2);
    expect(result).toStrictEqual([]);
  });
});
