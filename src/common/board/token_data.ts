import {Location} from '_common/coordinates';

const DEFAULT_SPEED = 6;

/** Represents the data model for a token not on a board. */
export interface TokenData {
  readonly id: string;
  readonly name: string;
  readonly imageSource: string;
  readonly size: number;
  readonly speed: number;
}

export namespace TokenData {
  export function isValid(input: any): input is TokenData {
    const maybeToken = input as TokenData;
    const isValid =
      maybeToken.id !== undefined &&
      maybeToken.name !== undefined &&
      maybeToken.imageSource !== undefined &&
      maybeToken.size !== undefined &&
      maybeToken.speed !== undefined;
    return isValid;
  }

  /** Adds default values to undefined required fields when possible. */
  export function fillDefaults(input: any): any {
    if (input.speed === undefined) {
      input.speed = DEFAULT_SPEED;
    }
    return input;
  }
}

/** Represents the additional data required for a token on a board. */
export interface BoardOnlyTokenData {
  readonly id: string;
  readonly location: Location;
}

export namespace BoardOnlyTokenData {
  export function isValid(input: any): input is BoardOnlyTokenData {
    const maybeToken = input as BoardOnlyTokenData;
    const isValid =
      maybeToken.id !== undefined && maybeToken.location !== undefined;
    return isValid;
  }
}
