import {ChatBoxView} from '_client/chat_box/chat_box_view';
import {ChatClient} from '_client/chat_box/chat_client';
import {Hideable} from '_client/common/ui_components/hideable';

export class ChatBox {
  static initialize(client: ChatClient): ChatBox {
    return new ChatBox(client);
  }

  private readonly view: ChatBoxView;

  private constructor(client: ChatClient) {
    this.view = ChatBoxView.createDefault((message) =>
      client.sendMessage(message)
    );
    client.getMessageUpdates((message) => this.view.addMessage(message));
  }

  getHideable(): Hideable {
    return this.view;
  }
}
