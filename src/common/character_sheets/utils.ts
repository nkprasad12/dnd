const SHEET_ID_PREFIX = 'spreadsheets/d/';

export namespace Sheets {
  /**
   * Extracts a sheet id from a Google Sheet URL.
   *
   * Returns `null` if no sheet id could be found in the input URL.
   */
  export function idFromUrl(url: string): string | null {
    if (url.indexOf(SHEET_ID_PREFIX) === -1) {
      return null;
    }
    return url.split(SHEET_ID_PREFIX)[1].split('/')[0];
  }

  /**
   * Returns the sheet URL corresponding to the input sheet ID.
   *
   * Returns `undefined` if the input is `undefined`.
   */
  export function urlFromId(sheetId: string | undefined): string | undefined {
    return sheetId
      ? `https://docs.google.com/spreadsheets/d/${sheetId}`
      : undefined;
  }
}
