import React, {useEffect, useReducer, useState} from 'react';
import {ChatClient} from '_client/chat_box/chat_client';
import {ChatMessageView} from '_client/chat_box/chat_message_view';
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
  const [messages, dispatch] = useReducer(
    (currentMessages: ChatMessage[], newMessage: ChatMessage) =>
      [newMessage].concat(currentMessages),
    []
  );
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const subscription = (message: ChatMessage) => dispatch(message);
    props.chatClient.then((client) => client.getMessageUpdates(subscription));
    return () => {
      props.chatClient.then((client) => client.removeListeners());
    };
  }, [props.chatClient]);

  if (!props.visible) {
    return null;
  }
  const onKeyUpHandler: React.KeyboardEventHandler = (event) => {
    if (event.code === 'Enter') {
      const entered = inputText.trim();
      if (entered !== null && entered !== '') {
        const newMessage = {body: entered};
        dispatch(newMessage);
        props.chatClient.then((client) => client.sendMessage(newMessage));
      }
      setInputText('');
      event.preventDefault();
    }
  };
  const chatMessages = messages.map((message, i) => (
    <ChatMessageView message={message} key={messages.length - i} />
  ));
  return (
    <div data-testid="chatMessageView">
      <textarea
        data-testid="chatInput"
        className="chat-input"
        placeholder={INPUT_HINT}
        rows={1}
        onKeyUp={onKeyUpHandler}
        value={inputText}
        onChange={(event) => {
          setInputText(event.target.value);
        }}
      />
      <div style={messageContainerStyle} data-testid="messageHolder">
        {chatMessages}
      </div>
    </div>
  );
}
