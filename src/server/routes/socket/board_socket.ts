import {Server, Socket} from 'socket.io';

import * as Events from '_common/board/board_events';
import {
  RemoteBoardDiff,
  RemoteBoardModel,
} from '_common/board/remote_board_model';
import {gameLoader} from '_server/board/game_loader';

export function registerBoardRoutes(ioServer: Server): void {
  // TODO: Look into express-socket.io-session for security.
  ioServer
    .of('/board')
    .on('connection', (socket) => BoardSocketServerConnection.create(socket));
}

class BoardSocketServerConnection {
  static create(socket: Socket): BoardSocketServerConnection {
    const connection = new BoardSocketServerConnection(socket);
    connection.handleUpdates();
    connection.handleCreateRequests();
    connection.handleGetRequests();
    connection.handleGetAllRequests();
    connection.handleGetActiveRequests();
    connection.handleSetActiveRequests();
    connection.handleGetAllTokens();
    return connection;
  }

  private readonly loader = gameLoader();

  private constructor(private readonly socket: Socket) {
    console.log('New connection on namespace: board');
  }

  private handleUpdates() {
    this.registerEventListener(Events.BOARD_UPDATE, (message) => {
      if (!RemoteBoardDiff.isValid(message)) {
        console.log('Received invalid board update - ignoring.');
        return;
      }
      this.socket.broadcast.emit(Events.BOARD_UPDATE, message);
      this.updateLocalBoard(message.id, message);
    });
  }

  private async updateLocalBoard(
    id: string,
    diff: RemoteBoardDiff
  ): Promise<RemoteBoardModel> {
    try {
      let updatedBoard = await this.loader.retrieveBoard(id);
      updatedBoard = RemoteBoardModel.mergedWith(updatedBoard, diff);
      this.loader.saveBoard(updatedBoard);

      return updatedBoard;
    } catch (ex) {
      console.log('TODO: If you see this, ask the client their board.');
      throw new Error('Received update for non-existant board!');
    }
  }

  private handleCreateRequests() {
    this.registerEventListener(Events.BOARD_CREATE_REQUEST, (message) => {
      if (!RemoteBoardModel.isValid(message)) {
        RemoteBoardModel.fillDefaults(message);
        if (!RemoteBoardModel.isValid(message)) {
          console.log('Received invalid board, ignoring!');
          return;
        }
      }
      this.loader.createNewBoard(message);
    });
  }

  private handleGetRequests() {
    this.registerEventListener(Events.BOARD_GET_REQUEST, (message) => {
      this.loader
        .retrieveBoard(message)
        .then((board) => {
          console.log(`[${Events.BOARD_GET_RESPONSE}] board ${board?.id}`);
          this.socket.emit(Events.BOARD_GET_RESPONSE, board);
        })
        .catch((ex) => {
          console.log('NITIN');
          console.log('Something broke.');
          this.socket.emit(Events.BOARD_GET_ERROR, ex.message);
        });
    });
  }

  private handleGetAllRequests() {
    this.registerEventListener(Events.BOARD_GET_ALL_REQUEST, () => {
      this.loader.retrieveAllBoardIds().then((boardList) => {
        console.log(`Sending [${Events.BOARD_GET_ALL_RESPONSE}] ${boardList}`);
        this.socket.emit(Events.BOARD_GET_ALL_RESPONSE, boardList);
      });
    });
  }

  private handleGetActiveRequests() {
    this.registerEventListener(Events.BOARD_GET_ACTIVE_REQUEST, () => {
      this.loader
        .getActiveBoard()
        .catch(() => 'ERROR')
        .then((activeBoard) => {
          console.log(
            `[${Events.BOARD_GET_ACTIVE_RESPONSE}] sending ${activeBoard}`
          );
          this.socket.emit(Events.BOARD_GET_ACTIVE_RESPONSE, activeBoard);
        });
    });
  }

  private handleSetActiveRequests() {
    this.registerEventListener(Events.BOARD_SET_ACTIVE, (message) => {
      this.loader.setActiveBoard(message);
    });
  }

  private handleGetAllTokens() {
    this.registerEventListener(Events.TOKENS_GET_ALL_REQUEST, () => {
      this.loader
        .getAllTokens()
        .catch(() => [])
        .then((tokens) => {
          this.emitAndLog(Events.TOKENS_GET_ALL_RESPONSE, tokens);
        });
    });
  }

  private emitAndLog(event: string, message: any): void {
    console.log(`[${event}] sending ${JSON.stringify(message)}`);
    this.socket.emit(event, message);
  }

  private registerEventListener(
    event: string,
    listener: (message: string) => any
  ) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${JSON.stringify(message)}`);
      listener(message);
    });
  }
}
