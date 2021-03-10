import {checkDefined} from '_common/preconditions';
import {StorageCache} from '_server/storage/cache';
import {CacheItemFactory} from '_server/storage/cache_item';

interface FancyNumber {
  value: number;
  representation: string;
}

class TestCacheItemFactory extends CacheItemFactory<FancyNumber> {
  correctCalls = 0;

  constructor(storageMap: RefCountMap) {
    super('TestCacheItemFactory', (key) =>
      Promise.resolve(checkDefined(storageMap.get(key)))
    );
  }

  validate(item: any): item is FancyNumber {
    return item.value !== undefined && item.representation !== undefined;
  }

  correct(): void {}
}

interface TestItems {
  cache: StorageCache<FancyNumber>;
  storageMap: RefCountMap;
}

class RefCountMap {
  readonly storageMap: Map<string, string> = new Map();
  readonly getCount: Map<string, number> = new Map();
  readonly saveCount: Map<string, number> = new Map();

  get(key: string): string | undefined {
    let count = this.getCount.get(key);
    if (count === undefined) {
      count = 0;
    }
    this.getCount.set(key, count + 1);
    return this.storageMap.get(key);
  }

  set(key: string, value: string): void {
    let count = this.saveCount.get(key);
    if (count === undefined) {
      count = 0;
    }
    this.saveCount.set(key, count + 1);
    this.storageMap.set(key, value);
  }

  fetchCount(key: string): number {
    const mapCount = this.getCount.get(key);
    return mapCount === undefined ? 0 : mapCount;
  }

  persistCount(key: string): number {
    const mapCount = this.saveCount.get(key);
    return mapCount === undefined ? 0 : mapCount;
  }
}

beforeEach(() => {
  jest.useFakeTimers();
});

function setupTest(): TestItems {
  const storageMap = new RefCountMap();
  const factory = new TestCacheItemFactory(storageMap);
  const cache = StorageCache.create('FancyNumber', factory, (key, data) =>
    storageMap.set(key, JSON.stringify(data))
  );
  return {
    cache: cache,
    storageMap: storageMap,
  };
}

const KEY = 'key';
const ZERO = {value: 0, representation: '0'};

test('initial setup schedules initial timer', () => {
  setupTest();
  expect(setTimeout).toHaveBeenCalledTimes(1);
});

test('timer repeats', () => {
  setupTest();
  jest.runOnlyPendingTimers();
  // TODO: figure out why this is 3.
  expect(setTimeout).toHaveBeenCalledTimes(3);
});

test('addNew with existing key fails', async (done) => {
  const {cache} = setupTest();
  cache.addNew(KEY, ZERO);

  let threw = false;
  try {
    await cache.addNew(KEY, ZERO);
  } catch {
    threw = true;
  }
  expect(threw).toBe(true);
  done();
});

test('addNew then get returns added item', async (done) => {
  const {storageMap, cache} = setupTest();
  cache.addNew(KEY, ZERO);

  const result = await cache.get(KEY);
  expect(result).toBe(ZERO);
  expect(storageMap.fetchCount(KEY)).toBe(0);
  done();
});

test('addNew eventually persists item', async (done) => {
  const {storageMap, cache} = setupTest();
  await cache.addNew(KEY, ZERO);

  jest.runOnlyPendingTimers();
  expect(storageMap.get(KEY)).toBe(JSON.stringify(ZERO));
  done();
});

test('get not cached returns item from storage', async (done) => {
  const {storageMap, cache} = setupTest();
  storageMap.set(KEY, JSON.stringify(ZERO));

  const result = await cache.get(KEY);
  expect(result).toStrictEqual(ZERO);
  expect(storageMap.fetchCount(KEY)).toBe(1);
  done();
});

test('get repeated times fetches only once', async (done) => {
  const {storageMap, cache} = setupTest();
  storageMap.set(KEY, JSON.stringify(ZERO));

  await cache.get(KEY);
  await cache.get(KEY);
  await cache.get(KEY);

  expect(storageMap.fetchCount(KEY)).toBe(1);
  done();
});

test('get from storage does not save without update', async (done) => {
  const {storageMap, cache} = setupTest();
  storageMap.set(KEY, JSON.stringify(ZERO));
  expect(storageMap.persistCount(KEY)).toBe(1);

  await cache.get(KEY);
  jest.runOnlyPendingTimers();

  expect(storageMap.persistCount(KEY)).toBe(1);
  done();
});

test('get from storage saves after update', async (done) => {
  const {storageMap, cache} = setupTest();
  storageMap.set(KEY, JSON.stringify(ZERO));
  expect(storageMap.persistCount(KEY)).toBe(1);
  const updated = {value: 1, representation: '1'};

  await cache.get(KEY);
  await cache.update(KEY, updated);
  jest.runOnlyPendingTimers();

  expect(storageMap.persistCount(KEY)).toBe(2);
  done();
});

test('update new item then get returns added item', async (done) => {
  const {cache} = setupTest();
  await cache.update(KEY, ZERO);

  const result = await cache.get(KEY);
  expect(result).toBe(ZERO);
  done();
});

test('update existing item updates item', async (done) => {
  const {cache} = setupTest();
  const updated = {value: 1, representation: '1'};

  await cache.update(KEY, ZERO);
  await cache.update(KEY, updated);

  const result = await cache.get(KEY);
  expect(result).toBe(updated);
  done();
});

test('update eventually persists last update', async (done) => {
  const {storageMap, cache} = setupTest();
  const updated = {value: 1, representation: '1'};

  await cache.update(KEY, ZERO);
  await cache.update(KEY, updated);

  jest.runOnlyPendingTimers();
  expect(storageMap.get(KEY)).toBe(JSON.stringify(updated));
  done();
});
