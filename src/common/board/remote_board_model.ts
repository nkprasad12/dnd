import deepEqual from 'deep-equal';

import {areLocationsEqual, arePointsEqual, Location, Point} from '_common/coordinates';
import {isGrid} from '_common/verification';

const DEFAULT_SPEED = 6;

/**
 * Represents the data model for a remote token.
 * This is a subset of TokenModel that is relevant to the shared game state.
 */
export class RemoteTokenModel {
  static isValid(input: any): input is RemoteTokenModel {
    const maybeToken = (input as RemoteTokenModel);
    const isValid =
        maybeToken.id !== undefined &&
        maybeToken.location !== undefined &&
        maybeToken.name !== undefined &&
        maybeToken.imageSource !== undefined &&
        maybeToken.size !== undefined &&
        maybeToken.speed !== undefined;
    return isValid;
  }

  static fillDefaults(input: any): any {
    if (input.speed === undefined) {
      input.speed = DEFAULT_SPEED;
    }
    return input;
  }

  constructor(
      readonly id: string,
      readonly location: Location,
      readonly name: string,
      readonly imageSource: string,
      readonly size: number,
      readonly speed: number) { }

  static equals(first: RemoteTokenModel, other: RemoteTokenModel): boolean {
    return deepEqual(first, other);
  }

  static mergedWith(
      model: RemoteTokenModel,
      diff: RemoteTokenDiff): RemoteTokenModel {
    if (diff.id !== model.id) {
      console.log('[RemoteTokenModel] Diff ID does not match current ID');
      return model;
    }
    return new RemoteTokenModel(
        model.id,
        diff.location === undefined ? model.location : diff.location,
        diff.name === undefined ? model.name : diff.name,
        diff.imageSource === undefined ? model.imageSource : diff.imageSource,
        diff.size === undefined ? model.size : diff.size,
        diff.speed === undefined ? model.speed : diff.speed,
    );
  }

  static computeDiff(
      newModel: RemoteTokenModel,
      oldModel: RemoteTokenModel): RemoteTokenDiff {
    if (newModel.id != oldModel.id) {
      throw new Error(
          '[RemoteTokenModel computeDiff] Models have different IDs!');
    }
    return {
      id: newModel.id,
      location: areLocationsEqual(newModel.location, oldModel.location) ?
          undefined : newModel.location,
      name: newModel.name === oldModel.name ?
          undefined : newModel.name,
      imageSource: newModel.imageSource === oldModel.imageSource ?
          undefined : newModel.imageSource,
      size: newModel.size === oldModel.size ?
          undefined : newModel.size,
      speed: newModel.speed === oldModel.speed ?
          undefined : newModel.speed,
    };
  }
}

export type RemoteTokenDiff = Partial<RemoteTokenModel>;

/**
 * Represents the data model for a remote board.
 * This is a subset of BoardModel that is relevant to the shared game state.
 */
export class RemoteBoardModel {
  static isValid(input: any): input is RemoteBoardModel {
    const maybeModel = (input as RemoteBoardModel);
    const isValid =
        maybeModel.id !== undefined &&
        maybeModel.name !== undefined &&
        maybeModel.imageSource !== undefined &&
        maybeModel.tileSize != undefined &&
        maybeModel.tokens !== undefined &&
        maybeModel.fogOfWar !== undefined &&
        maybeModel.publicSelection !== undefined &&
        maybeModel.cols !== undefined &&
        maybeModel.gridOffset !== undefined &&
        maybeModel.rows !== undefined;
    if (!isValid) {
      return false;
    }
    if (!isGrid(maybeModel.fogOfWar, maybeModel.cols, maybeModel.rows)) {
      return false;
    }
    if (!['0', '1', '2'].includes(maybeModel.fogOfWar[0][0])) {
      return false;
    }
    if (!isGrid(maybeModel.publicSelection, maybeModel.cols, maybeModel.rows)) {
      return false;
    }
    for (const maybeToken of maybeModel.tokens) {
      if (!RemoteTokenModel.isValid(maybeToken)) {
        return false;
      }
    }
    return isValid;
  }

