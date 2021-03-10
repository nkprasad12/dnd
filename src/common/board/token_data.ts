import {Location} from '_common/coordinates';

/** Represents the data model for a token not on a board. */
export interface TokenData {
  readonly id: string;
  readonly name: string;
  readonly imageSource: string;
  readonly size: number;
  readonly speed: number;
}

/** Represents the additional data required for a token on a board. */
export interface BoardOnlyTokenData {
  readonly id: string;
  readonly location: Location;
}
