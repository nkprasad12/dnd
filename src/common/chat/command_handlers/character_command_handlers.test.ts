import {CommandHandler} from '_common/chat/chat_resolver';
import {
  attackCommandHandler,
  checkCommandHandler,
  initiativeCommandHandler,
  saveCommandHandler,
} from '_common/chat/command_handlers/character_command_handlers';
import {CharacterResolver} from '_common/chat/command_handlers/character_resolver';
import {CharacterSheetCache} from '_common/chat/command_handlers/sheet_cache';
import {CharacterSheetData} from '_common/chat/command_handlers/types';

const BOBBY_SHEET = 'bobby.sheet';
const BOBBY_DATA: CharacterSheetData = {
  name: 'Bobby Newport',
  sheetId: BOBBY_SHEET,
  proficiencyBonus: 3,
  saveBonuses: new Map([
    ['Dexterity', 0],
    ['Wisdom', -2],
  ]),
  abilityBonuses: new Map([
    ['Dexterity', 0],
    ['Wisdom', -2],
  ]),
  attackBonuses: new Map([['Words', {toHit: 1, damageRoll: '1d8+2'}]]),
  checkBonuses: new Map([
    ['Perception', 0],
    ['Arcana', 1],
  ]),
};

const BRUTUS_SHEET = 'brutus.sheet';
const BRUTUS_DATA: CharacterSheetData = {
  name: 'Brutus',
  sheetId: BRUTUS_SHEET,
  proficiencyBonus: 2,
  saveBonuses: new Map([
    ['Dexterity', 3],
    ['Wisdom', -1],
  ]),
  abilityBonuses: new Map([
    ['Dexterity', 3],
    ['Wisdom', -1],
  ]),
  attackBonuses: new Map([
    ['Longbow', {toHit: 8, damageRoll: '1d8+2'}],
    ['Dagger', {toHit: 3, damageRoll: 'malformed'}],
  ]),
  checkBonuses: new Map([
    ['Perception', 3],
    ['Arcana', 1],
    ['Dexterity', 3],
    ['Wisdom', -1],
  ]),
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

async function initiativeHandler(): Promise<CommandHandler> {
  return initiativeCommandHandler(await getResolver());
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

test('checkHandler basic ability matching request', async (done) => {
  const handler = await checkHandler();

  const result = await handler('wisdom @Brutus');
  expect(result.header).toContain('wisdom check:');
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

test('attackHandler basic with valid damage shows both', async (done) => {
  const handler = await attackHandler();

  const result = await handler('Longbow @Brutus');
  expect(result.body).toContain('To hit');
  expect(result.body).toContain('Damage');
  done();
});

test('attackHandler basic with invalid damage shows to hit', async (done) => {
  const handler = await attackHandler();

  const result = await handler('Dagger @Brutus');
  expect(result.body).toContain('To hit');
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

test('checkHandler short lower case base query and name', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler short lower case base query and name', async (done) => {
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

test('checkHandler advantage', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @adv @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler advantage', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @adv @bru');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});

test('saveHandler disadvantage', async (done) => {
  const handler = await saveHandler();

  const result = await handler('dex @D @bru');
  expect(result.header).toContain('dexterity save throw:');
  expect(result.header).toContain('Brutus');
  done();
});

test('checkHandler disadvantage', async (done) => {
  const handler = await checkHandler();

  const result = await handler('perc @D @bru');
  expect(result.header).toContain('perception check:');
  expect(result.header).toContain('Brutus');
  done();
});

test('attackHandler disadvantage', async (done) => {
  const handler = await attackHandler();

  const result = await handler('da @D @bru');
  expect(result.header).toContain('dagger attack roll:');
  expect(result.header).toContain('Brutus');
  done();
});

test('initiativeHandler character check', async (done) => {
  const handler = await initiativeHandler();

  const result = await handler('@bru');
  expect(result.header).toContain('Initiative');
  expect(result.body).toContain('Brutus');
  done();
});

test('initiativeHandler all characters', async (done) => {
  const handler = await initiativeHandler();

  const result = await handler('');
  expect(result.header).toContain('Initiative');
  expect(result.body).toContain('Brutus');
  expect(result.body).toContain('Bobby');
  done();
});
