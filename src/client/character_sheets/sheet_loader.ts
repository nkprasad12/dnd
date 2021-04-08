import {getOrigin} from '_client/common/get_origin';
import {LOAD_SHEET_ROUTE} from '_common/character_sheets/constants';
import {CharacterSheetData} from '_common/character_sheets/types';
import {CharacterLoader} from '_common/chat/command_handlers/sheet_cache';

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
  export const load: CharacterLoader = loadSheet;
}
