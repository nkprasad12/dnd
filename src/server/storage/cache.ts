import {checkDefined, checkState} from '_common/preconditions';
import {CacheItem, CacheItemFactory} from '_server/storage/cache_item';

const CACHE_SAVE_INTERNAL_MS = 60000;

export type Persister<T> = (key: string, data: T) => any;

export class StorageCache<T> {
  static create<T>(
    typeName: string,
    factory: CacheItemFactory<T>,
    persist: Persister<T>
  ): StorageCache<T> {
    const cache = new StorageCache<T>(typeName, factory, persist);
    console.log(`Created new cache for ${typeName}, setting save timeout`);
    setTimeout(() => cache.save(), CACHE_SAVE_INTERNAL_MS);
    return cache;
  }

  private readonly cache: Map<string, CacheItem<T>> = new Map();

  private constructor(
    private readonly typeName: string,
    private readonly factory: CacheItemFactory<T>,
    private readonly persist: (key: string, data: T) => any
  ) {}

  /**
   * Updates the cache with the data at the given file key.
   *
   * @param key the file key to update.
   * @param data the data to update.
   */
  async update(key: string, data: T): Promise<void> {
    console.log('Cache::update called on key: ' + key);
    try {
      await this.get(key);
    } catch {
      return this.addNew(key, data);
    }
    console.log(`Cache::update found an existing ${this.typeName}`);
    const cacheData = checkDefined(this.cache.get(key));
    const currentTime = Date.now();
    cacheData.data = data;
    cacheData.updateTime = currentTime;
  }

  /**
   * Adds a new item to the cache with the given key.
   *
   * Throws if an item with that key is already in the cache.
   */
  async addNew(key: string, data: T): Promise<void> {
    checkState(
      this.cache.get(key) === undefined,
      `Item with key ${key} is already in the cache!`
    );
    this.cache.set(key, this.factory.create(key, data));
  }

  /**
   * Returns the data stored at the given key.
   *
   * If it is not in the cache, try to load it from storage.
   * If is is not storage, returns a rejected promise.
   */
  async get(key: string): Promise<T> {
    console.log('Cache::get called on key ' + key);
    let result = this.cache.get(key);
    if (result === undefined) {
      console.log('Did not find data in cache - searching storage.');
      const loadedData = await this.factory.load(key);
      this.cache.set(key, loadedData);
      result = loadedData;
    }
    return result.data;
  }

  /** Saves cache items to storage. */
  private save(): void {
    console.log(
      `Checking ${this.typeName} cache for items that need to be saved.`
    );
    this.cache.forEach((cacheData) => {
      if (cacheData.saveTime < cacheData.updateTime) {
        cacheData.saveTime = cacheData.updateTime;
        this.persist(cacheData.fileKey, cacheData.data);
      }
    });
    setTimeout(() => this.save(), CACHE_SAVE_INTERNAL_MS);
  }
}
