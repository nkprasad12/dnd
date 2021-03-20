export abstract class Socket {
  constructor(readonly nsp: string) {}

  /** Represents socket.on */
  abstract on(eventName: string, callback: (arg: any) => any): void;

  /** Represents socket.emit */
  abstract emit(eventName: string, message: any): void;

  /** Represents socket.removeAllListeners */
  abstract removeAllListeners(): void;
}
