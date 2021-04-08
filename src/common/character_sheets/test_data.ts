import {CharacterSheetData} from '_common/character_sheets/types';

export const BOBBY_SHEET = 'bobby.sheet';
export const BOBBY_DATA: CharacterSheetData = {
  name: 'Bobby Newport',
  sheetId: BOBBY_SHEET,
  proficiencyBonus: 3,
  saveBonuses: {
    Dexterity: 0,
    Wisdom: -2,
  },
  abilityBonuses: {
    Dexterity: 0,
    Wisdom: -2,
  },
  attackBonuses: {Words: {toHit: 1, damageRoll: '1d8+2'}},
  checkBonuses: {
    Perception: 0,
    Arcana: 1,
  },
};

export const BRUTUS_SHEET = 'brutus.sheet';
export const BRUTUS_DATA: CharacterSheetData = {
  name: 'Brutus',
  sheetId: BRUTUS_SHEET,
  proficiencyBonus: 2,
  saveBonuses: {
    Dexterity: 3,
    Wisdom: -1,
  },
  abilityBonuses: {
    Dexterity: 3,
    Wisdom: -1,
  },
  attackBonuses: {
    Longbow: {toHit: 8, damageRoll: '1d8+2'},
    Dagger: {toHit: 3, damageRoll: 'malformed'},
  },
  checkBonuses: {
    Perception: 3,
    Arcana: 1,
    Dexterity: 3,
    Wisdom: -1,
  },
};

export const CALIGULA_SHEET = 'caligula.sheet';
export const CALIGULA_DATA: CharacterSheetData = {
  name: 'Caligula',
  sheetId: CALIGULA_SHEET,
  proficiencyBonus: 0,
  saveBonuses: {},
  abilityBonuses: {},
  attackBonuses: {},
  checkBonuses: {},
};
export const UPDATED_CALIGULA_DATA: CharacterSheetData = {
  name: 'Gaius',
  sheetId: CALIGULA_SHEET,
  proficiencyBonus: 0,
  saveBonuses: {},
  abilityBonuses: {},
  attackBonuses: {},
  checkBonuses: {},
};
