import React, {useEffect, useState} from 'react';
import {ChatClient} from '_client/chat_box/chat_client';
import {ChatMessage} from '_common/chat/chat_model';

const INPUT_HINT = 'Type !help for commands';

const messageContainerStyle: React.CSSProperties = {
  overflowY: 'auto',
  height: '100%',
};

export interface ChatBoxViewProps {
  visible: boolean;
  chatClient: Promise<ChatClient>;
}

export function ChatBoxView(props: ChatBoxViewProps): JSX.Element | null {
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const subscription = (message: ChatMessage) =>
      setMessages([message].concat(messages));
    props.chatClient.then((client) => client.getMessageUpdates(subscription));
    return () => {
      props.chatClient.then((client) => client.removeListeners());
    };
  }, [props.chatClient, messages]);

  if (!props.visible) {
    return null;
  }
  const onKeyUpHandler: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      const entered = inputText.trim();
      if (entered !== null && entered !== '') {
        const newMessage = {body: entered};
        setMessages([newMessage].concat(messages));
        props.chatClient.then((client) => client.sendMessage(newMessage));
      }
      setInputText('');
      event.preventDefault();
    }
  };
  const chatMessages = messages.map((message) => (
    <ChatMessageView message={message} />
  ));
  return (
    <div>
      <textarea
        className="chat-input"
        placeholder={INPUT_HINT}
        rows={1}
        onKeyUp={onKeyUpHandler}
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value);
        }}
      />
      <div style={messageContainerStyle}>{chatMessages}</div>
    </div>
  );
}

interface ChatMessageViewProps {
  message: ChatMessage;
}

function ChatMessageView(props: ChatMessageViewProps): JSX.Element {
  return (
    <div className="chat-text" style={{wordWrap: 'break-word'}}>
      {props.message.header && (
        <p dangerouslySetInnerHTML={{__html: props.message.body}}></p>
      )}
      <p dangerouslySetInnerHTML={{__html: props.message.body}}></p>
    </div>
  );
}
