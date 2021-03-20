import {Hideable} from '_client/common/ui_components/hideable';
import * as UiUtil from '_client/common/ui_util';
import {ChatMessage} from '_common/chat/chat_model';

const INPUT_HINT = 'Type !help for commands';
const SIDE_PANEL = 'sidePanelContent';

export class ChatBoxView implements Hideable {
  static create(
    parent: HTMLElement,
    listener: (message: ChatMessage) => any
  ): ChatBoxView {
    return new ChatBoxView(parent, listener);
  }

  static createDefault(listener: (message: ChatMessage) => any): ChatBoxView {
    return ChatBoxView.create(UiUtil.getElementById(SIDE_PANEL), listener);
  }

  private input: HTMLTextAreaElement;
  private messages: HTMLDivElement;
  private root: HTMLElement;

  private constructor(
    private readonly parent: HTMLElement,
    listener: (message: ChatMessage) => any
  ) {
    this.root = document.createElement('div');
    this.input = UiUtil.addTextArea(this.root, 'chat-input', INPUT_HINT, 1);
    this.messages = UiUtil.addDiv(this.root);
    this.messages.style.overflowY = 'auto';
    this.messages.style.height = '100%';
    this.input.onkeyup = (event) => {
      console.log(event);
      if (event.code === 'Enter') {
        const entered = this.input.value.trim();
        if (entered !== '') {
          console.log(this.input.value.length);
          const newMessage = {body: entered};
          this.addMessage(newMessage);
          listener(newMessage);
        }
        this.input.value = '';
        event.preventDefault();
      }
    };
  }

  addMessage(content: ChatMessage): void {
    const message = UiUtil.prependDiv(this.messages, 'chat-text');
    message.style.wordWrap = 'break-word';
    if (content.header) {
      UiUtil.addParagraph(message, content.header);
    }
    UiUtil.addParagraph(message, content.body);
  }

  show(): void {
    this.parent.appendChild(this.root);
  }

  hide(): void {
    this.parent.removeChild(this.root);
  }
}
