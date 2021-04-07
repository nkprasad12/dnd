import {CharacterSheetCache as Cache} from '_common/chat/command_handlers/sheet_cache';
import {Singleton} from '_common/util/dependency/dependency';
import {extractSheetData} from '_server/sheets/sheets';

export namespace RemoteSheetCache {
  export const get = Singleton.create(() => Cache.create(extractSheetData));
}
