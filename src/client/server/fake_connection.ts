import {Socket} from '_client/server/socket';

const sockets: Map<string, FakeSocket> = new Map();

export namespace FakeConnection {
  export function invokeBeforeEach(): void {
    const keys = sockets.keys();
    for (const key of keys) {
      sockets.delete(key);
    }
  }

  export function getFakeSocket(namespace: string): FakeSocket | undefined {
    return sockets.get(namespace);
  }

  /**
    Replace connectTo in tests by adding to the top of the file:

    jest.mock('_client/server/socket_connection', () => {
      return {
        connectTo: FakeConnection.connectTo,
      };
    });
  */
  export function connectTo(namespace: string): Promise<Socket> {
    let socket = sockets.get(namespace);
    if (socket === undefined) {
      socket = new FakeSocket(namespace);
      sockets.set(namespace, socket);
    }
    return Promise.resolve(socket);
  }
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
}
