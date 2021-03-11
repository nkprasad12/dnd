import {BoardUpdateForm, NewBoardForm} from '_client/board_tools/board_form';
import {BoardSelector, idSelector} from '_client/board_tools/board_selector';
import {getElementById, removeChildrenOf} from '_client/common/ui_util';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardModel} from '_client/game_board/model/board_model';
import {RemoteBoardModel} from '_common/board/remote_board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {DropdownSelector} from '_client/common/ui_components/dropdown';

const NEW_BOARD_BUTTON = 'createNewBoard';
const SAVE_BOARD_BUTTON = 'saveNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const PREVIEW_BOARD_STUB = 'previewBoardStub';

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

async function saveBoard(model: RemoteBoardModel): Promise<void> {
  const server = await serverPromise;
  server.createBoard(model);
}

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

function setupEditing(model: BoardModel): void {
  removeChildrenOf(PREVIEW_BOARD_STUB);
  const board = GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
  const saveButton = getElementById(SAVE_BOARD_BUTTON);
  saveButton.style.display = 'initial';
  saveButton.onclick = () => {
    const remoteModel = board.getRemoteModel();
    saveBoard(remoteModel);
    selectorsPromise.then((selectors) => selectors.add(remoteModel.id));
  };
  removeChildrenOf(EDITING_AREA_STUB);
  BoardUpdateForm.create(EDITING_AREA_STUB, (data) => {
    board.updateForEditor(data);
  });
}
