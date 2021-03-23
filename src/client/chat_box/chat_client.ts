import {Socket} from '_client/server/socket';
import * as Events from '_common/chat/chat_events';
import {ChatMessage, isChatMessage} from '_common/chat/chat_model';

export type MessageListener = (message: ChatMessage) => any;

/** Sends and receives game board messages to the server. */
export class ChatClient {
  constructor(private readonly socket: Socket) {}

  removeListeners(): void {
    this.socket.removeAllListeners();
  }

  sendMessage(message: ChatMessage): void {
    this.socket.emit(Events.NEW_MESSAGE, message);
  }

  getMessageUpdates(listener: MessageListener): void {
    this.socket.on(Events.NEW_MESSAGE, (update) => {
      if (isChatMessage(update)) {
        listener(update);
        return;
      }
      throw new Error('Received invalid chat message!');
    });
  }
}
