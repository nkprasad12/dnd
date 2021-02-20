import {RemoteBoardDiff, RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {Socket_} from '/src/server/socket_connection';

const BOARD_UPDATE = 'board-update';
const BOARD_CREATE_REQUEST = 'board-create-request';

const BOARD_GET_REQUEST = 'board-get-request';
const BOARD_GET_RESPONSE = 'board-get-response';

const BOARD_GET_ALL_REQUEST = 'board-get-all-request';
const BOARD_GET_ALL_RESPONSE = 'board-get-all-response';

export type BoardUpateListener = (diff: RemoteBoardDiff) => any;

/** Sends and receives game board messages to the server. */
export class BoardServer {
  constructor(private readonly socket: Socket_) {}

  updateBoard(diff: RemoteBoardDiff): void {
    this.socket.emit(BOARD_UPDATE, diff);
  }

  createBoard(model: RemoteBoardModel): void {
    this.socket.emit(BOARD_CREATE_REQUEST, model);
  }

  getRemoteUpdates(listener: BoardUpateListener): void {
    this.socket.on(
        BOARD_UPDATE,
        (update) => {
          if (RemoteBoardDiff.isValid(update)) {
            listener(update);
            return;
          }
          throw new Error('Received invalid board update!');
        });
  }

  async joinBoard(
      id: string, listener: BoardUpateListener): Promise<RemoteBoardModel> {
    const board = await this.requestBoard(id);
    this.socket.on(
        BOARD_UPDATE,
        (update) => {
          if (!RemoteBoardDiff.isValid(update)) {
            throw new Error('Received invalid board update!');
          }
          if (update.id != id) {
            throw new Error('Received update for incorrect board!');
          }
          listener(update);
        });
    return board;
  }

  async requestBoard(id: string): Promise<RemoteBoardModel> {
    return new Promise((resolve, reject) => {
      this.socket.emit(BOARD_GET_REQUEST, id);
      this.socket.on(
          BOARD_GET_RESPONSE,
          (response) => {
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
          })
      ;
    });
  }

  async requestBoardOptions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(BOARD_GET_ALL_REQUEST, 'pls');
      this.socket.on(
          BOARD_GET_ALL_RESPONSE,
          (response) => {
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
            resolve(response as string[]);
          })
      ;
    });
  }
}
