/** Represents an item that can be cached. */
export interface CacheItem<T> {
  /** Key for the file to which this item should be persisted. */
  fileKey: string;
  /** When this item was last updated. */
  updateTime: number;
  /** When this item was last saved. */
  saveTime: number;
  /** The data to save. */
  data: T;
}

/** Base factory for creating cache items. */
export abstract class CacheItemFactory<T> {
  constructor(
    private readonly typeName: string,
    private readonly loader: (key: string) => Promise<string>
  ) {}

  /** Validates whether an item is the expected shape. */
  abstract validate(item: any): item is T;

  /** Optional method used to correct invalid loaded items. */
  abstract correct(item: any): void;

  /** Creates a new cache item. */
  create(fileKey: string, data: T): CacheItem<T> {
    return {
      fileKey: fileKey,
      updateTime: Date.now(),
      saveTime: -1,
      data: data,
    };
  }

  /** Loads a cache item from persisted storage. */
  async load(fileKey: string): Promise<CacheItem<T>> {
    const rawData = await this.loader(fileKey);
    const data = JSON.parse(rawData);
    if (!this.validate(data)) {
      this.correct(data);
      if (!this.validate(data)) {
        throw new Error(
          `${fileKey} does not represent a valid ${this.typeName}!`
        );
      }
    }
    const currentTime = Date.now();
    // Make sure it's before the current time.
    const updateTime = currentTime - 1;
    return {
      fileKey: fileKey,
      updateTime: updateTime,
      saveTime: currentTime,
      data: data,
    };
  }
}
