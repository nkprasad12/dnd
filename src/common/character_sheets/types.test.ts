import {CALIGULA_DATA} from '_common/character_sheets/test_data';
import {CharacterSheetData} from '_common/character_sheets/types';

describe('CharacterSheetData.isValid', () => {
  it('returns true for value data', () => {
    const data = Object.assign(CALIGULA_DATA);
    expect(CharacterSheetData.isValid(data)).toBe(true);
  });

  it('returns false if missing name', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.name = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing proficiencyBonus', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.proficiencyBonus = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing name', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.name = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing checkBonuses', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.checkBonuses = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing saveBonuses', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.saveBonuses = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing abilityBonuses', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.abilityBonuses = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });

  it('returns false if missing attackBonuses', () => {
    const data = Object.assign(CALIGULA_DATA);
    data.attackBonuses = undefined;
    expect(CharacterSheetData.isValid(data)).toBe(false);
  });
});