  static fillDefaults(input: any): any {
    if (input.tokens === undefined) {
      input.tokens = [];
    }
    for (let i = 0; i < input.tokens.length; i++) {
      input.tokens[i] = RemoteTokenModel.fillDefaults(input.tokens[i]);
    }
    if (input.rows === undefined || input.cols === undefined) {
      console.log('Rows or cols are undefined');
      return;
    }
    if (input.gridOffset === undefined) {
      input.gridOffset = {x: 0, y: 0};
    }
    if (input.fogOfWar === undefined ||
        !isGrid(input.fogOfWar, input.cols, input.rows)) {
      input.fogOfWar = [];
      for (let i = 0; i < input.cols; i++) {
        input.fogOfWar.push([]);
        for (let j = 0; j < input.rows; j++) {
          input.fogOfWar[i].push('0');
        }
      }
    } else {
      for (let i = 0; i < input.fogOfWar.length; i++) {
        for (let j = 0; j < input.fogOfWar[0].length; j++) {
          const current = input.fogOfWar[i][j];
          if (['0', '1', '2'].includes(current)) {
            continue;
          }
          if (current === 'True') {
            input.fogOfWar[i][j] = '1';
          } else {
            input.fogOfWar[i][j] = '0';
          }
        }
      }
    }
    if (input.publicSelection === undefined ||
        !isGrid(input.publicSelection, input.cols, input.rows)) {
      input.publicSelection = [];
      for (let i = 0; i < input.cols; i++) {
        input.publicSelection.push([]);
        for (let j = 0; j < input.rows; j++) {
          input.publicSelection[i].push('0');
        }
      }
    }
    return input;
  }

  constructor(
    readonly id: string,
    readonly name: string,
    readonly imageSource: string,
    readonly tileSize: number,
    readonly tokens: RemoteTokenModel[],
    readonly fogOfWar: string[][],
    readonly publicSelection: string[][],
    readonly gridOffset: Point,
    readonly cols: number,
    readonly rows: number) { }

  static mergedWith(
      model: RemoteBoardModel, diff: RemoteBoardDiff): RemoteBoardModel {
    if (model.id != diff.id) {
      throw new Error(
          '[RemoteBoardModel] mergedWith called with different ids');
    }
    let mergedTokens: RemoteTokenModel[] = [];
    mergedTokens = mergedTokens.concat(diff.newTokens);
    for (const token of model.tokens) {
      if (diff.removedTokens.includes(token.id)) {
        continue;
      }
      let finalToken = token;
      for (const tokenDiff of diff.tokenDiffs) {
        if (tokenDiff.id === token.id) {
          finalToken = RemoteTokenModel.mergedWith(finalToken, tokenDiff);
          break;
        }
      }
      mergedTokens.push(finalToken);
    }
    const fogOfWarState = model.fogOfWar.map((row) => row.slice());
    if (diff.fogOfWarDiffs !== undefined) {
      for (const d of diff.fogOfWarDiffs) {
        fogOfWarState[d.col][d.row] = d.isFogOn ? '1' : '0';
      }
    }
    const publicSelection = model.publicSelection.map((row) => row.slice());
    if (diff.publicSelectionDiffs !== undefined) {
      for (const d of diff.publicSelectionDiffs) {
        publicSelection[d.col][d.row] = d.value;
      }
    }
    return new RemoteBoardModel(
        model.id,
        diff.name === undefined ? model.name : diff.name,
        diff.imageSource === undefined ? model.imageSource : diff.imageSource,
        diff.tileSize === undefined ? model.tileSize : diff.tileSize,
        mergedTokens,
        fogOfWarState,
        publicSelection,
        model.gridOffset,
        model.cols,
        model.rows,
    );
  }
}

export interface FogOfWarDiff {
  readonly row: number;
  readonly col: number;
  readonly isFogOn: boolean;
}

export interface PublicSelectionDiff {
  readonly row: number;
  readonly col: number;
  readonly value: string;
}

/** Represents a mutation of RemoteBoardModel. */
export interface RemoteBoardDiff {
    readonly id: string;
    readonly name?: string;
    readonly tokenDiffs: RemoteTokenDiff[];
    readonly removedTokens: string[];
    readonly newTokens: RemoteTokenModel[];
    readonly publicSelectionDiffs: PublicSelectionDiff[];
    readonly imageSource?: string;
    readonly tileSize?: number;
    readonly gridOffset?: Point;
    readonly fogOfWarDiffs?: FogOfWarDiff[];
}

