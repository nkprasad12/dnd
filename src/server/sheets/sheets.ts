/* istanbul ignore file */
import {google, sheets_v4 as sheetsV4} from 'googleapis';
import {checkDefined} from '_common/preconditions';
import {CharacterSheetData} from '_server/sheets/types';


const SHEET = 'v2.1!';

const PROF = 'H14';
const NAME = 'C6';

const SKILLS = 'I25:I42';
const SKILL_ORDER = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
];

// Take every 5, starting with the second for abilities
const ABILITIES = 'C13:C38';
const SAVING_THROWS = 'I17:I22';
const ABILITY_ORDER = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

const ATTACKS = 'R32:Y36';

const RAW_RANGES = [NAME, PROF, ABILITIES, SAVING_THROWS, SKILLS, ATTACKS];
const RANGES = RAW_RANGES.map((range) => SHEET + range);

function processName(data: sheetsV4.Schema$ValueRange): string {
  if (data.range !== RANGES[0]) {
    throw new Error('Invalid value range for name.');
  }
  return checkDefined(data.values, 'name:data.values')[0][0];
}

function processProficiency(data: sheetsV4.Schema$ValueRange): number {
  if (data.range !== RANGES[1]) {
    throw new Error('Invalid value range for proficiency.');
  }
  return Number.parseInt(
      checkDefined(data.values, 'proficiency:data.values')[0][0]);
}

function processAbilityBonuses(
    data: sheetsV4.Schema$ValueRange): Map<string, number> {
  if (data.range !== RANGES[2]) {
    throw new Error('Invalid value range for abilities.');
  }
  const result: Map<string, number> = new Map();
  const items = Array.from(Array(ABILITY_ORDER.length).keys());
  const values = checkDefined(data.values, 'abilities:data.values')[0];
  for (const i of items) {
    const value = values[i * 5];
    result.set(ABILITY_ORDER[i], Number.parseInt(value));
  }
  return result;
}

function processSaveBonuses(
    data: sheetsV4.Schema$ValueRange): Map<string, number> {
  if (data.range !== RANGES[3]) {
    throw new Error('Invalid value range for saving throws.');
  }
  const result: Map<string, number> = new Map();
  const items = Array.from(Array(ABILITY_ORDER.length).keys());
  const values = checkDefined(data.values, 'savingThrows:data.values')[0];
  for (const i of items) {
    result.set(ABILITY_ORDER[i], Number.parseInt(values[i]));
  }
  return result;
}

function processCheckBonuses(
    data: sheetsV4.Schema$ValueRange): Map<string, number> {
  if (data.range !== RANGES[4]) {
    throw new Error('Invalid value range for skill checks.');
  }
  const result: Map<string, number> = new Map();
  const items = Array.from(Array(SKILL_ORDER.length).keys());
  const values = checkDefined(data.values, 'skillChecks:data.values')[0];
  for (const i of items) {
    result.set(SKILL_ORDER[i], Number.parseInt(values[i]));
  }
  return result;
}

function processAttackBonuses(
    data: sheetsV4.Schema$ValueRange): Map<string, number> {
  if (data.range !== RANGES[5]) {
    throw new Error('Invalid value range for attack checks.');
  }
  const result: Map<string, number> = new Map();
  const values = checkDefined(data.values, 'attackBonuses:data.values');
  for (let i = 0; i < 5; i++) {
    const attackName = values[0][i];
    if (!attackName || !(attackName as string).trim()) {
      break;
    }
    result.set(attackName, Number.parseInt(values[7][i]));
  }
  return result;
}

export async function extractSheetData(
    sheetId: string): Promise<CharacterSheetData> {
  const sheets = google.sheets('v4');
  const params = {
    auth: process.env.GOOGLE_API_KEY,
    spreadsheetId: sheetId,
    majorDimension: 'COLUMNS',
    ranges: RANGES,
  };
  const sheetValues = await sheets.spreadsheets.values.batchGet(params);
  if (sheetValues.status != 200) {
    throw new Error('Was unable to retrieve data. Is this a permission issue?');
  }
  const data = checkDefined(sheetValues.data.valueRanges);

  return {
    name: processName(data[0]),
    proficiencyBonus: processProficiency(data[1]),
    abilityBonuses: processAbilityBonuses(data[2]),
    saveBonuses: processSaveBonuses(data[3]),
    checkBonuses: processCheckBonuses(data[4]),
    attackBonuses: processAttackBonuses(data[5]),
  };
}
