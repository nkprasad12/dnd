import {
  RemoteBoardDiff,
  RemoteBoardModel,
} from '_common/board/remote_board_model';
import {connectTo, Socket} from '_client/server/socket_connection';
import * as Events from '_common/board/board_events';
import {TokenData} from '_common/board/token_data';
import {LocalConnection} from '_client/server/local_connection';

export type BoardUpateListener = (diff: RemoteBoardDiff) => any;

/** Sends and receives game board messages to the server. */
export class BoardClient {
  private static client: Promise<BoardClient> | undefined;
  static get(): Promise<BoardClient> {
    if (this.client === undefined) {
      this.client = connectTo('board').then(
        (socket) => new BoardClient(socket)
      );
    }
    return this.client;
  }

  static getLocal(): BoardClient {
    return new BoardClient(new LocalConnection());
  }

  private constructor(private readonly socket: Socket) {}

  updateBoard(diff: RemoteBoardDiff): void {
    this.socket.emit(Events.BOARD_UPDATE, diff);
  }

  createBoard(model: RemoteBoardModel): void {
    this.socket.emit(Events.BOARD_CREATE_REQUEST, model);
  }

  getRemoteUpdates(listener: BoardUpateListener): void {
    this.socket.on(Events.BOARD_UPDATE, (update) => {
      if (RemoteBoardDiff.isValid(update)) {
        listener(update);
        return;
      }
      throw new Error('Received invalid board update!');
    });
  }

  async joinBoard(
    id: string,
    listener: BoardUpateListener
  ): Promise<RemoteBoardModel> {
    const board = await this.requestBoard(id);
    this.socket.on(Events.BOARD_UPDATE, (update) => {
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
      this.socket.on(Events.BOARD_GET_RESPONSE, (response) => {
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
  }

  async requestBoardOptions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.BOARD_GET_ALL_REQUEST, 'pls');
      this.socket.on(Events.BOARD_GET_ALL_RESPONSE, (response) => {
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
      });
    });
  }

  async requestAllTokens(): Promise<TokenData[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.TOKENS_GET_ALL_REQUEST, 'pls');
      this.socket.on(Events.TOKENS_GET_ALL_RESPONSE, (response) => {
        if (!Array.isArray(response)) {
          reject(new Error('requestAllTokens received non-array response!'));
          return;
        }
        const data: TokenData[] = [];
        for (const item of response) {
          if (TokenData.isValid(item)) {
            data.push(item);
          } else {
            TokenData.fillDefaults(item);
            if (TokenData.isValid(item)) {
              data.push(item);
            }
          }
        }
        resolve(data);
      });
    });
  }

  async requestActiveBoardId(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.BOARD_GET_ACTIVE_REQUEST, 'pls');
      this.socket.on(Events.BOARD_GET_ACTIVE_RESPONSE, (response) => {
        if (response === 'ERROR') {
          reject(new Error('Server error on requestActiveBoardId'));
        }
        resolve(response as string);
      });
    });
  }

  setActiveBoard(id: string): void {
    this.socket.emit(Events.BOARD_SET_ACTIVE, id);
  }
}
