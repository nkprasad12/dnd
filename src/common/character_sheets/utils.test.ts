import {Sheets} from '_common/character_sheets/utils';

describe('idFromUrl', () => {
  it('handles valid url successfully', () => {
    const sheetId = Sheets.idFromUrl('docs/spreadsheets/d/caligula.sheet');
    expect(sheetId).toBe('caligula.sheet');
  });

  it('handles valid url with suffix successfully', () => {
    const sheetId = Sheets.idFromUrl('docs/spreadsheets/d/caligula.sheet/blah');
    expect(sheetId).toBe('caligula.sheet');
  });

  it('returns null on invalid url', () => {
    const sheetId = Sheets.idFromUrl('docs/spredshets/d/caligula.sheet');
    expect(sheetId).toBe(null);
  });
});
