import {
  RemoteBoardDiff,
  RemoteBoardModel,
} from '_common/board/remote_board_model';
import {connectTo} from '_client/server/socket_connection';
import {Socket} from '_client/server/socket';
import * as Events from '_common/board/board_events';
import {TokenData} from '_common/board/token_data';
import {isStringArray} from '_common/verification';

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

  private constructor(private readonly socket: Socket) {}

  removeAllListeners(): void {
    this.socket.removeAllListeners();
  }

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

  async requestBoard(id: string): Promise<RemoteBoardModel> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.BOARD_GET_REQUEST, id);
      this.socket.on(Events.BOARD_GET_RESPONSE, (response) => {
        if (RemoteBoardModel.isValid(response)) {
          resolve(response);
          return;
        }
        console.log('Received invalid board - trying to fill defaults');
        try {
          const updatedResponse = RemoteBoardModel.fillDefaults(response);
          console.log(updatedResponse);
          if (RemoteBoardModel.isValid(updatedResponse)) {
            resolve(updatedResponse);
            return;
          }
        } catch {
          // Intended to fall through to error.
        }
        reject(new Error('Received invalid board model!'));
      });
      this.socket.on(Events.BOARD_GET_ERROR, (ex) => {
        console.log(`Error thrown: ${ex}`);
        reject(new Error(ex));
      });
    });
  }

  async requestBoardOptions(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(Events.BOARD_GET_ALL_REQUEST, 'pls');
      this.socket.on(Events.BOARD_GET_ALL_RESPONSE, (response) => {
        if (!isStringArray(response)) {
          reject(new Error('GET_ALL Received invalid response!'));
          return;
        }
        resolve(response);
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

  async requestActiveBoardId(): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.socket.emit(Events.BOARD_GET_ACTIVE_REQUEST, 'pls');
      this.socket.on(Events.BOARD_GET_ACTIVE_RESPONSE, (response) => {
        if (response === 'ERROR') {
          resolve(undefined);
          return;
        }
        resolve(response as string);
      });
    });
  }

  setActiveBoard(id: string): void {
    this.socket.emit(Events.BOARD_SET_ACTIVE, id);
  }
}
