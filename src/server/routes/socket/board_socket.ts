import {Server, Socket} from 'socket.io';

import * as Events from '_common/board/board_events';
import {RemoteBoardDiff, RemoteBoardModel} from '_common/board/remote_board_model';


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
    return connection;
  }

  private readonly loader: any;

  private constructor(private readonly socket: Socket) {
    console.log('New connection on namespace: board');
    // this.loader = whatever
  }

  private handleUpdates() {
    this.registerEventListener(Events.BOARD_UPDATE, (message) => {
      if (!RemoteBoardDiff.isValid(message)) {
        console.log('Received invalid board update - ignoring.');
        return;
      }
      this.socket.broadcast.emit(Events.BOARD_UPDATE, message);
      const board: RemoteBoardModel = this.loader.retrieveBoard(message.id);
      this.loader.saveBoard(RemoteBoardModel.mergedWith(board, message));
    });
  }

  private handleCreateRequests() {
    this.registerEventListener(Events.BOARD_CREATE_REQUEST, (message) => {
      this.loader.saveBoard(message);
    });
  }

  private handleGetRequests() {
    this.registerEventListener(Events.BOARD_GET_REQUEST, (message) => {
      const board = this.loader.retrieveBoard(message);
      console.log(`[${Events.BOARD_GET_ALL_RESPONSE}] board ${board.id}`);
      this.socket.broadcast.emit(Events.BOARD_GET_RESPONSE, board);
    });
  }

  private handleGetAllRequests() {
    this.registerEventListener(Events.BOARD_GET_ALL_REQUEST, (message) => {
      const boardList = this.loader.retrieveAllBoardIds(message);
      console.log(`Sending [${Events.BOARD_GET_ALL_RESPONSE}] ${boardList}`);
      this.socket.broadcast.emit(Events.BOARD_GET_ALL_RESPONSE, boardList);
    });
  }

  private handleGetActiveRequests() {
    this.registerEventListener(Events.BOARD_GET_ACTIVE_REQUEST, (message) => {
      let activeBoard = this.loader.getActiveBoard(message);
      if (activeBoard === undefined) {
        activeBoard = 'ERROR';
      }
      console.log(
          `[${Events.BOARD_GET_ACTIVE_RESPONSE}] sending ${activeBoard}`);
      this.socket.broadcast.emit(Events.BOARD_GET_ACTIVE_RESPONSE, activeBoard);
    });
  }

  private handleSetActiveRequests() {
    this.registerEventListener(Events.BOARD_SET_ACTIVE, (message) => {
      this.loader.setActiveBoard(message);
    });
  }

  private registerEventListener(
      event: string, listener: (message: string) => any) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${message}`);
      listener(message);
    });
  }
}
