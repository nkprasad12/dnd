import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {
  CATEGORY_TOKENS,
  CATEGORY_ZOOM,
  ContextMenuView,
} from '_client/game_board/context_menu/context_menu_view';
import {BoardModel} from '_client/game_board/model/board_model';
import {createBoardModel} from '_client/game_board/model/test_constants';
import {FakeImage} from '_client/utils/fake_image';
import {DEFAULT_LOCATION} from '_common/board/test_constants';
import {Location} from '_common/coordinates';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

async function boardModelWithMenu(
  selectionStart?: Location
): Promise<BoardModel> {
  return (await createBoardModel()).mergedWith({
    localSelection: {
      area: {start: selectionStart ?? DEFAULT_LOCATION, end: DEFAULT_LOCATION},
    },
    contextMenuState: {isVisible: true, clickPoint: {x: 1, y: 1}},
  });
}

it('does not render menu if disabled  in model', async (done) => {
  const boardModel = await createBoardModel();
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);
  expect(screen.queryByTestId('ContextMenu')).toBeNull();
  done();
});

it('renders menu but without submenus if enabled', async (done) => {
  const boardModel = await boardModelWithMenu();
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);
  expect(screen.getByText(CATEGORY_ZOOM)).toBeDefined();
  expect(screen.queryByText(ContextMenuItem.ZoomIn)).toBeNull();
  expect(screen.queryByText(ContextMenuItem.ZoomOut)).toBeNull();
  expect(screen.getByText(CATEGORY_TOKENS)).toBeDefined();
  expect(screen.queryByText(ContextMenuItem.AddToken)).toBeNull();
  done();
});

it('does not render categories with no options', async (done) => {
  const boardModel = await boardModelWithMenu({col: 0, row: 0});
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);
  expect(screen.getByText(CATEGORY_ZOOM)).toBeDefined();
  expect(screen.queryByText(CATEGORY_TOKENS)).toBeNull();
  done();
});

it('renders submenus on mouseover', async (done) => {
  const boardModel = await boardModelWithMenu();
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);
  const zoomCategory = screen.getByText(CATEGORY_ZOOM);

  act(() => {
    fireEvent.mouseEnter(zoomCategory, {});
  });

  const zoomIn = screen.getByText(ContextMenuItem.ZoomIn);
  expect(zoomIn).toBeDefined();
  expect(zoomIn.getBoundingClientRect().left).toBe(
    zoomCategory.getBoundingClientRect().right
  );
  expect(zoomIn.getBoundingClientRect().top).toBe(
    zoomCategory.getBoundingClientRect().top
  );
  expect(screen.getByText(ContextMenuItem.ZoomOut)).toBeDefined();
  done();
});

it('top level menu is no-op on click', async (done) => {
  const boardModel = await boardModelWithMenu();
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);

  act(() => {
    fireEvent.contextMenu(screen.getByText(CATEGORY_ZOOM), {});
  });
  act(() => {
    fireEvent.click(screen.getByText(CATEGORY_ZOOM), {});
  });

  expect(screen.getByText(CATEGORY_ZOOM)).toBeDefined();
  expect(screen.queryByText(ContextMenuItem.ZoomIn)).toBeNull();
  expect(screen.queryByText(ContextMenuItem.ZoomOut)).toBeNull();
  done();
});

it('hides submenus on mouseleave', async (done) => {
  const boardModel = await boardModelWithMenu();
  render(<ContextMenuView boardModel={boardModel} clickListener={() => {}} />);
  const zoomCategory = screen.getByText(CATEGORY_ZOOM);

  act(() => {
    fireEvent.mouseEnter(zoomCategory, {});
  });
  act(() => {
    fireEvent.mouseLeave(zoomCategory, {});
  });

  expect(screen.queryByText(ContextMenuItem.ZoomIn)).toBeNull();
  expect(screen.queryByText(ContextMenuItem.ZoomOut)).toBeNull();
  done();
});

it('notifies listener on main button click', async (done) => {
  const boardModel = await boardModelWithMenu();
  const listener = jest.fn((item: ContextMenuItem) => item);
  render(<ContextMenuView boardModel={boardModel} clickListener={listener} />);
  act(() => {
    fireEvent.mouseEnter(screen.getByText(CATEGORY_ZOOM), {});
  });
  act(() => {
    fireEvent.click(screen.getByText(ContextMenuItem.ZoomIn), {button: 0});
  });

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(ContextMenuItem.ZoomIn);
  done();
});

it('is no op on other click', async (done) => {
  const boardModel = await boardModelWithMenu();
  const listener = jest.fn((item: ContextMenuItem) => item);
  render(<ContextMenuView boardModel={boardModel} clickListener={listener} />);
  act(() => {
    fireEvent.mouseEnter(screen.getByText(CATEGORY_ZOOM), {});
  });
  act(() => {
    fireEvent.click(screen.getByText(ContextMenuItem.ZoomIn), {button: 3});
  });

  expect(listener).toHaveBeenCalledTimes(0);
  done();
});
