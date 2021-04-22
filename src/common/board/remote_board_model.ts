import deepEqual from 'deep-equal';
import {BoardOnlyTokenData, TokenData} from '_common/board/token_data';

import {Point} from '_common/coordinates';
import {createGrid, Grid, gridDimensions} from '_common/util/grid';
import {isGrid, prefer} from '_common/verification';

/**
 * Represents the data model for a remote token.
 * This is a subset of TokenModel that is relevant to the shared game state.
 */
export interface RemoteTokenModel extends TokenData, BoardOnlyTokenData {}

export namespace RemoteTokenModel {
  /** Returns true if and only if the input is a valid model. */
  export function isValid(input: any): input is RemoteTokenModel {
    return TokenData.isValid(input) && BoardOnlyTokenData.isValid(input);
  }

  /** Merges two input data sources to create a token model. */
  export function createFrom(
    baseData: TokenData,
    boardData: BoardOnlyTokenData
  ): RemoteTokenModel {
    if (baseData.id !== boardData.id) {
      throw new Error('Trying to create from data with different ids!');
    }
    const result: any = Object.assign(baseData);
    result.location = boardData.location;
    result.size = boardData.size;
    if (!isValid(result)) {
      throw new Error('Invalid token result created');
    }

    return result;
  }

  export function fillDefaults(input: any): any {
    return TokenData.fillDefaults(input);
  }

  export function equals(
    first: RemoteTokenModel,
    other: RemoteTokenModel
  ): boolean {
    return deepEqual(first, other);
  }

  export function mergedWith(
    model: RemoteTokenModel,
    diff: RemoteTokenDiff
  ): RemoteTokenModel {
    if (diff.id !== model.id) {
      throw new Error('[RemoteTokenModel] Diff ID does not match current ID');
    }
    return {
      id: model.id,
      location: diff.location ?? model.location,
      name: diff.name ?? model.name,
      imageSource: diff.imageSource ?? model.imageSource,
      size: diff.size ?? model.size,
      speed: diff.speed ?? model.speed,
      sheetData: diff.sheetData ?? model.sheetData,
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
    const maybeModel = input as RemoteBoardModel;
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
    if (!['0', '1'].includes(maybeModel.fogOfWar[0][0])) {
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
    if (
      input.fogOfWar === undefined ||
      !isGrid(input.fogOfWar, input.cols, input.rows)
    ) {
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
          if (['0', '1'].includes(current)) {
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
    if (
      input.publicSelection === undefined ||
      !isGrid(input.publicSelection, input.cols, input.rows)
    ) {
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
    readonly tokens: readonly RemoteTokenModel[],
    readonly fogOfWar: Grid<string>,
    readonly publicSelection: Grid<string>,
    readonly width: number,
    readonly height: number,
    readonly gridOffset: Point,
    readonly cols: number,
    readonly rows: number
  ) {}

  static mergedWith(
    model: RemoteBoardModel,
    diff: RemoteBoardDiff
  ): RemoteBoardModel {
    if (model.id != diff.id) {
      throw new Error(
        '[RemoteBoardModel] mergedWith called with different ids'
      );
    }
    const expectedDimensions = gridDimensions(
      model.width,
      model.height,
      prefer(diff.tileSize, model.tileSize),
      prefer(diff.gridOffset, model.gridOffset)
    );
    if (
      expectedDimensions.cols !== prefer(diff.cols, model.cols) ||
      expectedDimensions.rows !== prefer(diff.rows, model.rows)
    ) {
      throw new Error('Invalid board dimensions');
    }
    let mergedTokens: RemoteTokenModel[] = [];
    mergedTokens = mergedTokens.concat(prefer(diff.newTokens, []));
    for (const token of model.tokens) {
      if (prefer(diff.removedTokens, []).includes(token.id)) {
        continue;
      }
      let finalToken = token;
      for (const tokenDiff of prefer(diff.tokenDiffs, [])) {
        if (tokenDiff.id === token.id) {
          finalToken = RemoteTokenModel.mergedWith(finalToken, tokenDiff);
          break;
        }
      }
      mergedTokens.push(finalToken);
    }
    const dimsChanged =
      (diff.rows !== undefined && diff.rows !== model.rows) ||
      (diff.cols !== undefined && diff.cols !== model.cols);
    const fogOfWarState = dimsChanged
      ? createGrid(
          prefer(diff.rows, model.rows),
          prefer(diff.cols, model.cols),
          '0'
        )
      : diff.fogOfWarDiffs !== undefined
      ? Grid.applySimpleDiff(model.fogOfWar, diff.fogOfWarDiffs)
      : model.fogOfWar;
    const publicSelection = dimsChanged
      ? createGrid(
          prefer(diff.rows, model.rows),
          prefer(diff.cols, model.cols),
          '0'
        )
      : diff.publicSelectionDiffs !== undefined
      ? Grid.applySimpleDiff(model.publicSelection, diff.publicSelectionDiffs)
      : model.publicSelection;
    return new RemoteBoardModel(
      model.id,
      prefer(diff.name, model.name),
      model.imageSource,
      prefer(diff.tileSize, model.tileSize),
      mergedTokens,
      fogOfWarState,
      publicSelection,
      model.width,
      model.height,
      prefer(diff.gridOffset, model.gridOffset),
      prefer(diff.cols, model.cols),
      prefer(diff.rows, model.rows)
    );
  }
}

export const FOG_ON = '1';
export const FOG_OFF = '0';

/** Represents a mutation of RemoteBoardModel. */
export interface RemoteBoardDiff {
  id: string;
  name?: string;
  tokenDiffs?: RemoteTokenDiff[];
  removedTokens?: string[];
  newTokens?: RemoteTokenModel[];
  publicSelectionDiffs?: Grid.SimpleDiff<string>;
  tileSize?: number;
  gridOffset?: Point;
  fogOfWarDiffs?: Grid.SimpleDiff<string>;
  rows?: number;
  cols?: number;
}

export namespace RemoteBoardDiff {
  export function isValid(input: any): input is RemoteBoardDiff {
    const maybeDiff = input as RemoteBoardDiff;
    // TODO: Validate the other fields.
    const isValid = maybeDiff.id !== undefined;
    if (!isValid) {
      return false;
    }
    for (const tokenDiff of prefer(maybeDiff.tokenDiffs, [])) {
      if (tokenDiff.id === undefined) {
        return false;
      }
    }
    for (const newToken of prefer(maybeDiff.newTokens, [])) {
      if (!RemoteTokenModel.isValid(newToken)) {
        return false;
      }
    }
    return isValid;
  }
}
