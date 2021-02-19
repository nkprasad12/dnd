import {BoardModel} from './board_model';
import {areLocationsEqual, Location} from '/src/common/common';

/**
 * Represents the data model for a remote token.
 * This is a subset of TokenModel that is relevant to the shared game state.
 */
export class RemoteTokenModel {
  constructor(
      readonly id: string,
      readonly location: Location,
      readonly name: string,
      readonly imageSource: string,
      readonly size: number) { }

  static equals(first: RemoteTokenModel, other: RemoteTokenModel): boolean {
    if (first.name != other.name) {
      return false;
    }
    if (first.imageSource != other.imageSource) {
      return false;
    }
    if (first.size != other.size) {
      return false;
    }
    if (!areLocationsEqual(first.location, other.location)) {
      return false;
    }
    return true;
  }

  static mergedWith(
      model: RemoteTokenModel, diff: RemoteTokenDiff): RemoteTokenModel {
    if (diff.id != model.id) {
      console.log('[RemoteTokenModel] Diff ID does not match current ID');
      return model;
    }
    return new RemoteTokenModel(
        model.id,
        diff.location === undefined ? model.location : diff.location,
        diff.name === undefined ? model.name : diff.name,
        diff.imageSource === undefined ? model.imageSource : diff.imageSource,
        diff.size === undefined ? model.size : diff.size,
    );
  }
}

/** Represents a mutation of RemoteTokenModel. */
export class RemoteTokenDiff {
  static computeBetween(
      newModel: RemoteTokenModel,
      oldModel: RemoteTokenModel): RemoteTokenDiff {
    if (newModel.id != oldModel.id) {
      throw new Error('[RemoteTokenDiff] Models have different IDs!');
    }
    return new RemoteTokenDiff(
        newModel.id,
        areLocationsEqual(newModel.location, oldModel.location) ?
            undefined : newModel.location,
        newModel.name === oldModel.name ?
            undefined : newModel.name,
        newModel.imageSource === oldModel.imageSource ?
            undefined : newModel.imageSource,
        newModel.size === oldModel.size ?
            undefined : newModel.size,
    );
  }

  constructor(
    readonly id: string,
    readonly location?: Location,
    readonly name?: string,
    readonly imageSource?: string,
    readonly size?: number) { }
}

/**
 * Represents the data model for a remote board.
 * This is a subset of BoardModel that is relevant to the shared game state.
 */
export class RemoteBoardModel {
  static create(model: BoardModel): RemoteBoardModel {
    return new RemoteBoardModel(
        model.id,
        model.name,
        model.backgroundImage.source,
        model.tileSize,
        model.tokens.map((tokenModel) => tokenModel.remoteCopy()),
    );
  }

  private constructor(
    readonly id: string,
    readonly name: string,
    readonly imageSource: string,
    readonly tileSize: number,
    readonly tokens: RemoteTokenModel[]) { }

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
    return new RemoteBoardModel(
        model.id,
        diff.name === undefined ? model.name : diff.name,
        diff.imageSource === undefined ? model.imageSource : diff.imageSource,
        diff.tileSize === undefined ? model.tileSize : diff.tileSize,
        mergedTokens,
    );
  }
}

/** Represents a mutation of RemoteBoardModel. */
export class RemoteBoardDiff {
  static computeBetween(
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
          modifiedTokens.push(
              RemoteTokenDiff.computeBetween(newToken, oldToken));
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

    const diffImageSource =
      newModel.imageSource === oldModel.imageSource ?
          undefined : newModel.imageSource;
    const diffTileSize =
      newModel.tileSize === oldModel.tileSize ? undefined : newModel.tileSize;
    const diffName =
      newModel.name === oldModel.name ? undefined : newModel.name;

    const isValidDiff =
      diffName != undefined ||
      modifiedTokens.length > 0 ||
      removedTokens.length > 0 ||
      newTokens.length > 0 ||
      diffImageSource != undefined ||
      diffTileSize != undefined;

    if (!isValidDiff) {
      return undefined;
    }

    return new RemoteBoardDiff(
        newModel.id,
        diffName,
        modifiedTokens,
        removedTokens,
        newTokens,
        diffImageSource,
        diffTileSize,
    );
  }

  private constructor(
    readonly id: string,
    readonly name?: string,
    readonly tokenDiffs: RemoteTokenDiff[] = [],
    readonly removedTokens: string[] = [],
    readonly newTokens: RemoteTokenModel[] = [],
    readonly imageSource?: string,
    readonly tileSize?: number,
  ) { }
}
