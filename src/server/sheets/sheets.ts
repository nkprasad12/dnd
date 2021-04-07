/* istanbul ignore file */
import axios from 'axios';
import {checkDefined} from '_common/preconditions';
import {
  ABILITY_ORDER,
  AttackData,
  CharacterSheetData,
  SKILL_ORDER,
} from '_common/chat/command_handlers/types';

namespace sheetsV4 {
  export interface Schema$ValueRange {
    range: string;
    values: string[][];
  }
}

const SHEET = 'v2.1!';

const PROF = 'H14';
const NAME = 'C6';

const SKILLS = 'I25:I42';

// Take every 5, starting with the second for abilities
const ABILITIES = 'C13:C38';
const SAVING_THROWS = 'I17:I22';

const ATTACKS = 'R32:AC36';

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
    checkDefined(data.values, 'proficiency:data.values')[0][0]
  );
}

function processAbilityBonuses(
  data: sheetsV4.Schema$ValueRange
): Map<string, number> {
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
  data: sheetsV4.Schema$ValueRange
): Map<string, number> {
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

function processSkillBonuses(
  skillData: sheetsV4.Schema$ValueRange
): Map<string, number> {
  if (skillData.range !== RANGES[4]) {
    throw new Error('Invalid value range for skill checks.');
  }
  const result: Map<string, number> = new Map();

  const items = Array.from(Array(SKILL_ORDER.length).keys());
  const values = checkDefined(skillData.values, 'skillChecks:data.values')[0];
  for (const i of items) {
    result.set(SKILL_ORDER[i], Number.parseInt(values[i]));
  }

  return result;
}

function processAttackBonuses(
  data: sheetsV4.Schema$ValueRange
): Map<string, AttackData> {
  if (data.range !== RANGES[5]) {
    throw new Error('Invalid value range for attack checks.');
  }
  const result: Map<string, AttackData> = new Map();
  const values = checkDefined(data.values, 'attackBonuses:data.values');
  for (let i = 0; i < 5; i++) {
    const attackName = values[0][i];
    if (!attackName || !(attackName as string).trim()) {
      break;
    }
    result.set(attackName, {
      toHit: Number.parseInt(values[7][i]),
      damageRoll: values[11][i].split('[')[0],
      info: values[11][i],
    });
  }
  return result;
}

// To use the official Google API client:
// Install "googleapis" (at version "^67.1.1")
// Add the following import:
//   import {google, sheets_v4 as sheetsV4} from 'googleapis';
// and use the below function to request a sheet instead.
// export async function requestFromGoogleApi(sheetId: string) {
//   console.log('Requesting via Google API');
//   const sheets = google.sheets('v4');
//   const params = {
//     auth: process.env.GOOGLE_API_KEY,
//     spreadsheetId: sheetId,
//     majorDimension: 'COLUMNS',
//     ranges: RANGES,
//   };
//   const sheetValues = await sheets.spreadsheets.values.batchGet(params);
//   if (sheetValues.status != 200) {
//     throw new Error(
//        'Was unable to retrieve data. Is this a permission issue?');
//   }
//   return checkDefined(sheetValues.data.valueRanges);
// }

function buildSheetsQuery(sheetId: string) {
  const query =
    'https://sheets.googleapis.com/v4/spreadsheets/' +
    sheetId +
    '/values:batchGet' +
    `?key=${process.env.GOOGLE_API_KEY}` +
    `&majorDimension=COLUMNS` +
    RANGES.map((range) => '&ranges=' + range).join('');
  console.log(query);
  return query;
}

export async function requestFromAxios(sheetId: string) {
  const sheetValues = await axios.get(buildSheetsQuery(sheetId));
  if (sheetValues.status != 200) {
    throw new Error('Was unable to retrieve data. Is this a permission issue?');
  }
  return checkDefined(sheetValues.data.valueRanges);
}

export async function extractSheetData(
  sheetId: string
): Promise<CharacterSheetData> {
  const data = await requestFromAxios(sheetId);
  const skillBonuses = processSkillBonuses(data[4]);
  const abilityBonuses = processAbilityBonuses(data[2]);

  return {
    name: processName(data[0]),
    sheetId: sheetId,
    proficiencyBonus: processProficiency(data[1]),
    abilityBonuses: abilityBonuses,
    saveBonuses: processSaveBonuses(data[3]),
    checkBonuses: new Map([...skillBonuses, ...abilityBonuses]),
    attackBonuses: processAttackBonuses(data[5]),
  };
}
