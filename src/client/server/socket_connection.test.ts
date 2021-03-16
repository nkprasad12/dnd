import io from 'socket.io-client';
import {FakeSocket} from '_client/server/fake_connection';
import {connectTo} from '_client/server/socket_connection';

jest.mock('socket.io-client');

test('connectTo uses correct namespace', async (done) => {
  (io as any).mockReturnValue(new FakeSocket('test'));
  const socketNamespace = 'Tiberius';
  const connection = await connectTo(socketNamespace);

  expect(connection.nsp).toBe(socketNamespace);
  done();
});

test('connectTo socket emit invokes underlying io socket', async (done) => {
  const eventName = 'PPMD Kreygasm';
  const message = 'Stack it up';
  const socket = new FakeSocket('test');
  (io as any).mockReturnValue(socket);
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
  const socket = new FakeSocket('test');
  (io as any).mockReturnValue(socket);
  const socketNamespace = 'Tiberius';
  const connection = await connectTo(socketNamespace);

  connection.on(eventName, listener);
  expect(socket.onMap.size).toBe(1);
  socket.onMap.get(eventName)();
  expect(listenerInvoked).toBe(true);
  done();
});
