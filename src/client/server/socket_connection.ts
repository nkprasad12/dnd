import io from 'socket.io-client';

import {getOrigin} from '_client/common/get_origin';

export abstract class Socket {
  /** Represents socket.on */
  abstract on(eventName: string, callback: (arg: any) => any): void;

  /** Represents socket.emit */
  abstract emit(eventName: string, message: any): void;
}

const baseUrl = getOrigin() + '/';

class SocketConnection extends Socket {
  constructor(
    private readonly socket: Socket,
    private readonly namespace: string
  ) {
    super();
  }

  on(event: string, listener: (message: any) => any): void {
    const namespaceStr = '[' + this.namespace + '] ';
    this.socket.on(event, (message) => {
      const eventStr = 'Received Event: ' + event + ', ';
      const messageStr = 'message: ' + JSON.stringify(message);
      console.log(namespaceStr + eventStr + messageStr);
      listener(message);
    });
  }

  emit(event: string, message: any): void {
    const namespaceStr = '[' + this.namespace + '] ';
    const eventStr = 'Sending Event: ' + event + ', ';
    const messageStr = 'message: ' + JSON.stringify(message);
    console.log(namespaceStr + eventStr + messageStr);
    this.socket.emit(event, message);
  }
}

/**
 * Creates a SocketIO connection on the given namespace.
 *
 * See https://socket.io/docs/v3/namespaces/index.html
 */
export function connectTo(namespace: string): Promise<Socket> {
  return new Promise((resolve) => {
    console.log('Trying to connect to: ' + namespace);
    const socket = io(baseUrl + namespace);
    socket.on('connect', () => {
      console.log('Connected to socket with namespace: ' + namespace);
      resolve(new SocketConnection(socket, namespace));
    });
  });
}
