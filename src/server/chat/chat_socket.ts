import {Server, Socket} from 'socket.io';

import * as Events from '_common/chat/chat_events';
import {isChatMessage} from '_common/chat/chat_model';

export function registerChatRoutes(ioServer: Server): void {
  // TODO: Look into express-socket.io-session for security.
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
      this.possiblyHandleRoll(message);
    });
  }

  private async possiblyHandleRoll(input: string): Promise<void> {
    if (!isChatMessage(input)) {
      return;
    }
    console.log('possiblyHandleRoll ' + input);
    // resolveRoll(input);
  }

  private registerEventListener(
      event: string, listener: (message: string) => any) {
    this.socket.on(event, (message) => {
      console.log(`[${event}] ${message}`);
      listener(message);
    });
  }
}
