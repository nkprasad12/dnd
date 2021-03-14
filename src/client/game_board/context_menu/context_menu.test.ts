import {ContextMenu} from '_client/game_board/context_menu/context_menu';
import {ContextMenuView} from '_client/game_board/context_menu/context_menu_view';

jest.mock('_client/game_board/context_menu/context_menu_view');
const MockView = ContextMenuView as jest.Mocked<typeof ContextMenuView>;

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  // @ts-ignore
  MockView.mockClear();
});

test('create makes a new ContextMenuView', () => {
  ContextMenu.create(undefined as any, () => {});
  expect(MockView).toHaveBeenCalledTimes(1);
});

// TODO: Figure out how to mock LoadedImage so we can create a mock BoardModel.
