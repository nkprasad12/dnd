import * as UiUtil from '_client/common/ui_util';


const INPUT_HINT = 'Roll via: [Name] [Command]';
const CHAT_BOX_STUB = 'chatBoxStub';

export interface ChatMessage {
  header?: string;
  body: string;
}

export class ChatBoxView {
  static create(parent: HTMLElement): ChatBoxView {
    return new ChatBoxView(parent);
  }

  static createDefault(): ChatBoxView {
    return ChatBoxView.create(UiUtil.getElementById(CHAT_BOX_STUB));
  }

  private input: HTMLTextAreaElement;
  private messages: HTMLDivElement;

  private constructor(parent: HTMLElement) {
    this.input = UiUtil.addTextArea(parent, 'chat-input', INPUT_HINT, 1);
    this.messages = UiUtil.addDiv(parent);
    this.messages.style.overflowY = 'auto';
    this.messages.style.height = '100%';
    this.input.onkeyup = (event) => {
      console.log(event);
      if (event.code === 'Enter') {
        const entered = this.input.value.trim();
        if (entered !== '') {
          console.log(this.input.value.length);
          this.addMessage({body: entered});
        }
        this.input.value = '';
        event.preventDefault();
      }
    };
  }

  addMessage(content: ChatMessage): void {
    const message = UiUtil.prependDiv(this.messages, 'chat-text');
    if (content.header) {
      UiUtil.addParagraph(message, content.header);
    }
    UiUtil.addParagraph(message, content.body);
  }
}