export namespace RemoteBoardDiff {
  export function isValid(input: any): input is RemoteBoardDiff {
    const maybeDiff = (input as RemoteBoardDiff);
    const isValid =
        maybeDiff.id !== undefined &&
        maybeDiff.newTokens !== undefined &&
        maybeDiff.removedTokens !== undefined &&
        maybeDiff.tokenDiffs != undefined;
    if (!isValid) {
      return false;
    }
    for (const tokenDiff of maybeDiff.tokenDiffs) {
      if (tokenDiff.id === undefined) {
        return false;
      }
    }
    for (const newToken of maybeDiff.newTokens) {
      if (!RemoteTokenModel.isValid(newToken)) {
        return false;
      }
    }
    return isValid;
  }

  export function computeBetween(
      newModel: RemoteBoardModel,
      oldModel: RemoteBoardModel): RemoteBoardDiff | undefined {
    if (newModel.id != oldModel.id) {
      throw new Error(
          '[RemoteBoardDiff] computeBetween called with diferent ids');
    }
    const newTokens: RemoteTokenModel[] = [];
    const modifiedTokens: RemoteTokenDiff[] = [];
    const removedTokens: string[] = [];

    for (const newToken of newModel.tokens) {
      let foundMatch = false;
      for (const oldToken of oldModel.tokens) {
        if (newToken.id != oldToken.id) {
          continue;
        }
        foundMatch = true;
        if (!RemoteTokenModel.equals(newToken, oldToken)) {
          modifiedTokens.push(RemoteTokenModel.computeDiff(newToken, oldToken));
        }
        break;
      }
      if (!foundMatch) {
        newTokens.push(newToken);
      }
    }
    for (const oldToken of oldModel.tokens) {
      let foundMatch = false;
      for (const newToken of newModel.tokens) {
        if (oldToken.id != newToken.id) {
          continue;
        }
        foundMatch = true;
        break;
      }
      if (!foundMatch) {
        removedTokens.push(oldToken.id);
      }
    }
    const fogOfWarDiffs: FogOfWarDiff[] = [];
    const publicSelectionDiffs: PublicSelectionDiff[] = [];
    if (newModel.imageSource === oldModel.imageSource) {
      for (let i = 0; i < newModel.cols; i++) {
        for (let j = 0; j < newModel.rows; j++) {
          if (oldModel.fogOfWar[i][j] !== newModel.fogOfWar[i][j]) {
            fogOfWarDiffs.push(
                {col: i, row: j, isFogOn: newModel.fogOfWar[i][j] !== '0'});
          }
          const newSelection = newModel.publicSelection[i][j];
          if (oldModel.publicSelection[i][j] !== newSelection) {
            publicSelectionDiffs.push({col: i, row: j, value: newSelection});
          }
        }
      }
    } else {
      console.log('Warning - skipping fog of war diff calculation.');
    }

    const diffImageSource =
      newModel.imageSource === oldModel.imageSource ?
          undefined : newModel.imageSource;
    const diffTileSize =
      newModel.tileSize === oldModel.tileSize ? undefined : newModel.tileSize;
    const diffName =
      newModel.name === oldModel.name ? undefined : newModel.name;
    const diffGridOffset =
        arePointsEqual(newModel.gridOffset, oldModel.gridOffset) ?
            undefined : newModel.gridOffset;

    const isValidDiff =
      diffName != undefined ||
      modifiedTokens.length > 0 ||
      removedTokens.length > 0 ||
      newTokens.length > 0 ||
      diffImageSource != undefined ||
      diffTileSize != undefined ||
      diffGridOffset != undefined ||
      fogOfWarDiffs.length > 0 ||
      publicSelectionDiffs.length > 0;

    if (!isValidDiff) {
      return undefined;
    }

    return {
      id: newModel.id,
      name: diffName,
      tokenDiffs: modifiedTokens,
      removedTokens: removedTokens,
      newTokens: newTokens,
      publicSelectionDiffs: publicSelectionDiffs,
      imageSource: diffImageSource,
      tileSize: diffTileSize,
      gridOffset: diffGridOffset,
      fogOfWarDiffs: fogOfWarDiffs,
    };
  }
}
