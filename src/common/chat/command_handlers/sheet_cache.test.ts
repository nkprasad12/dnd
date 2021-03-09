import {
  CharacterSheetCache,
  LoadResult,
} from '_common/chat/command_handlers/sheet_cache';
import {CharacterSheetData} from '_common/chat/command_handlers/types';

const CALIGULA_SHEET = 'caligula.sheet';
const CALIGULA_DATA: CharacterSheetData = {
  name: 'Caligula',
  proficiencyBonus: 0,
  saveBonuses: new Map(),
  abilityBonuses: new Map(),
  attackBonuses: new Map(),
  checkBonuses: new Map(),
};
const UPDATED_CALIGULA_DATA: CharacterSheetData = {
  name: 'Gaius',
  proficiencyBonus: 0,
  saveBonuses: new Map(),
  abilityBonuses: new Map(),
  attackBonuses: new Map(),
  checkBonuses: new Map(),
};

const BRUTUS_SHEET = 'brutus.sheet';
const BRUTUS_DATA: CharacterSheetData = {
  name: 'Brutus',
  proficiencyBonus: 0,
  saveBonuses: new Map(),
  abilityBonuses: new Map(),
  attackBonuses: new Map(),
  checkBonuses: new Map(),
};

class FakeLoader {
  readonly data: Map<string, CharacterSheetData> = new Map();
  readonly invocations: Map<string, number> = new Map();

  constructor() {
    this.data = new Map();
    this.data.set(BRUTUS_SHEET, BRUTUS_DATA);
    this.data.set(CALIGULA_SHEET, CALIGULA_DATA);
    this.invocations = new Map();
  }

  async load(sheetId: string): Promise<CharacterSheetData> {
    const callCount = this.invocations.get(sheetId);
    this.invocations.set(sheetId, callCount === undefined ? 1 : callCount + 1);
    const name = this.data.get(sheetId);
    if (name === undefined) {
      throw new Error('Sheet did not exist');
    }
    return name;
  }
}

class FakeListener {
  lastResult: LoadResult | undefined = undefined;
  listener(result: LoadResult): void {
    this.lastResult = result;
  }
}

test('load throws on invalid sheet id', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  try {
    const loadResult = await cache.load('tiberius');
    expect(loadResult).toBeUndefined();
  } catch (error) {
    expect(error).toBeDefined();
  }

  done();
});

test('load loads valid sheet', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  const result = await cache.load(CALIGULA_SHEET);
  expect(result.loadedName).toBe(CALIGULA_DATA.name);
  expect(result.removedName).toBeUndefined();
  done();
});

test('load loads valid sheet', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  expect(cache.getDataForName(CALIGULA_DATA.name)).toBeUndefined();
  await cache.load(CALIGULA_SHEET);
  expect(cache.getDataForName(CALIGULA_DATA.name)).toBe(CALIGULA_DATA);
  done();
});

test('load updates listener', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));
  const listener = new FakeListener();
  cache.addListener((result) => listener.listener(result));

  const result = await cache.load(CALIGULA_SHEET);
  expect(listener.lastResult).toBe(result);
  done();
});

test('load second time returns cached valid sheet', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  await cache.load(CALIGULA_SHEET);
  const result = await cache.load(CALIGULA_SHEET);
  expect(result.loadedName).toBe(CALIGULA_DATA.name.toLowerCase());
  expect(result.removedName).toBeUndefined();
  expect(loader.invocations.get(CALIGULA_SHEET)).toBe(1);
  done();
});

test('load different sheet returns expected sheet', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  await cache.load(CALIGULA_SHEET);
  const result = await cache.load(BRUTUS_SHEET);
  expect(result.loadedName).toBe(BRUTUS_DATA.name);
  expect(result.removedName).toBeUndefined();
  expect(loader.invocations.get(CALIGULA_SHEET)).toBe(1);
  expect(loader.invocations.get(BRUTUS_SHEET)).toBe(1);
  done();
});

test('getNames returns expected', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  await cache.load(CALIGULA_SHEET);
  await cache.load(BRUTUS_SHEET);

  const names = cache.getNames();
  expect(names.length).toBe(2);
  expect(names).toContain(CALIGULA_DATA.name.toLowerCase());
  expect(names).toContain(BRUTUS_DATA.name.toLowerCase());
  done();
});

test('load second time forces reload cached valid sheet', async (done) => {
  const loader = new FakeLoader();
  const cache = new CharacterSheetCache((id) => loader.load(id));

  await cache.load(CALIGULA_SHEET);
  loader.data.set(CALIGULA_SHEET, UPDATED_CALIGULA_DATA);
  const result = await cache.load(CALIGULA_SHEET, true);
  expect(loader.invocations.get(CALIGULA_SHEET)).toBe(2);
  expect(result.loadedName).toBe(UPDATED_CALIGULA_DATA.name);
  expect(result.removedName).toBe(CALIGULA_DATA.name.toLowerCase());
  done();
});
