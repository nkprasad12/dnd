import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ContextActionHandler} from '_client/game_board/controller/context_action_handler';
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
  remoteTokenModel,
  TEST_TOKEN_ID,
} from '_common/board/test_constants';
import {Location, Point} from '_common/coordinates';
import {prefer} from '_common/verification';

const handleContextAction = jest.fn(() => {
  return {
    peekDiff: {
      area: {
        start: {col: 0, row: 0},
        end: {col: 0, row: 0},
      },
      value: true,
    },
  };
});
jest.mock('_client/game_board/controller/context_action_handler', () => {
  return {
    ContextActionHandler: jest.fn().mockImplementation(() => {
      return {
        handleContextMenuAction: handleContextAction,
      };
    }),
  };
});
const MockActionHandler = ContextActionHandler as jest.Mocked<
  typeof ContextActionHandler
>;

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
  handleContextAction.mockClear();
  (MockActionHandler as any).mockClear();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

function tileToPoint(tileSize: number, tile: Location) {
  return {
    x: tile.col * tileSize + tileSize / 2,
    y: tile.row * tileSize + tileSize / 2,
  };
}

const DEFAULT_TILE_SIZE = 10;
const FIRST_TOKEN_TILE = {col: 7, row: 1};
const FIRST_TOKEN_POINT = tileToPoint(DEFAULT_TILE_SIZE, FIRST_TOKEN_TILE);
const FIRST_TOKEN_ID = TEST_TOKEN_ID;
const SECOND_TOKEN_TILE = {col: 8, row: 9};
const SECOND_TOKEN_POINT = tileToPoint(DEFAULT_TILE_SIZE, SECOND_TOKEN_TILE);
const SECOND_TOKEN_ID = 'AlbertPercival';

async function modelHandler(
  modelParams?: RemoteModelParameters,
  scrollOffset?: {left: number; top: number}
): Promise<ModelHandler> {
  const firstToken = remoteTokenModel();
  (firstToken as any).location = FIRST_TOKEN_TILE;
  const secondToken = remoteTokenModel();
  (secondToken as any).id = SECOND_TOKEN_ID;
  (secondToken as any).location = SECOND_TOKEN_TILE;
  const base = remoteBoardModel(
    prefer(modelParams, {
      tileSizeOverride: DEFAULT_TILE_SIZE,
      gridOffsetOverride: {x: 0, y: 0},
      widthOverride: 100,
      tokensOverride: [firstToken, secondToken],
    })
  );
  const model = await BoardModel.createFromRemote(base);
  const modelTokens = model.inner.tokens;
  expect(modelTokens.length).toBe(2);
  expect(modelTokens).toContain(firstToken);
  expect(modelTokens).toContain(secondToken);

  const view: any = {
    topCanvas: {
      getBoundingClientRect: () => prefer(scrollOffset, {left: 0, top: 0}),
    },
  };
  return new ModelHandler(model, view);
}

interface TestObjects {
  machine: InteractionStateMachine;
  handler: ModelHandler;
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
    machine: new InteractionStateMachine({
      modelHandler: handler,
      chatClient: {} as any,
      controller: {} as any,
    }),
    handler: handler,
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
  button: number,
  testObjects?: TestObjects
): Promise<TestObjects> {
  const objects =
    testObjects === undefined ? await setupObjects() : testObjects;
  await objects.machine.onDragEvent(clickData(from), clickData(to), button);
  return objects;
}

async function click(
  point: Point,
  button: number,
  testObjects?: TestObjects
): Promise<TestObjects> {
  return drag(point, point, button, testObjects);
}

