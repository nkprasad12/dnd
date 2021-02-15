/** 
 * Represents a SocketIO io object. Must have run the SocketIO script:
 *
 * <script src="//cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.1/socket.io.js" crossorigin="anonymous"></script>
 * 
 * in any template that directly or indrectly uses this class.
 */
export abstract class Socket_ {

  /** Represents socket.on */
  abstract on(namespace: string, callback: (arg: any) => any): void;

  /** Represents socket.emit */
  abstract emit(namespace: string, message: any): void;
}

class IO_ {
  connect(address: string): Socket_ {
    // @ts-ignore
    return io.connect(address);
  }
}

const baseUrl = 'http://localhost:5000/'

class SocketConnection extends Socket_ {

  socket: Socket_;
  namespace: string;

  constructor(socket: Socket_, namespace: string) {
    super();
    this.socket = socket;
    this.namespace = namespace;
  }

  on(event: string, listener: (message: any) => any): void {
    let namespaceStr = '[' + this.namespace + '] ';
    this.socket.on(
      event,
      (message) => {
        let eventStr = 'Received Event: ' + event + ', ';
        let messageStr = 'message: ' + JSON.stringify(message);
        console.log(namespaceStr + eventStr + messageStr);
        listener(message);
      });
  }

  emit(event: string, message: any): void {
    let namespaceStr = '[' + this.namespace + '] ';
    let eventStr = 'Sending Event: ' + event + ', ';
    let messageStr = 'message: ' + JSON.stringify(message);
    console.log(namespaceStr + eventStr + messageStr);
    this.socket.emit(event, message);
  }
}

export function connectTo(namespace: string): Promise<Socket_> {
  return new Promise((resolve, _reject) => {
    let io_ = new IO_();
    let socket = io_.connect(baseUrl + namespace);
    socket.on('connect', function () {
      console.log('Connected to socket with namespace: ' + namespace);
      resolve(new SocketConnection(socket, namespace));
    });
  });
}
