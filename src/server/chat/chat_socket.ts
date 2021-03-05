import {Server, Socket} from 'socket.io';

import * as Events from '_common/chat/chat_events';
import {isChatMessage} from '_common/chat/chat_model';
import {commandResolver} from '_common/chat/chat_resolver';
import {CommandType} from '_common/chat/command_parser';
import {loadCommandHandler} from '_common/chat/command_handlers/load_command_handler';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {extractSheetData} from '_server/sheets/sheets';


export function registerChatRoutes(ioServer: Server): void {
  // TODO: Look into express-socket.io-session for security.
  commandResolver().addCommandHandler(
      CommandType.Load,
      loadCommandHandler(CharacterSheetCache.create(extractSheetData)));
  ioServer
      .of('/chat')
      .on('connection', (socket) => ChatSocketServerConnection.create(socket));
}

class ChatSocketServerConnection {
  static create(socket: Socket): ChatSocketServerConnection {
    const connection = new ChatSocketServerConnection(socket);
    connection.handleNewMessages();
    return connection;
  }

  private constructor(private readonly socket: Socket) {
    console.log('New connection on namespace: chat');
  }

  private handleNewMessages() {
    this.registerEventListener(Events.NEW_MESSAGE, (message) => {
      this.socket.broadcast.emit(Events.NEW_MESSAGE, message);
      this.possiblyHandleCommand(message);
    });
  }

  private async possiblyHandleCommand(input: string): Promise<void> {
    if (!isChatMessage(input)) {
      return;
    }
    console.log('possiblyHandleCommand ' + input.body);
    const result = await commandResolver().handleCommand(input.body);
    if (!result) {
      return;
    }
    this.socket.emit(Events.NEW_MESSAGE, result);
    this.socket.broadcast.emit(Events.NEW_MESSAGE, result);
  }

  private registerEventListener(
      event: string, listener: (message: string) => any) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${message}`);
      listener(message);
    });
  }
}
