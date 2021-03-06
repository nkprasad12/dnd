import {CommandHandler} from '_common/chat/chat_resolver';
import {attackCommandHandler, checkCommandHandler, saveCommandHandler} from '_common/chat/command_handlers/character_command_handlers';
import {CharacterResolver} from '_common/chat/command_handlers/character_resolver';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {CharacterSheetData} from '_common/chat/command_handlers/types';


const BOBBY_SHEET = 'bobby.sheet';
const BOBBY_DATA: CharacterSheetData = {
  name: 'Bobby Newport',
  proficiencyBonus: 3,
  saveBonuses: new Map([['Dexterity', 0], ['Wisdom', -2]]),
  abilityBonuses: new Map(),
  attackBonuses: new Map([['Words', 1]]),
  checkBonuses: new Map([['Perception', 0], ['Arcana', 1]]),
};

const BRUTUS_SHEET = 'brutus.sheet';
const BRUTUS_DATA: CharacterSheetData = {
  name: 'Brutus',
  proficiencyBonus: 2,
  saveBonuses: new Map([['Dexterity', 3], ['Wisdom', -1]]),
  abilityBonuses: new Map(),
  attackBonuses: new Map([['Longbow', 9], ['Dagger', 3]]),
  checkBonuses: new Map([['Perception', 3], ['Arcana', 1]]),
};

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

async function getResolver(): Promise<CharacterResolver> {
  const loader = new FakeLoader();
  const cache = CharacterSheetCache.create((id) => loader.load(id));
  await cache.load(BRUTUS_SHEET);
  await cache.load(BOBBY_SHEET);
  return CharacterResolver.create(cache);
}

async function saveHandler(): Promise<CommandHandler> {
  return saveCommandHandler(await getResolver());
}

async function checkHandler(): Promise<CommandHandler> {
  return checkCommandHandler(await getResolver());
}

async function attackHandler(): Promise<CommandHandler> {
  return attackCommandHandler(await getResolver());
}


test('saveHandler on invalid formatted input', async (done) => {
  const handler = await saveHandler();

  const result = await handler('not an and in sight');
  expect(result.header).toContain('Invalid');
  done();
});

test('checkHandler on invalid formatted input', async (done) => {
  const handler = await checkHandler();

  const result = await handler('not an and in sight');
  expect(result.header).toContain('Invalid');
  done();
});

test('attackHandler on invalid formatted input', async (done) => {
  const handler = await attackHandler();

  const result = await handler('not an and in sight');
  expect(result.header).toContain('Invalid');
  done();
});


test('saveHandler on invalid character', async (done) => {
  const handler = await saveHandler();

  const result = await handler('Dexterity @Egbert');
  expect(result.header).toContain('Save request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});

test('checkHandler on invalid character', async (done) => {
  const handler = await checkHandler();

  const result = await handler('Perception @Egbert');
  expect(result.header).toContain('Check request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});

test('attackHandler on invalid character', async (done) => {
  const handler = await attackHandler();

  const result = await handler('Dagger @Egbert');
  expect(result.header).toContain('Attack request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});


test('saveHandler on ambiguous character', async (done) => {
  const handler = await saveHandler();

  const result = await handler('Dexterity @B');
  expect(result.header).toContain('Save request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});

test('checkHandler on ambiguous character', async (done) => {
  const handler = await checkHandler();

  const result = await handler('Perception @B');
  expect(result.header).toContain('Check request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});

test('attackHandler on inambiguousvalid character', async (done) => {
  const handler = await attackHandler();

  const result = await handler('Dagger @B');
  expect(result.header).toContain('Attack request was ambiguous');
  expect(result.body).toContain('characters');
  done();
});


test('saveHandler basic matching request', async (done) => {
  const handler = await saveHandler();

  const result = await handler('Dexterity @Brutus');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler basic matching request', async (done) => {
  const handler = await checkHandler();

  const result = await handler('Perception @Brutus');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler basic matching request', async (done) => {
  const handler = await attackHandler();

  const result = await handler('Dagger @Brutus');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});


test('saveHandler short lower case base query', async (done) => {
  const handler = await saveHandler();

  const result = await handler('dex @Brutus');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler short lower case base query', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @Brutus');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler short lower case base query', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @Brutus');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});


test('saveHandler short lower case base query and name', async (done) => {
  const handler = await saveHandler();

  const result = await handler('dex @bru');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler short lower case base query', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler short lower case base query', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @bru');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});


test('saveHandler advantage', async (done) => {
  const handler = await saveHandler();

  const result = await handler('dex @adv @bru');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler short lower case base query', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @adv @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler short lower case base query', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @adv @bru');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});


test('saveHandler advantage', async (done) => {
  const handler = await saveHandler();

  const result = await handler('dex @D @bru');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler short lower case base query', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @D @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler short lower case base query', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @D @bru');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});
