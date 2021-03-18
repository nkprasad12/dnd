import {Socket} from '_client/server/socket';
import {checkDefined} from '_common/preconditions';
import {prefer} from '_common/verification';

const sockets: Map<
  string,
  {socket: FakeSocket; connections: number}
> = new Map();

function clearMap(map: Map<any, any>) {
  const keys = map.keys();
  for (const key of keys) {
    map.delete(key);
  }
}

export function invokeBeforeEach(): void {
  clearMap(sockets);
}

export function resetAllSockets(): void {
  for (const value of sockets.values()) {
    value.socket.reset();
  }
}

export function connectionsOn(namespace: string): number {
  return prefer(sockets.get(namespace)?.connections, 0);
}

export function getFakeSocket(namespace: string): FakeSocket | undefined {
  return sockets.get(namespace)?.socket;
}

/**
  To use this, add to the beginning of the file:
  
  jest.mock('_client/server/socket_connection');

  <p> To access other helpers, use the fake_connection module, which will allow
  using the same instance in the unit test that is used in the real file.
*/
export function connectTo(namespace: string): Promise<Socket> {
  let socket = sockets.get(namespace)?.socket;
  if (socket === undefined) {
    socket = new FakeSocket(namespace);
    sockets.set(namespace, {socket: socket, connections: 1});
  } else {
    const connections = checkDefined(sockets.get(namespace)?.connections);
    sockets.set(namespace, {socket: socket, connections: connections + 1});
  }
  return Promise.resolve(socket);
}

export class FakeSocket extends Socket {
  readonly emitMap: Map<string, any> = new Map();
  readonly onMap: Map<string, any> = new Map();

  constructor(namespace: string) {
    super(namespace);
  }

  emit(eventName: string, message: any): void {
    this.emitMap.set(eventName, message);
  }
  on(eventName: string, eventCallback: (message: any) => any) {
    if (eventName === 'connect') {
      eventCallback('connected');
      return;
    }
    this.onMap.set(eventName, eventCallback);
  }

  reset(): void {
    clearMap(this.emitMap);
    clearMap(this.onMap);
  }
}
