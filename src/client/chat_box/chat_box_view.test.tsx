import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';

import {ChatClient} from '_client/chat_box/chat_client';
import {connectTo} from '_client/server/socket_connection';
import {FakeConnection} from '_client/server/__mocks__/fake_connection';
import {NEW_MESSAGE} from '_common/chat/chat_events';
import {ChatBoxView} from './chat_box_view';

jest.mock('_client/server/socket_connection');

beforeEach(() => {
  FakeConnection.resetAllSockets();
});

const NITIN_WAS_HERE = 'Nitin was here';

test('does not render in DOM when visible is false', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={false} chatClient={chatClient} />);
  expect(() => screen.getByTestId('chatMessageView')).toThrow();
});

test('renders in DOM when visible is true', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);

  expect(screen.getByTestId('chatMessageView')).toBeDefined();
  expect(screen.getByTestId('chatInput')).toBeDefined();
  expect(screen.getByTestId('messageHolder')).toBeDefined();
});

test('renders components when visible', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);

  expect(screen.getByTestId('chatInput')).toBeDefined();
  expect(screen.getByTestId('messageHolder')).toBeDefined();
});

test('renders empty message container on initial creation', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);

  const messageHolder = screen.getByTestId('messageHolder')!;
  expect(messageHolder!.childElementCount).toBe(0);
});

test('adds non-whitespace input message', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);
  const textArea = screen.getByTestId('chatInput') as HTMLTextAreaElement;
  act(() => {
    fireEvent.change(textArea, {target: {value: NITIN_WAS_HERE}});
  });
  act(() => {
    fireEvent.keyUp(textArea, {keyCode: '13', code: 'Enter'});
  });

  const messageHolder = screen.getByTestId('messageHolder');
  expect(messageHolder!.childElementCount).toBe(1);
  expect(messageHolder!.firstChild?.textContent).toBe(NITIN_WAS_HERE);
});

test('enter on non enter key is no op', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);
  const textArea = screen.getByTestId('chatInput') as HTMLTextAreaElement;
  act(() => {
    fireEvent.change(textArea, {target: {value: NITIN_WAS_HERE}});
  });
  act(() => {
    fireEvent.keyUp(textArea, {keyCode: '12'});
  });

  const messageHolder = screen.getByTestId('messageHolder');
  expect(messageHolder!.childElementCount).toBe(0);
  expect(textArea.value).toBe(NITIN_WAS_HERE);
});

test('enter on whitespace input only resets textarea', () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);
  const textArea = screen.getByTestId('chatInput') as HTMLTextAreaElement;
  act(() => {
    fireEvent.change(textArea, {target: {value: '  '}});
  });
  act(() => {
    fireEvent.keyUp(textArea, {keyCode: '13', code: 'Enter'});
  });

  const messageHolder = screen.getByTestId('messageHolder');
  expect(messageHolder!.childElementCount).toBe(0);
  expect(textArea.value).toBe('');
});

test('enter in input sends socket message', async () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);
  const textArea = screen.getByTestId('chatInput') as HTMLTextAreaElement;
  await chatClient;
  const socket = FakeConnection.getFakeSocket('chat')!;
  const newMessage = socket.getEmitMessagePromise(NEW_MESSAGE);
  act(() => {
    fireEvent.change(textArea, {target: {value: NITIN_WAS_HERE}});
  });
  act(() => {
    fireEvent.keyUp(textArea, {keyCode: '13', code: 'Enter'});
  });

  return expect(newMessage).resolves.toStrictEqual({body: NITIN_WAS_HERE});
});

test('listens for message updates on the socket', async (done) => {
  const message = {body: NITIN_WAS_HERE};
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  render(<ChatBoxView visible={true} chatClient={chatClient} />);
  await chatClient;
  act(() => {
    const socket = FakeConnection.getFakeSocket('chat')!;
    socket.onMap.get(NEW_MESSAGE)(message);
  });

  const messageHolder = screen.getByTestId('messageHolder')!;
  expect(messageHolder!.childElementCount).toBe(1);
  expect(messageHolder!.firstChild!.textContent).toBe(NITIN_WAS_HERE);
  done();
});

test('removes listeners from the socket on unmount', async () => {
  const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
  const {unmount} = render(
    <ChatBoxView visible={true} chatClient={chatClient} />
  );
  await chatClient;
  const removedListeners = FakeConnection.getFakeSocket(
    'chat'
  )!.getRemoveListenersPromise();
  unmount();

  return expect(removedListeners).resolves.toBe(1);
});
