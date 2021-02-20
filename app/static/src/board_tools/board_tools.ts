import {NewBoardForm} from '/src/board_tools/board_form';
import {BoardSelector} from '/src/board_tools/board_selector';
import {getElementById} from '/src/common/common';
import {GameBoard} from '/src/game_board/controller/game_board';
import {BoardModel} from '/src/game_board/model/board_model';
import {RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {BoardServer} from '/src/game_board/remote/board_server';
import {connectTo} from '/src/server/socket_connection';

const NEW_BOARD_BUTTON = 'createNewBoard';
const SAVE_BOARD_BUTTON = 'saveNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const LOAD_BOARD_BUTTON = 'loadBoard';

const PREVIEW_BOARD_STUB = 'previewBoardStub';

const SELECTOR_STUB = 'boardSelectorStub';

const serverPromise =
    connectTo('board').then((socket) => new BoardServer(socket));

NewBoardForm.createOnClick(
    NEW_BOARD_BUTTON, BOARD_FORM_STUB,
    (model) => {
      const board = GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
      const saveButton = getElementById(SAVE_BOARD_BUTTON);
      saveButton.style.display = 'initial';
      saveButton.onclick = () => saveBoard(board.getRemoteModel());
    });

async function saveBoard(model: RemoteBoardModel): Promise<void> {
  const server = await serverPromise;
  server.createBoard(model);
}

function setupLoadButton(): void {
  const boardId = '7078-1613797799655';
  const loadButton = getElementById(LOAD_BOARD_BUTTON);
  loadButton.style.display = 'initial';
  loadButton.onclick = () => loadBoard(boardId);
}

async function loadBoard(boardId: string): Promise<void> {
  const server = await serverPromise;
  const remoteModel = await server.requestBoard(boardId);
  const model = await BoardModel.createFromRemote(remoteModel);

  const board = GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
  const saveButton = getElementById(SAVE_BOARD_BUTTON);
  saveButton.style.display = 'initial';
  saveButton.onclick = () => saveBoard(board.getRemoteModel());
}

async function setupSelector(): Promise<void> {
  const server = await serverPromise;
  BoardSelector.create(SELECTOR_STUB, server);
}


setupLoadButton();
setupSelector();
