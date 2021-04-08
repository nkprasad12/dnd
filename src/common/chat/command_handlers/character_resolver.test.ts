import {CharacterResolver} from '_common/chat/command_handlers/character_resolver';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {CharacterSheetData} from '_common/character_sheets/types';
import {
  BOBBY_DATA,
  BOBBY_SHEET,
  BRUTUS_DATA,
  BRUTUS_SHEET,
} from '_common/character_sheets/test_data';

class FakeLoader {
  readonly data: Map<string, CharacterSheetData> = new Map();

  constructor() {
    this.data = new Map();
    this.data.set(BRUTUS_SHEET, BRUTUS_DATA);
    this.data.set(BOBBY_SHEET, BOBBY_DATA);
  }

  async load(sheetId: string): Promise<CharacterSheetData> {
    const name = this.data.get(sheetId);
    if (name === undefined) {
      throw new Error('Sheet did not exist');
    }
    return name;
  }
}

function getCache(): CharacterSheetCache {
  const loader = new FakeLoader();
  return CharacterSheetCache.create((id) => loader.load(id));
}

test('getCache on empty cache has no results', async (done) => {
  const cache = getCache();
  const resolver = CharacterResolver.create(cache);

  const result = resolver.complete('');
  expect(result.length).toBe(0);
  done();
});

test('getCache returns none on different input', async (done) => {
  const cache = getCache();
  await cache.load(BRUTUS_SHEET);
  const resolver = CharacterResolver.create(cache);

  const result = resolver.complete('c');
  expect(result.length).toBe(0);
  done();
});

test('getCache on returns on result', async (done) => {
  const cache = getCache();
  await cache.load(BRUTUS_SHEET);
  const resolver = CharacterResolver.create(cache);

  const result = resolver.complete('Brut');
  expect(result.length).toBe(1);
  expect(result[0]).toBe(BRUTUS_DATA);
  done();
});

test('getCache ignores case', async (done) => {
  const cache = getCache();
  await cache.load(BRUTUS_SHEET);
  const resolver = CharacterResolver.create(cache);

  const result = resolver.complete('brut');
  expect(result.length).toBe(1);
  expect(result[0]).toBe(BRUTUS_DATA);
  done();
});

test('getCache ambiguous returns correct result', async (done) => {
  const cache = getCache();
  await cache.load(BRUTUS_SHEET);
  await cache.load(BOBBY_SHEET);
  const resolver = CharacterResolver.create(cache);

  const result = resolver.complete('B');
  expect(result.length).toBe(2);
  expect(result).toContain(BOBBY_DATA);
  expect(result).toContain(BRUTUS_DATA);
  done();
});

test('getCache load only after returns correct result', async (done) => {
  const cache = getCache();
  const resolver = CharacterResolver.create(cache);
  await cache.load(BOBBY_SHEET);

  const result = resolver.complete('B');
  expect(result.length).toBe(1);
  expect(result).toContain(BOBBY_DATA);
  done();
});

test('getCache one before one after correct result', async (done) => {
  const cache = getCache();
  await cache.load(BRUTUS_SHEET);
  const resolver = CharacterResolver.create(cache);
  await cache.load(BOBBY_SHEET);

  const result = resolver.complete('B');
  expect(result.length).toBe(2);
  expect(result).toContain(BOBBY_DATA);
  expect(result).toContain(BRUTUS_DATA);
  done();
});
