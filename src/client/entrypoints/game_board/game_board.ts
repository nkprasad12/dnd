import {BoardModel} from '_client/game_board/model/board_model';
import {connectTo} from '_client/server/socket_connection';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardServer} from '_client/game_board/remote/board_server';
import {removeChildrenOf} from '_client/board_tools/board_selector';
import {getElementById} from '_client/common/ui_util';
import {addLabel, TEXT_COLOR} from '_client/board_tools/board_form';
import {ChatClient} from '_client/chat_box/chat_client';
import {ChatBox} from '_client/chat_box/chat_box';

const GAME_HOLDER_STUB = 'canvasHolder';

async function loadActiveBoard(): Promise<GameBoard> {
  setLabel('Connecting to game server');
  const server = await boardServerPromise;
  const boardId = await server.requestActiveBoardId();
  setLabel('Retrieving active board data');
  const remoteModel = await server.requestBoard(boardId);
  setLabel('Loading images (may take a few moments)');
  const model = await BoardModel.createFromRemote(remoteModel);
  removeChildrenOf(GAME_HOLDER_STUB);
  return new GameBoard(GAME_HOLDER_STUB, model, server);
}

function setLabel(message: string) {
  removeChildrenOf(GAME_HOLDER_STUB);
  addLabel(getElementById(GAME_HOLDER_STUB), message, TEXT_COLOR);
}

const boardServerPromise =
    connectTo('board').then((socket) => new BoardServer(socket));
connectTo('chat')
    .then((socket) => {
      const client = new ChatClient(socket);
      ChatBox.initialize(client);
    });


loadActiveBoard();
