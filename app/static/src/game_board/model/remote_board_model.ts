import {BoardModel} from './board_model';
import {areLocationsEqual, Location} from '/src/common/common';

/**
 * Represents the data model for a remote token.
 * This is a subset of TokenModel that is relevant to the shared game state.
 */
export class RemoteTokenModel {
  protected constructor(
      readonly id: string,
      readonly location: Location,
      readonly name: string,
      readonly imageSource: string,
      readonly size: number) { }

  equals(other: RemoteTokenModel): boolean {
    if (this.name != other.name) {
      return false;
    }
    if (this.imageSource != other.imageSource) {
      return false;
    }
    if (this.size != other.size) {
      return false;
    }
    if (!areLocationsEqual(this.location, other.location)) {
      return false;
    }
    return true;
  }

  mergedWith(diff: RemoteTokenDiff): RemoteTokenModel {
    if (diff.id != this.id) {
      console.log('[RemoteTokenModel] Diff ID does not match current ID');
      return this;
    }
    return new RemoteTokenModel(
        this.id,
      diff.location === undefined ? this.location : diff.location,
      diff.name === undefined ? this.name : diff.name,
      diff.imageSource === undefined ? this.imageSource : diff.imageSource,
      diff.size === undefined ? this.size : diff.size,
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
        model.backgroundImage.source,
        model.tileSize,
        model.tokens.map((tokenModel) => tokenModel.remoteCopy()),
    );
  }

  private constructor(
    readonly imageSource: string,
    readonly tileSize: number,
    readonly tokens: RemoteTokenModel[]) { }

  mergedWith(diff: RemoteBoardDiff): RemoteBoardModel {
    const mergedTokens: RemoteTokenModel[] = [];
    mergedTokens.concat(diff.newTokens);
    for (const token of this.tokens) {
      if (diff.removedTokens.includes(token.id)) {
        continue;
      }
      let finalToken = token;
      for (const tokenDiff of diff.tokenDiffs) {
        if (tokenDiff.id === token.id) {
          finalToken = finalToken.mergedWith(tokenDiff);
          break;
        }
      }
      mergedTokens.push(finalToken);
    }
    return new RemoteBoardModel(
      diff.imageSource === undefined ? this.imageSource : diff.imageSource,
      diff.tileSize === undefined ? this.tileSize : diff.tileSize,
      mergedTokens,
    );
  }
}

/** Represents a mutation of RemoteBoardModel. */
export class RemoteBoardDiff {
  static computeBetween(
      newModel: RemoteBoardModel,
      oldModel: RemoteBoardModel): RemoteBoardDiff | undefined {
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
        if (!newToken.equals(oldToken)) {
          console.log('Found token diff (new, old)');
          console.log(newToken);
          console.log(oldToken);
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

    const isValidDiff =
      modifiedTokens.length > 0 ||
      removedTokens.length > 0 ||
      newTokens.length > 0 ||
      diffImageSource != undefined ||
      diffTileSize != undefined;

    if (!isValidDiff) {
      return undefined;
    }

    return new RemoteBoardDiff(
        modifiedTokens,
        removedTokens,
        newTokens,
        diffImageSource,
        diffTileSize,
    );
  }

  constructor(
    readonly tokenDiffs: RemoteTokenDiff[] = [],
    readonly removedTokens: string[] = [],
    readonly newTokens: RemoteTokenModel[] = [],
    readonly imageSource?: string,
    readonly tileSize?: number,
  ) { }
}
