import {RemoteBoardDiff, RemoteBoardModel} from '_common/board/remote_board_model';
import {Socket_} from '_client/server/socket_connection';
import * as Events from '_common/socket/board_events';

export type BoardUpateListener = (diff: RemoteBoardDiff) => any;

/** Sends and receives game board messages to the server. */
export class BoardServer {
  constructor(private readonly socket: Socket_) {}

  updateBoard(diff: RemoteBoardDiff): void {
    this.socket.emit(Events.BOARD_UPDATE, diff);
  }

  createBoard(model: RemoteBoardModel): void {
    this.socket.emit(Events.BOARD_CREATE_REQUEST, model);
  }

  getRemoteUpdates(listener: BoardUpateListener): void {
    this.socket.on(
        Events.BOARD_UPDATE,
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
        Events.BOARD_UPDATE,
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
      this.socket.emit(Events.BOARD_GET_REQUEST, id);
      this.socket.on(
          Events.BOARD_GET_RESPONSE,
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
      this.socket.emit(Events.BOARD_GET_ALL_REQUEST, 'pls');
      this.socket.on(
          Events.BOARD_GET_ALL_RESPONSE,
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

  async requestActiveBoardId(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.BOARD_GET_ACTIVE_REQUEST, 'pls');
      this.socket.on(
          Events.BOARD_GET_ACTIVE_RESPONSE,
          (response) => {
            if (response === 'ERROR') {
              reject(new Error('Server error on requestActiveBoardId'));
            }
            resolve(response as string);
          },
      );
    });
  }

  setActiveBoard(id: string): void {
    this.socket.emit(Events.BOARD_SET_ACTIVE, id);
  }
}
