import { Socket_ } from '/static/js/server/socket_connection.js';
const TAG = '[LocalConnection]';
export class LocalConnection extends Socket_ {
    on(namespace, _callback) {
        console.log('%s [%s] Unexpected message received!', TAG, namespace);
    }
    emit(namespace, message) {
        console.log('%s [%s] Sending: %s', TAG, namespace, message);
    }
}
