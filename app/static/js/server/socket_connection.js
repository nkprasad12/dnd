import { getOrigin } from '/static/js/common/common.js';
/**
 * Represents a SocketIO io object. Must have run the SocketIO script:
 *
 * <script
 *    src="//cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.1/socket.io.js"
 *    crossorigin="anonymous">
 * </script>
 *
 * in any template that directly or indrectly uses this class.
 */
export class Socket_ {
}
/** Wrapper around socket.io io variable. */
class IO_ {
    /**
     * Wrapper around io.connect
     * @param {
     */
    connect(address) {
        // @ts-ignore
        return io.connect(address);
    }
}
const baseUrl = getOrigin() + '/';
class SocketConnection extends Socket_ {
    constructor(socket, namespace) {
        super();
        this.socket = socket;
        this.namespace = namespace;
    }
    on(event, listener) {
        const namespaceStr = '[' + this.namespace + '] ';
        this.socket.on(event, (message) => {
            const eventStr = 'Received Event: ' + event + ', ';
            const messageStr = 'message: ' + JSON.stringify(message);
            console.log(namespaceStr + eventStr + messageStr);
            listener(message);
        });
    }
    emit(event, message) {
        const namespaceStr = '[' + this.namespace + '] ';
        const eventStr = 'Sending Event: ' + event + ', ';
        const messageStr = 'message: ' + JSON.stringify(message);
        console.log(namespaceStr + eventStr + messageStr);
        this.socket.emit(event, message);
    }
}
export function connectTo(namespace) {
    return new Promise((resolve, _reject) => {
        const io_ = new IO_();
        const socket = io_.connect(baseUrl + namespace);
        socket.on('connect', function () {
            console.log('Connected to socket with namespace: ' + namespace);
            resolve(new SocketConnection(socket, namespace));
        });
    });
}
