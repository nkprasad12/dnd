import {getOrigin} from '_client/common/get_origin';
import {LOAD_SHEET_ROUTE} from '_common/character_sheets/constants';
import {CharacterSheetData} from '_common/character_sheets/types';
import {Sheets} from '_common/character_sheets/utils';
import {CharacterLoader} from '_common/chat/command_handlers/sheet_cache';
import {Promises} from '_common/util/promises';

const SHEET_REQUEST = {method: 'GET'};

function sheetRoute(sheetId: string): string {
  return getOrigin() + '/' + LOAD_SHEET_ROUTE + '/' + sheetId;
}

async function loadSheet(sheetId: string): Promise<CharacterSheetData> {
  const response = await fetch(sheetRoute(sheetId), SHEET_REQUEST);
  const sheetData = await response.json();
  if (!CharacterSheetData.isValid(sheetData)) {
    throw new Error(`Sheet returned for id: ${sheetId} was invalid.`);
  }
  return sheetData;
}

export namespace SheetLoader {
  /** Loads a character sheet given a sheet ID. */
  export const load: CharacterLoader = loadSheet;

  type NewType = CharacterSheetData;

  /**
   * Loads the character sheet data from the input URL.
   *
   * The returned `Promise` resolves to `null` if unable to load character data.
   */
  export async function loadFromUrl(
    url: string | undefined
  ): Promise<NewType | null> {
    const sheetId = url ? Sheets.idFromUrl(url) : null;
    return sheetId
      ? await Promises.defaultTo(SheetLoader.load(sheetId), null)
      : null;
  }
}
