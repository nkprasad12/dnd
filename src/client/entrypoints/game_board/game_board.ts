import {BoardModel} from '_client/game_board/model/board_model';
import {connectTo} from '_client/server/socket_connection';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardClient} from '_client/game_board/remote/board_client';
import {getElementById, removeChildrenOf} from '_client/common/ui_util';
import {addLabel, TEXT_COLOR} from '_client/board_tools/board_form';
import {ChatClient} from '_client/chat_box/chat_client';
import {ChatBox} from '_client/chat_box/chat_box';

const MAIN_BOARD_STUB = 'mainBoard';

async function loadActiveBoard(): Promise<void> {
  setLabel('Connecting to game server');
  const server = await boardClientPromise;
  const boardId = await server.requestActiveBoardId();
  if (boardId === undefined) {
    setLabel('Either there is no active board, or an error occurred.');
    return;
  }
  setLabel('Retrieving active board data');
  const remoteModel = await server.requestBoard(boardId);
  setLabel('Loading images (may take a few moments)');
  const model = await BoardModel.createFromRemote(remoteModel);
  removeChildrenOf(MAIN_BOARD_STUB);
  new GameBoard(MAIN_BOARD_STUB, model, server);
}

function setLabel(message: string) {
  removeChildrenOf(MAIN_BOARD_STUB);
  addLabel(getElementById(MAIN_BOARD_STUB), message, TEXT_COLOR);
}

const boardClientPromise = BoardClient.get();

connectTo('chat').then((socket) => {
  const client = new ChatClient(socket);
  ChatBox.initialize(client);
});

loadActiveBoard();
