/* istanbul ignore file */

import * as Delegate from '_client/server/socket_connection';
import {FakeSocket} from '_client/server/__mocks__/socket_connection';

export namespace FakeConnection {
  export function connectionsOn(namespace: string): number {
    return (Delegate as any).connectionsOn(namespace);
  }

  export function getFakeSocket(namespace: string): FakeSocket | undefined {
    return (Delegate as any).getFakeSocket(namespace);
  }

  /** Clears the full state of the mock socket class. */
  export function invokeBeforeEach(): void {
    (Delegate as any).invokeBeforeEach();
  }

  /** Resets the state of any created sockets. */
  export function resetAllSockets(): void {
    (Delegate as any).resetAllSockets();
  }
}
