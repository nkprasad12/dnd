var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RemoteBoardDiff, RemoteBoardModel } from '/static/js/game_board/model/remote_board_model.js';
const BOARD_UPDATE = 'board-update';
const BOARD_CREATE_REQUEST = 'board-create-request';
const BOARD_GET_REQUEST = 'board-get-request';
const BOARD_GET_RESPONSE = 'board-get-response';
const BOARD_GET_ALL_REQUEST = 'board-get-all-request';
const BOARD_GET_ALL_RESPONSE = 'board-get-all-response';
const BOARD_GET_ACTIVE_REQUEST = 'board-get-active-request';
const BOARD_GET_ACTIVE_RESPONSE = 'board-get-active-response';
const BOARD_SET_ACTIVE = 'board-set-active';
/** Sends and receives game board messages to the server. */
export class BoardServer {
    constructor(socket) {
        this.socket = socket;
    }
    updateBoard(diff) {
        this.socket.emit(BOARD_UPDATE, diff);
    }
    createBoard(model) {
        this.socket.emit(BOARD_CREATE_REQUEST, model);
    }
    getRemoteUpdates(listener) {
        this.socket.on(BOARD_UPDATE, (update) => {
            if (RemoteBoardDiff.isValid(update)) {
                listener(update);
                return;
            }
            throw new Error('Received invalid board update!');
        });
    }
    joinBoard(id, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const board = yield this.requestBoard(id);
            this.socket.on(BOARD_UPDATE, (update) => {
                if (!RemoteBoardDiff.isValid(update)) {
                    throw new Error('Received invalid board update!');
                }
                if (update.id != id) {
                    throw new Error('Received update for incorrect board!');
                }
                listener(update);
            });
            return board;
        });
    }
    requestBoard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.socket.emit(BOARD_GET_REQUEST, id);
                this.socket.on(BOARD_GET_RESPONSE, (response) => {
                    if (RemoteBoardModel.isValid(response)) {
                        resolve(response);
                        return;
                    }
                    console.log('Received invalid board - trying to fill defaults');
                    const updatedResponse = RemoteBoardModel.fillDefaults(response);
                    console.log(updatedResponse);
                    if (RemoteBoardModel.isValid(updatedResponse)) {
                        resolve(updatedResponse);
                        return;
                    }
                    reject(new Error('Received invalid board model!'));
                });
            });
        });
    }
    requestBoardOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.socket.emit(BOARD_GET_ALL_REQUEST, 'pls');
                this.socket.on(BOARD_GET_ALL_RESPONSE, (response) => {
                    if (!Array.isArray(response)) {
                        reject(new Error('GET_ALL Received invalid response!'));
                        return;
                    }
                    for (const item of response) {
                        if (typeof item !== 'string') {
                            reject(new Error('GET_ALL Received invalid response!'));
                            return;
                        }
                    }
                    resolve(response);
                });
            });
        });
    }
    requestActiveBoardId() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, _reject) => {
                this.socket.emit(BOARD_GET_ACTIVE_REQUEST, 'pls');
                this.socket.on(BOARD_GET_ACTIVE_RESPONSE, (response) => {
                    resolve(response);
                });
            });
        });
    }
    setActiveBoard(id) {
        this.socket.emit(BOARD_SET_ACTIVE, id);
    }
}
