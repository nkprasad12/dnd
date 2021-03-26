import {BoardUpdateForm, NewBoardForm} from '_client/board_tools/board_form';
import {BoardSelector, idSelector} from '_client/board_tools/board_selector';
import {ChatClient} from '_client/chat_box/chat_client';
import {DropdownSelector} from '_client/common/ui_components/dropdown';
import * as UiUtil from '_client/common/ui_util';
import {
  ACTIVE_SELECTOR_STUB,
  BOARD_FORM_STUB,
  EDITING_AREA_STUB,
  EDIT_SELECTOR_STUB,
  NEW_BOARD_BUTTON,
} from '_client/entrypoints/main/board_tools';
import {loadBoard} from '_client/entrypoints/main/game_board';
import {MAIN_BOARD_STUB} from '_client/entrypoints/main/main';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardModel} from '_client/game_board/model/board_model';
import {BoardClient} from '_client/game_board/remote/board_client';

class BoardSelectors {
  constructor(
    private readonly activeSelector: DropdownSelector<string>,
    private readonly editSelector: DropdownSelector<string>
  ) {}

  add(id: string): void {
    this.activeSelector.add(idSelector(id, false));
    this.editSelector.add(idSelector(id, true));
  }
}

export function setupEditorPanel(chatClient: Promise<ChatClient>): void {
  async function setupSelectors(): Promise<BoardSelectors> {
    const server = await BoardClient.get();
    const boards = server.requestBoardOptions();
    const activeSelector = BoardSelector.createActiveBoardSelector(
      UiUtil.getElementById(ACTIVE_SELECTOR_STUB),
      server,
      boards
    );
    const editSelector = BoardSelector.createEditBoardSelector(
      UiUtil.getElementById(EDIT_SELECTOR_STUB),
      (selectedId) => {
        loadBoard(selectedId).then((board) => setupEditing(board));
      },
      boards
    );
    return new BoardSelectors(activeSelector, editSelector);
  }

  async function setupEditing(model: BoardModel): Promise<void> {
    UiUtil.removeChildrenOf(MAIN_BOARD_STUB);
    const board = GameBoard.create(
      MAIN_BOARD_STUB,
      model,
      await BoardClient.get(),
      await chatClient
    );
    (await BoardClient.get()).createBoard(model.inner);
    selectors.then((selectors) => selectors.add(model.inner.id));
    UiUtil.removeChildrenOf(EDITING_AREA_STUB);
    BoardUpdateForm.create(
      UiUtil.getElementById(EDITING_AREA_STUB),
      board.modelHandler,
      (data) => {
        board.updateGridParameters(data);
      }
    );
  }

  const selectors = setupSelectors();
  NewBoardForm.createOnClick(
    UiUtil.getElementById(NEW_BOARD_BUTTON),
    UiUtil.getElementById(BOARD_FORM_STUB),
    (model) => {
      setupEditing(model);
    }
  );
}
