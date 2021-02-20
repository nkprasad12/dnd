import {RemoteBoardDiff, RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {Socket_} from '/src/server/socket_connection';

const BOARD_UPDATE = 'board-update';
const BOARD_CREATE_REQUEST = 'board-create-request';
const BOARD_GET_REQUEST = 'board-get-request';
const BOARD_GET_RESPONSE = 'board-get-response';

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
          if (!RemoteBoardDiff.isValid(update)) {
            throw new Error('Received invalid board model!');
          }
          listener(update);
        });
  }

  async joinBoard(
      id: string, listener: BoardUpateListener): Promise<RemoteBoardModel> {
    const board = await this.requestBoard(id);
    this.socket.on(
        BOARD_UPDATE,
        (update) => {
          if (!RemoteBoardDiff.isValid(update)) {
            throw new Error('Received invalid board model!');
          }
          if (update.id != id) {
            throw new Error('Received update for incorrect board!');
          }
          listener(update);
        });
    return board;
  }

  private async requestBoard(id: string): Promise<RemoteBoardModel> {
    return new Promise((resolve, reject) => {
      this.socket.emit(BOARD_GET_REQUEST, id);
      this.socket.on(
          BOARD_GET_RESPONSE,
          (response) => {
            if (!RemoteBoardModel.isValid(response)) {
              reject(new Error('Received invalid board model!'));
            }
            resolve(response as RemoteBoardModel);
          })
      ;
    });
  }
}
