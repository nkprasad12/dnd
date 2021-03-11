import {Socket} from '_client/server/socket_connection';

const TAG = '[LocalConnection]';

export class LocalConnection extends Socket {
  on(namespace: string): void {
    console.log('%s [%s] Unexpected message received!', TAG, namespace);
  }

  emit(namespace: string, message: any): void {
    console.log('%s [%s] Sending: %s', TAG, namespace, message);
  }
}
