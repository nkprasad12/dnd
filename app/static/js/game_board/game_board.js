var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BoardModel } from '/static/js/game_board/model/board_model.js';
import { connectTo } from '/static/js/server/socket_connection.js';
import { GameBoard } from '/static/js/game_board/controller/game_board.js';
import { BoardServer } from '/static/js/game_board/remote/board_server.js';
const GAME_HOLDER_STUB = 'canvasHolder';
function loadActiveBoard() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield serverPromise;
        const boardId = yield server.requestActiveBoardId();
        const remoteModel = yield server.requestBoard(boardId);
        const model = yield BoardModel.createFromRemote(remoteModel);
        return new GameBoard(GAME_HOLDER_STUB, model, server);
    });
}
const serverPromise = connectTo('board').then((socket) => new BoardServer(socket));
loadActiveBoard();
