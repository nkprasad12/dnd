import {CharacterSheetData} from '_common/character_sheets/types';
import {Location} from '_common/coordinates';

const DEFAULT_SPEED = 6;

/** Represents the data model for a token not on a board. */
export interface TokenData {
  readonly id: string;
  readonly name: string;
  readonly imageSource: string;
  readonly speed: number;
  // TODO: Rethink whether this is the correct place for this.
  // For example, how do we handle stale character sheets?
  readonly sheetData: CharacterSheetData | null;
}

export namespace TokenData {
  export function isValid(input: any): input is TokenData {
    const maybeToken = input as TokenData;
    const isValid =
      maybeToken.id !== undefined &&
      maybeToken.name !== undefined &&
      maybeToken.imageSource !== undefined &&
      maybeToken.speed !== undefined &&
      maybeToken.sheetData !== undefined;
    return isValid;
  }

  /** Adds default values to undefined required fields when possible. */
  export function fillDefaults(input: any): any {
    if (input.speed === undefined) {
      input.speed = DEFAULT_SPEED;
    }
    if (input.sheetData === undefined) {
      input.sheetData = null;
    }
    return input;
  }
}

/** Represents the additional data required for a token on a board. */
export interface BoardOnlyTokenData {
  readonly id: string;
  readonly location: Location;
  readonly size: number;
}

export namespace BoardOnlyTokenData {
  export function isValid(input: any): input is BoardOnlyTokenData {
    const maybeToken = input as BoardOnlyTokenData;
    const isValid =
      maybeToken.id !== undefined &&
      maybeToken.location !== undefined &&
      maybeToken.size !== undefined;
    return isValid;
  }
}
