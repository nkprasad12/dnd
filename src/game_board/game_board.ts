import {BoardModel} from '/src/game_board/model/board_model';
import {connectTo} from '/src/server/socket_connection';
import {GameBoard} from '/src/game_board/controller/game_board';
import {BoardServer} from '/src/game_board/remote/board_server';
import {removeChildrenOf} from '/src/board_tools/board_selector';
import {getElementById} from '/src/common/common';
import {addLabel, TEXT_COLOR} from '/src/board_tools/board_form';

const GAME_HOLDER_STUB = 'canvasHolder';

async function loadActiveBoard(): Promise<GameBoard> {
  setLabel('Connecting to game server');
  const server = await serverPromise;
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

const serverPromise =
    connectTo('board').then((socket) => new BoardServer(socket));

loadActiveBoard();
