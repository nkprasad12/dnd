import {BoardUpdateForm, NewBoardForm} from '_client/board_tools/board_form';
import {BoardSelector, idSelector} from '_client/board_tools/board_selector';
import {removeChildrenOf} from '_client/common/ui_util';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardModel} from '_client/game_board/model/board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {DropdownSelector} from '_client/common/ui_components/dropdown';

const NEW_BOARD_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const MAIN_BOARD_STUB = 'mainBoard';

const ACTIVE_SELECTOR_STUB = 'activeSelectorStub';
const EDIT_SELECTOR_STUB = 'editSelectorStub';
const EDITING_AREA_STUB = 'editingAreaStub';

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

const serverPromise = BoardClient.get();

async function loadBoard(boardId: string): Promise<BoardModel> {
  const server = await serverPromise;
  const remoteModel = await server.requestBoard(boardId);
  return BoardModel.createFromRemote(remoteModel);
}

async function setupSelectors(): Promise<BoardSelectors> {
  const server = await serverPromise;
  const boards = server.requestBoardOptions();
  const activeSelector = BoardSelector.createActiveBoardSelector(
    ACTIVE_SELECTOR_STUB,
    server,
    boards
  );
  const editSelector = BoardSelector.createEditBoardSelector(
    EDIT_SELECTOR_STUB,
    (selectedId) => {
      loadBoard(selectedId).then((board) => setupEditing(board));
    },
    boards
  );
  return new BoardSelectors(activeSelector, editSelector);
}

const selectorsPromise = setupSelectors();

NewBoardForm.createOnClick(NEW_BOARD_BUTTON, BOARD_FORM_STUB, (model) => {
  setupEditing(model);
});

async function setupEditing(model: BoardModel): Promise<void> {
  removeChildrenOf(MAIN_BOARD_STUB);
  const board = new GameBoard(MAIN_BOARD_STUB, model, await serverPromise);
  (await serverPromise).createBoard(model.inner);
  selectorsPromise.then((selectors) => selectors.add(model.inner.id));
  removeChildrenOf(EDITING_AREA_STUB);
  BoardUpdateForm.create(EDITING_AREA_STUB, board.modelHandler, (data) => {
    board.updateGridParameters(data);
  });
}
