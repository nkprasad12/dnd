import io from 'socket.io-client';
import {connectTo, Socket} from '_client/server/socket_connection';

jest.mock('socket.io-client');

class FakeSocket extends Socket {
  readonly emitMap: Map<string, any> = new Map();
  readonly onMap: Map<string, any> = new Map();

  emit(eventName: string, message: any): void {
    this.emitMap.set(eventName, message);
  }
  on(eventName: string, eventCallback: (message: any) => any) {
    if (eventName === 'connect') {
      // @ts-ignore
      eventCallback();
      return;
    }
    this.onMap.set(eventName, eventCallback);
  }
}

test('connectTo uses correct namespace', async (done) => {
  // @ts-expect-error
  io.mockReturnValue(new FakeSocket());
  const socketNamespace = 'Tiberius';
  const connection = await connectTo(socketNamespace);

  // @ts-expect-error
  expect(connection.namespace).toBe(socketNamespace);
  done();
});

test('connectTo socket emit invokes underlying io socket', async (done) => {
  const eventName = 'PPMD Kreygasm';
  const message = 'Stack it up';
  const socket = new FakeSocket();
  // @ts-expect-error
  io.mockReturnValue(socket);
  const socketNamespace = 'Tiberius';
  const connection = await connectTo(socketNamespace);

  connection.emit(eventName, message);
  expect(socket.emitMap.size).toBe(1);
  expect(socket.emitMap.get(eventName)).toBe(message);
  done();
});

test('connectTo socket on invokes passed listener', async (done) => {
  const eventName = 'PPMD Kreygasm';
  let listenerInvoked = false;
  const listener = () => {
    listenerInvoked = true;
  };
  const socket = new FakeSocket();
  // @ts-expect-error
  io.mockReturnValue(socket);
  const socketNamespace = 'Tiberius';
  const connection = await connectTo(socketNamespace);

  connection.on(eventName, listener);
  expect(socket.onMap.size).toBe(1);
  socket.onMap.get(eventName)();
  expect(listenerInvoked).toBe(true);
  done();
});
