import {FakeConnection, FakeSocket} from '_client/server/fake_connection';

const socketNamespace = 'Diocletian';

describe('FakeSocket', () => {
  it('has the expected namespace', () => {
    const socket = new FakeSocket(socketNamespace);
    expect(socket.nsp).toBe(socketNamespace);
  });

  it('notifies callback on connect', () => {
    const socket = new FakeSocket(socketNamespace);
    const mockCallback = jest.fn(() => {});

    socket.on('connect', mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
    // @ts-expect-error
    expect(mockCallback.mock.calls[0][0]).toBe('connected');
    expect(socket.onMap.size).toBe(0);
  });

  it('adds to map on other events', () => {
    const socket = new FakeSocket(socketNamespace);
    const event = 'TheBritishAreComing';
    const callback = (message: string) =>
      message === '1' ? 'By Land' : 'By Sea';

    socket.on(event, callback);
    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(event)).toBe(callback);
  });

  it('adds to map on emitted event', () => {
    const socket = new FakeSocket(socketNamespace);
    const event = 'CaeserCrossedTheRubicon';
    const message = 'panic';

    socket.emit(event, message);
    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(event)).toBe(message);
  });
});

describe('FakeConnection', () => {
  it('connectTo returns socket with expected namespace', async (done) => {
    const socket = await FakeConnection.connectTo(socketNamespace);
    expect(socket.nsp).toBe(socketNamespace);
    done();
  });

  it('connectTo adds socket to available sockets', async (done) => {
    const socket = await FakeConnection.connectTo(socketNamespace);
    expect(FakeConnection.getFakeSocket(socketNamespace)).toBe(socket);
    done();
  });

  it('invokeBeforeEach clears sockets', async (done) => {
    await FakeConnection.connectTo(socketNamespace);
    FakeConnection.invokeBeforeEach();
    expect(FakeConnection.getFakeSocket(socketNamespace)).toBe(undefined);
    done();
  });
});
