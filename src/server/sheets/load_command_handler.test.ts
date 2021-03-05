import {CommandHandler} from '_common/chat/chat_resolver';
import {loadCommandHandler} from '_server/sheets/load_command_handler';
import {CharacterSheetCache} from '_server/sheets/sheet_cache';
import {CharacterSheetData} from '_server/sheets/types';


const CALIGULA_SHEET = 'caligula.sheet';
const CALIGULA_DATA: CharacterSheetData = {
  name: 'Caligula',
  proficiencyBonus: 0,
  saveBonuses: new Map(),
  abilityBonuses: new Map(),
  attackBonuses: new Map(),
  checkBonuses: new Map(),
};

async function load(id: string): Promise<CharacterSheetData> {
  if (id === CALIGULA_SHEET) {
    return CALIGULA_DATA;
  }
  throw new Error('Unknown sheet');
}

function loadHandler(): CommandHandler {
  return loadCommandHandler(new CharacterSheetCache(load));
}

test('handle valid sheet successfully', async (done) => {
  const handler = loadHandler();

  const result = await handler('docs/spreadsheets/d/caligula.sheet');
  expect(result.body).toContain('Successfully loaded Caligula');
  done();
});

test('handle valid sheet with suffix successfully', async (done) => {
  const handler = loadHandler();

  const result = await handler('docs/spreadsheets/d/caligula.sheet/blahsuffix');
  expect(result.body).toContain('Successfully loaded Caligula');
  done();
});

test('handle invalid sheet returns error', async (done) => {
  const handler = loadHandler();

  const result = await handler('docs/spreadsheets/d/gaius.sheet');
  expect(result.header).toContain('Invalid content');
  done();
});

test('handle invalid link returns error', async (done) => {
  const handler = loadHandler();

  const result = await handler('docs/spreadsheets/caligula.sheet');
  expect(result.header).toContain('Invalid link');
  done();
});
