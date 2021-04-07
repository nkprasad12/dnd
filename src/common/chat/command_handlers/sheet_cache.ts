import {CharacterSheetData} from '_common/chat/command_handlers/types';

export type CharacterLoader = (id: string) => Promise<CharacterSheetData>;
export type CacheListener = (update: LoadResult) => any;

export interface LoadResult {
  /** The character sheet data for the request. */
  loadedData: CharacterSheetData;
  /** The character removed from the cache due to this load, if any. */
  removedName?: string;
}

interface LoadData {
  loadNumber: number;
  data: CharacterSheetData;
}

export class CharacterSheetCache {
  /* istanbul ignore next */
  static create(loader: CharacterLoader) {
    return new CharacterSheetCache(loader);
  }

  private sheetDataMap: Map<string, LoadData> = new Map();
  private listeners: CacheListener[] = [];
  private loadNumber = 0;

  constructor(private readonly loader: CharacterLoader) {}

  /** Invoked when the cache content is updated. */
  addListener(listener: CacheListener) {
    this.listeners.push(listener);
  }

  /** Returns all the names in the cache, in lower case. */
  getNames(): string[] {
    const allSheets = Array.from(this.sheetDataMap.values());
    const allNames = allSheets.map((data) => data.data.name.toLowerCase());
    return [...new Set(allNames)];
  }

  /**
   * Returns the data for the character with the given name.
   *
   * Returns the sheet data for the sheet that was most recently loaded
   * that matches the input name, ignoring case.
   */
  getDataForName(name: string): CharacterSheetData | undefined {
    const matchingSheets = Array.from<LoadData>(
      this.sheetDataMap.values()
    ).filter((data) => data.data.name.toLowerCase() === name.toLowerCase());
    if (matchingSheets.length === 0) {
      return undefined;
    }
    return matchingSheets.reduce((result, current) =>
      result.loadNumber > current.loadNumber ? result : current
    ).data;
  }

  /**
   * Loads a character data sheet.
   * @param sheetId the ID of the sheet to load.
   * @param force whether to force a reload of an existing sheet.
   * @returns the name of the character contained in the loaded sheet.
   */
  async load(sheetId: string, force: boolean = false): Promise<LoadResult> {
    const existingData = this.sheetDataMap.get(sheetId);
    if (existingData !== undefined && !force) {
      return {loadedData: existingData.data};
    }
    this.loadNumber += 1;
    const sheet = await this.loader(sheetId);
    this.sheetDataMap.set(sheetId, {loadNumber: this.loadNumber, data: sheet});

    const existingName = existingData?.data.name.toLowerCase();
    const removedName =
      existingName === sheet.name.toLowerCase() ? undefined : existingName;
    const result = {loadedData: sheet, removedName: removedName};
    this.listeners.forEach((listener) => listener(result));
    return result;
  }
}
