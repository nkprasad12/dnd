export class Maybe<T> {

  static of<U>(item: U): Maybe<U> {
    return new Maybe(item);
  }

  static absent<U>(): Maybe<U> {
    return new Maybe(<U><unknown>null);
  }

  private item: T;

  constructor(item: T) {
    this.item = item;
  }

  get(): T {
    return this.item;
  }

  present(): boolean {
    return this.item != null;
  }
}