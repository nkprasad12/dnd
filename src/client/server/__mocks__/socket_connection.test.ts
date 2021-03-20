import * as FakeConnection from '_client/server/__mocks__/socket_connection';

const socketNamespace = 'Diocletian';

describe('FakeSocket', () => {
  const EMIT_EVENT = 'CaeserCrossedTheRubicon';
  const EMIT_MESSAGE = 'panic';
  const ON_EVENT = 'TheBritishAreComing';
  const ON_CALLBACK = (message: string) =>
    message === '1' ? 'By Land' : 'By Sea';

  it('has the expected namespace', () => {
    const socket = new FakeConnection.FakeSocket(socketNamespace);
    expect(socket.nsp).toBe(socketNamespace);
  });

  it('notifies callback on connect', () => {
    const socket = new FakeConnection.FakeSocket(socketNamespace);
    const mockCallback = jest.fn(() => {});

    socket.on('connect', mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
    // @ts-expect-error
    expect(mockCallback.mock.calls[0][0]).toBe('connected');
    expect(socket.onMap.size).toBe(0);
  });

  it('adds to map on other events', () => {
    const socket = new FakeConnection.FakeSocket(socketNamespace);
    socket.on(ON_EVENT, ON_CALLBACK);
    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(ON_EVENT)).toBe(ON_CALLBACK);
  });

  it('adds to map on emitted event', () => {
    const socket = new FakeConnection.FakeSocket(socketNamespace);
    socket.emit(EMIT_EVENT, EMIT_MESSAGE);
    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(EMIT_EVENT)).toBe(EMIT_MESSAGE);
  });

  it('resets maps on reset', () => {
    const socket = new FakeConnection.FakeSocket(socketNamespace);
    socket.emit(EMIT_EVENT, EMIT_MESSAGE);
    socket.on(ON_EVENT, ON_CALLBACK);

    socket.reset();
    expect(socket.emitMap.size).toBe(0);
    expect(socket.onMap.size).toBe(0);
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

  it('connectionsOn is incremented for new sockets', async (done) => {
    FakeConnection.invokeBeforeEach();
    expect(FakeConnection.connectionsOn(socketNamespace)).toBe(0);
    await FakeConnection.connectTo(socketNamespace);
    expect(FakeConnection.connectionsOn(socketNamespace)).toBe(1);
    await FakeConnection.connectTo(socketNamespace);
    expect(FakeConnection.connectionsOn(socketNamespace)).toBe(2);
    done();
  });

  it('invokeBeforeEach clears sockets', async (done) => {
    await FakeConnection.connectTo(socketNamespace);
    FakeConnection.invokeBeforeEach();
    expect(FakeConnection.getFakeSocket(socketNamespace)).toBe(undefined);
    done();
  });

  it('invokeBeforeEach clears connection counts', async (done) => {
    FakeConnection.invokeBeforeEach();
    await FakeConnection.connectTo(socketNamespace);
    FakeConnection.invokeBeforeEach();
    expect(FakeConnection.connectionsOn(socketNamespace)).toBe(0);
    done();
  });

  it('resetAllSockets clears socket state', async (done) => {
    FakeConnection.invokeBeforeEach();
    const socket = await FakeConnection.connectTo(socketNamespace);
    socket.emit('Hello', 'hi');
    FakeConnection.resetAllSockets();

    expect(FakeConnection.connectionsOn(socketNamespace)).toBe(1);
    expect(FakeConnection.getFakeSocket(socketNamespace)).toBe(socket);
    expect((socket as FakeConnection.FakeSocket).onMap.size).toBe(0);
    done();
  });
});
