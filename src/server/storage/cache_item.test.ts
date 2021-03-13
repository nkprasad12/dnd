import {checkDefined} from '_common/preconditions';
import {CacheItemFactory} from '_server/storage/cache_item';

const VALID_KEY = 'valid';
const CORRECTABLE_KEY = 'correctable';
const INVALID_KEY = 'invalid';

const VALID_DATA = {value: 57, representation: '57'};
const CORRECTABLE_DATA = {value: 57};
const INVALID_DATA = {notAValue: 57};

const DATA_LOADER: Map<string, string> = new Map([
  [VALID_KEY, JSON.stringify(VALID_DATA)],
  [CORRECTABLE_KEY, JSON.stringify(CORRECTABLE_DATA)],
  [INVALID_KEY, JSON.stringify(INVALID_DATA)],
]);

interface FancyNumber {
  value: number;
  representation: string;
}

class TestCacheItemFactory extends CacheItemFactory<FancyNumber> {
  correctCalls = 0;

  constructor() {
    super('TestCacheItemFactory', (key) =>
      Promise.resolve(checkDefined(DATA_LOADER.get(key)))
    );
  }

  validate(item: any): item is FancyNumber {
    return item.value !== undefined && item.representation !== undefined;
  }

  correct(item: any): void {
    this.correctCalls++;
    if (item.value !== undefined) {
      item.representation = item.value.toString();
    }
  }
}

test('CacheItemFactory create sets correct defaults', () => {
  const factory = new TestCacheItemFactory();
  const data = {value: 57, representation: '57'};
  const result = factory.create('key', data);

  expect(result.data === data).toBe(true);
  expect(result.fileKey).toBe('key');
  expect(result.saveTime).toBeLessThan(result.updateTime);
});

test('CacheItemFactory load valid has expected values', async (done) => {
  const factory = new TestCacheItemFactory();
  const result = await factory.load(VALID_KEY);

  expect(result.data).toStrictEqual(VALID_DATA);
  expect(result.fileKey).toBe(VALID_KEY);
  expect(result.saveTime).toBeGreaterThan(result.updateTime);
  done();
});

test('CacheItemFactory load valid item does not call correct', async (done) => {
  const factory = new TestCacheItemFactory();
  await factory.load(VALID_KEY);

  expect(factory.correctCalls).toBe(0);
  done();
});

test('CacheItemFactory load correctable has expected values', async (done) => {
  const factory = new TestCacheItemFactory();
  const result = await factory.load(CORRECTABLE_KEY);

  expect(result.data).toStrictEqual(VALID_DATA);
  expect(result.fileKey).toBe(CORRECTABLE_KEY);
  expect(result.saveTime).toBeGreaterThan(result.updateTime);
  done();
});

test('CacheItemFactory load correctable calls correct', async (done) => {
  const factory = new TestCacheItemFactory();
  await factory.load(CORRECTABLE_KEY);

  expect(factory.correctCalls).toBe(1);
  done();
});

test('CacheItemFactory load invalid rejects', async () => {
  expect.assertions(1);
  const factory = new TestCacheItemFactory();
  await expect(factory.load(INVALID_KEY)).rejects.toEqual(
    new Error('invalid does not represent a valid TestCacheItemFactory!')
  );
});

test('CacheItemFactory load invalid calls correct', async (done) => {
  const factory = new TestCacheItemFactory();
  try {
    await factory.load(INVALID_KEY);
  } catch {}

  expect(factory.correctCalls).toBe(1);
  done();
});
