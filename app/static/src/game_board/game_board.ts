import {BoardModel} from '/src/game_board/model/board_model';
import {connectTo} from '/src/server/socket_connection';
import {GameBoard} from '/src/game_board/controller/game_board';
import {BoardServer} from '/src/game_board/remote/board_server';

const GAME_HOLDER_STUB = 'canvasHolder';

async function loadActiveBoard(): Promise<GameBoard> {
  const server = await serverPromise;
  const boardId = await server.requestActiveBoardId();
  const remoteModel = await server.requestBoard(boardId);
  const model = await BoardModel.createFromRemote(remoteModel);
  return new GameBoard(GAME_HOLDER_STUB, model, server);
}

const serverPromise =
    connectTo('board').then((socket) => new BoardServer(socket));

loadActiveBoard();
