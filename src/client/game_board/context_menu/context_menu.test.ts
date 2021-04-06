import {ContextMenu} from '_client/game_board/context_menu/context_menu';
import {ContextMenuItem as Item} from '_client/game_board/context_menu/context_menu_model';
import {createBoardModel} from '_client/game_board/model/test_constants';
import {FakeImage} from '_client/utils/fake_image';
import {DEFAULT_LOCATION, TEST_BOARD_ID} from '_common/board/test_constants';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

function expectContainsExactly<T>(actual: T[], expected: T[]): void {
  expect(actual.length).toBe(expected.length);
  expectContainsAll(actual, expected);
}

function expectContainsAll<T>(actual: T[], expected: T[]): void {
  for (const item of expected) {
    expect(actual).toContainEqual(item);
  }
}

function expectContainsNone<T>(actual: T[], denyList: T[]): void {
  for (const item of denyList) {
    expect(actual.includes(item)).toBe(false);
  }
}

describe('processModel', () => {
  const ORIGIN = {col: 0, row: 0};
  const TILE = {col: 1, row: 1};

  it('pipes through the context menu model', async (done) => {
    const boardModel = await createBoardModel();
    const [model] = ContextMenu.processModel(boardModel);
    expect(model).toBe(boardModel.contextMenuState);
    done();
  });

  it('with one ordinary tile selected returns expected', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: ORIGIN}},
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsExactly(invalidItems, [
      Item.ClearFog,
      Item.PeekFog,
      Item.UnpeekFog,
      Item.ClearHighlight,
      Item.EditToken,
      Item.CopyToken,
    ]);
    done();
  });

  it('with one tile with token has expected token options', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: DEFAULT_LOCATION, end: DEFAULT_LOCATION}},
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsAll(invalidItems, [Item.AddToken]);
    expectContainsNone(invalidItems, [Item.EditToken, Item.CopyToken]);
    done();
  });

  it('with many tiles selected has expected token options', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: TILE}},
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsAll(invalidItems, [
      Item.AddToken,
      Item.EditToken,
      Item.CopyToken,
    ]);
    done();
  });

  it('with one tile with token has expected token options', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: DEFAULT_LOCATION, end: DEFAULT_LOCATION}},
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsAll(invalidItems, [Item.AddToken]);
    expectContainsNone(invalidItems, [Item.EditToken, Item.CopyToken]);
    done();
  });

  it('with tile with highlight allows clear and all colors', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: ORIGIN}},
      inner: {
        id: TEST_BOARD_ID,
        publicSelectionDiffs: {area: {start: ORIGIN, end: ORIGIN}, value: '1'},
      },
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsNone(invalidItems, [
      Item.ClearHighlight,
      Item.BlueHighlight,
      Item.OrangeHighlight,
      Item.GreenHighlight,
    ]);
    done();
  });

  it('with all full fog tiles allows expected', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: TILE}},
      inner: {
        id: TEST_BOARD_ID,
        fogOfWarDiffs: {area: {start: ORIGIN, end: TILE}, value: '1'},
      },
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsNone(invalidItems, [Item.ClearFog, Item.PeekFog]);
    expectContainsAll(invalidItems, [Item.AddFog, Item.UnpeekFog]);
    done();
  });

  it('with all peeked fog tiles allows expected', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: TILE}},
      peekDiff: {area: {start: ORIGIN, end: TILE}, value: true},
      inner: {
        id: TEST_BOARD_ID,
        fogOfWarDiffs: {area: {start: ORIGIN, end: TILE}, value: '1'},
      },
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsNone(invalidItems, [Item.ClearFog, Item.UnpeekFog]);
    expectContainsAll(invalidItems, [Item.AddFog, Item.PeekFog]);
    done();
  });

  it('with all fog but only some peeked allows expected', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: TILE}},
      peekDiff: {area: {start: ORIGIN, end: ORIGIN}, value: true},
      inner: {
        id: TEST_BOARD_ID,
        fogOfWarDiffs: {area: {start: ORIGIN, end: TILE}, value: '1'},
      },
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsNone(invalidItems, [
      Item.ClearFog,
      Item.PeekFog,
      Item.UnpeekFog,
    ]);
    expectContainsAll(invalidItems, [Item.AddFog]);
    done();
  });

  it('with only some fog tiles allows expected', async (done) => {
    const boardModel = await (await createBoardModel()).mergedWith({
      localSelection: {area: {start: ORIGIN, end: TILE}},
      peekDiff: {area: {start: ORIGIN, end: TILE}, value: true},
      inner: {
        id: TEST_BOARD_ID,
        fogOfWarDiffs: {area: {start: ORIGIN, end: ORIGIN}, value: '1'},
      },
    });

    const [, invalidItems] = ContextMenu.processModel(boardModel);
    expectContainsNone(invalidItems, [Item.ClearFog, Item.AddFog]);
    done();
  });
});
