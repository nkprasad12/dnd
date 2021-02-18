import {Socket_} from '/src/server/socket_connection';

const TAG = '[LocalConnection]';

export class LocalConnection extends Socket_ {
  on(namespace: string, _callback: (arg: any) => any): void {
    console.log('%s [%s] Unexpected message received!', TAG, namespace);
  }

  emit(namespace: string, message: any): void {
    console.log('%s [%s] Sending: %s', TAG, namespace, message);
  }
}