describe('InteractionStateMachine from default state', () => {
  const FIRST_TILE = {col: 0, row: 0};

  it('opens context menu on left click not on token', async (done) => {
    const clickPoint = {x: 5, y: 5};
    const objects = await click(clickPoint, 0);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: clickPoint},
      localSelection: {area: {start: FIRST_TILE, end: FIRST_TILE}},
    };
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('picks up token on token click', async (done) => {
    const objects = await click(FIRST_TOKEN_POINT, 0);

    const expectedDiff: BoardDiff = {
      tokenDiffs: [{isActive: true, inner: {id: FIRST_TOKEN_ID}}],
    };
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('opens context menu on right click', async (done) => {
    const clickPoint = {x: 5, y: 5};
    const objects = await click(clickPoint, 2);

    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: true, clickPoint: clickPoint},
      localSelection: {area: {start: FIRST_TILE, end: FIRST_TILE}},
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
      localSelection: {area: {start: FIRST_TILE, end: {col: 0, row: 1}}},
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
      localSelection: {area: {start: FIRST_TILE, end: {col: 0, row: 1}}},
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

describe('InteractionStateMachine from picked up state', () => {
  async function pickUpToken(): Promise<TestObjects> {
    const objects = await click(FIRST_TOKEN_POINT, 0);
    objects.diffListener.mockClear();
    expect(objects.handler.activeTokenIndex()).toBe(0);
    return objects;
  }

  function expectTokenDeselected(objects: TestObjects): void {
    const expectedDiff: BoardDiff = {
      tokenDiffs: [
        {
          isActive: false,
          inner: {id: FIRST_TOKEN_ID},
        },
      ],
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
  }

  it('throws on context menu click', async (done) => {
    const objects = await pickUpToken();

    expect(() =>
      objects.machine.onContextMenuClick(ContextMenuItem.AddFog)
    ).toThrow();
    expect(objects.diffListener).toHaveBeenCalledTimes(0);
    done();
  });

  it('drops token on tile click', async (done) => {
    const objects = await pickUpToken();
    const clickPoint = {x: 35, y: 25};
    await click(clickPoint, 0, objects);

    const expectedDiff: BoardDiff = {
      tokenDiffs: [
        {
          isActive: false,
          inner: {id: FIRST_TOKEN_ID, location: {col: 3, row: 2}},
        },
      ],
    };
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });

  it('deselects token when clicking on another token', async (done) => {
    const objects = await pickUpToken();
    await click(SECOND_TOKEN_POINT, 0, objects);
    expectTokenDeselected(objects);
    done();
  });

  it('deselects token on right click', async (done) => {
    const objects = await pickUpToken();
    const clickPoint = {x: 35, y: 25};
    await click(clickPoint, 2, objects);

    expectTokenDeselected(objects);
    done();
  });

  it('deselects token on left drag', async (done) => {
    const objects = await pickUpToken();
    const clickPoint = {x: 35, y: 25};
    await drag({x: 45, y: 45}, clickPoint, 0, objects);

    expectTokenDeselected(objects);
    done();
  });

  it('deselects token on right drag', async (done) => {
    const objects = await pickUpToken();
    const clickPoint = {x: 35, y: 25};
    await drag({x: 45, y: 45}, clickPoint, 2, objects);

    expectTokenDeselected(objects);
    done();
  });
});

describe('InteractionStateMachine from context menu state', () => {
  const DRAG_START: Point = {x: 55, y: 55};
  const DRAG_END: Point = {x: 25, y: 25};

  function expectContextMenuDismissed(objects: TestObjects): void {
    const expectedDiff: BoardDiff = {
      contextMenuState: {isVisible: false, clickPoint: DRAG_END},
      localSelection: {},
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
  }

  async function openContextMenu(): Promise<TestObjects> {
    const objects = await click(DRAG_END, 2);
    objects.diffListener.mockClear();
    expect(objects.handler.getModel().contextMenuState.isVisible).toBe(true);
    return objects;
  }

  it('dismisses on left click', async (done) => {
    const objects = await openContextMenu();
    await click(DRAG_END, 0, objects);
    expectContextMenuDismissed(objects);
    done();
  });

  it('dismisses on right click', async (done) => {
    const objects = await openContextMenu();
    await click(DRAG_END, 2, objects);
    expectContextMenuDismissed(objects);
    done();
  });

  it('dismisses on left drag', async (done) => {
    const objects = await openContextMenu();
    await drag(DRAG_START, DRAG_END, 0, objects);
    expectContextMenuDismissed(objects);
    done();
  });

  it('dismisses on right drag', async (done) => {
    const objects = await openContextMenu();
    await drag(DRAG_START, DRAG_END, 2, objects);
    expectContextMenuDismissed(objects);
    done();
  });

  it('invokes context action handler on context menu action', async (done) => {
    const objects = await openContextMenu();
    await objects.machine.onContextMenuClick(ContextMenuItem.AddFog);
    expect(handleContextAction).toHaveBeenCalledTimes(1);
    expect(handleContextAction).toHaveBeenCalledWith(ContextMenuItem.AddFog);
    done();
  });

  it('has expected diff on context menu action', async (done) => {
    const objects = await openContextMenu();
    await objects.machine.onContextMenuClick(ContextMenuItem.AddFog);

    const expectedDiff: BoardDiff = {
      // These are expected from closing the menu
      contextMenuState: {isVisible: false, clickPoint: {x: 0, y: 0}},
      localSelection: {},
      // This is what the mock returns
      peekDiff: {
        area: {
          start: {col: 0, row: 0},
          end: {col: 0, row: 0},
        },
        value: true,
      },
    };
    expect(objects.diffListener).toHaveBeenCalledTimes(1);
    expect(objects.diffListener).toHaveBeenCalledWith(expectedDiff);
    done();
  });
});
