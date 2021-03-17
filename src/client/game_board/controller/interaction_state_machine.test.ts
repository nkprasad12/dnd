import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {BaseClickData} from '_client/game_board/controller/input_listener';
import {InteractionStateMachine} from '_client/game_board/controller/interaction_state_machine';
import {
  ModelHandler,
  UpdateListener,
} from '_client/game_board/controller/model_handler';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {FakeImage} from '_client/utils/fake_image';
import {
  remoteBoardModel,
  RemoteModelParameters,
  TEST_TOKEN_ID,
} from '_common/board/test_constants';
import {Point} from '_common/coordinates';
import {prefer} from '_common/verification';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

async function modelHandler(
  modelParams?: RemoteModelParameters,
  scrollOffset?: {left: number; top: number}
): Promise<ModelHandler> {
  const base = remoteBoardModel(
    prefer(modelParams, {
      tileSizeOverride: 10,
      gridOffsetOverride: {x: 0, y: 0},
      widthOverride: 100,
    })
  );
  const model = BoardModel.createFromRemote(base);
  const view: any = {
    topCanvas: {
      getBoundingClientRect: () => prefer(scrollOffset, {left: 0, top: 0}),
    },
  };
  return new ModelHandler(await model, view);
}

interface TestObjects {
  machine: InteractionStateMachine;
  diffListener: jest.Mock<BoardDiff, BoardDiff[]>;
}

async function setupObjects(
  modelParams?: RemoteModelParameters
): Promise<TestObjects> {
  const handler = await modelHandler(modelParams);
  const mockListener = jest.fn((diff) => diff);
  handler.addListeners([
    UpdateListener.forAll((_model, diff) => mockListener(diff)),
  ]);
  mockListener.mockClear();
  return {
    machine: new InteractionStateMachine(handler),
    diffListener: mockListener,
  };
}

function clickData(
  clientPoint: Point,
  clientPageOffset?: Point
): BaseClickData {
  const pagePoint = {
    x: clientPoint.x + prefer(clientPageOffset?.x, 0),
    y: clientPoint.y + prefer(clientPageOffset?.y, 0),
  };
  return {
    clientPoint: clientPoint,
    pagePoint: pagePoint,
  };
}

async function drag(
  from: Point,
  to: Point,
  button: number
): Promise<TestObjects> {
  const objects = await setupObjects();
  await objects.machine.onDragEvent(clickData(from), clickData(to), button);
  return objects;
}

async function click(point: Point, button: number): Promise<TestObjects> {
  return drag(point, point, button);
}

describe('InteractionStateMachine from default state', () => {
  it('opens context menu on left click not on token', async (done) => {
    const clickPoint = {x: 5, y: 5};
    const objects = await click(clickPoint, 0);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: clickPoint},
      localSelection: [{col: 0, row: 0}],
    };
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('picks up token on token click', async (done) => {
    const clickPoint = {x: 75, y: 15};
    const objects = await click(clickPoint, 0);

    const expectedDiff: BoardDiff = {
      tokenDiffs: [{isActive: true, inner: {id: TEST_TOKEN_ID}}],
    };
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('opens context menu on right click', async (done) => {
    const clickPoint = {x: 5, y: 5};
    const objects = await click(clickPoint, 2);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: clickPoint},
      localSelection: [{col: 0, row: 0}],
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('opens context menu on left drag', async (done) => {
    const from = {x: 5, y: 5};
    const to = {x: 5, y: 15};
    const objects = await drag(from, to, 0);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: to},
      localSelection: [
        {col: 0, row: 0},
        {col: 0, row: 1},
      ],
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('opens context menu on right drag', async (done) => {
    const from = {x: 5, y: 5};
    const to = {x: 5, y: 15};
    const objects = await drag(from, to, 2);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: to},
      localSelection: [
        {col: 0, row: 0},
        {col: 0, row: 1},
      ],
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('is no-op on other clicks', async (done) => {
    const clickPoint = {x: 5, y: 5};
    const objects = await click(clickPoint, 1);
    expect(objects.diffListener).toHaveBeenCalledTimes(0);
    done();
  });

  it('throws on context menu click', async (done) => {
    const objects = await setupObjects();

    expect(() =>
      objects.machine.onContextMenuClick(ContextMenuItem.AddFog)
    ).toThrow();
    expect(objects.diffListener).toHaveBeenCalledTimes(0);
    done();
  });
});
