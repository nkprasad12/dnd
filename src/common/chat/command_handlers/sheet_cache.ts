import {checkDefined} from '_common/preconditions';
import {CharacterSheetData} from '_common/chat/command_handlers/types';


export type CharacterLoader = (id: string) => Promise<CharacterSheetData>;

export interface LoadResult {
  loadedName: string;
  removedName?: string;
}

export class CharacterSheetCache {
  /* istanbul ignore next */
  static create(loader: CharacterLoader) {
    return new CharacterSheetCache(loader);
  }

  private nameDataMap: Map<string, CharacterSheetData> = new Map();
  private sheetNameMap: Map<string, string> = new Map();

  constructor(private readonly loader: CharacterLoader) {}

  /**
   * Loads a character data sheet.
   * @param sheetId the ID of the sheet to load.
   * @param force whether to force a reload of an existing sheet.
   * @returns the name of the character contained in the loaded sheet.
   */
  async load(sheetId: string, force: boolean = false): Promise<LoadResult> {
    const hasSheet = this.sheetNameMap.has(sheetId);
    if (hasSheet && !force) {
      return {loadedName: checkDefined(this.sheetNameMap.get(sheetId))};
    }
    let removedName: string|undefined = undefined;
    if (hasSheet) {
      removedName = this.sheetNameMap.get(sheetId);
      if (removedName) {
        this.nameDataMap.delete(removedName);
      }
    }
    const sheet = await this.loader(sheetId);
    this.nameDataMap.set(sheet.name, sheet);
    this.sheetNameMap.set(sheetId, sheet.name);
    return {loadedName: sheet.name, removedName: removedName};
  }
}
