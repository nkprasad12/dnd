import React from 'react';
import {ChatMessage} from '_common/chat/chat_model';

export interface ChatMessageViewProps {
  message: ChatMessage;
}

/** Renders a single chat message. */
export function ChatMessageView(props: ChatMessageViewProps): JSX.Element {
  return (
    <div className="chat-text" style={{wordWrap: 'break-word'}}>
      {props.message.header && (
        <p dangerouslySetInnerHTML={{__html: props.message.header}}></p>
      )}
      <p dangerouslySetInnerHTML={{__html: props.message.body}}></p>
    </div>
  );
}
