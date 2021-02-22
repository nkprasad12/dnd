import { areLocationsEqual } from '/static/js/common/common.js';
const DEFAULT_SPEED = 6;
/**
 * Represents the data model for a remote token.
 * This is a subset of TokenModel that is relevant to the shared game state.
 */
export class RemoteTokenModel {
    constructor(id, location, name, imageSource, size, speed) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.imageSource = imageSource;
        this.size = size;
        this.speed = speed;
    }
    static isValid(input) {
        const maybeToken = input;
        const isValid = maybeToken.id !== undefined &&
            maybeToken.location !== undefined &&
            maybeToken.name !== undefined &&
            maybeToken.imageSource !== undefined &&
            maybeToken.size !== undefined &&
            maybeToken.speed !== undefined;
        return isValid;
    }
    static fillDefaults(input) {
        if (input.speed === undefined) {
            input.speed = DEFAULT_SPEED;
        }
        return input;
    }
    static equals(first, other) {
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
        if (first.speed != other.speed) {
            return false;
        }
        return true;
    }
    static mergedWith(model, diff) {
        if (diff.id != model.id) {
            console.log('[RemoteTokenModel] Diff ID does not match current ID');
            return model;
        }
        return new RemoteTokenModel(model.id, diff.location === undefined ? model.location : diff.location, diff.name === undefined ? model.name : diff.name, diff.imageSource === undefined ? model.imageSource : diff.imageSource, diff.size === undefined ? model.size : diff.size, diff.speed === undefined ? model.speed : diff.speed);
    }
}
/** Represents a mutation of RemoteTokenModel. */
export class RemoteTokenDiff {
    constructor(id, location, name, imageSource, size, speed) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.imageSource = imageSource;
        this.size = size;
        this.speed = speed;
    }
    static isValid(input) {
        const maybeDiff = input;
        const isValid = maybeDiff.id !== undefined;
        return isValid;
    }
    static computeBetween(newModel, oldModel) {
        if (newModel.id != oldModel.id) {
            throw new Error('[RemoteTokenDiff] Models have different IDs!');
        }
        return new RemoteTokenDiff(newModel.id, areLocationsEqual(newModel.location, oldModel.location) ?
            undefined : newModel.location, newModel.name === oldModel.name ?
            undefined : newModel.name, newModel.imageSource === oldModel.imageSource ?
            undefined : newModel.imageSource, newModel.size === oldModel.size ?
            undefined : newModel.size, newModel.speed === oldModel.speed ?
            undefined : newModel.speed);
    }
}
/**
 * Represents the data model for a remote board.
 * This is a subset of BoardModel that is relevant to the shared game state.
 */
export class RemoteBoardModel {
    constructor(id, name, imageSource, tileSize, tokens, fogOfWar, cols, rows) {
        this.id = id;
        this.name = name;
        this.imageSource = imageSource;
        this.tileSize = tileSize;
        this.tokens = tokens;
        this.fogOfWar = fogOfWar;
        this.cols = cols;
        this.rows = rows;
    }
    static isValid(input) {
        const maybeModel = input;
        const isValid = maybeModel.id !== undefined &&
            maybeModel.name !== undefined &&
            maybeModel.imageSource !== undefined &&
            maybeModel.tileSize != undefined &&
            maybeModel.tokens !== undefined &&
            maybeModel.fogOfWar !== undefined &&
            maybeModel.cols !== undefined &&
            maybeModel.rows !== undefined;
        if (!isValid) {
            return false;
        }
        for (const maybeToken of maybeModel.tokens) {
            if (!RemoteTokenModel.isValid(maybeToken)) {
                return false;
            }
        }
        return isValid;
    }
    static fillDefaults(input) {
        if (input.tokens === undefined) {
            return;
        }
        for (let i = 0; i < input.tokens.length; i++) {
            input.tokens[i] = RemoteTokenModel.fillDefaults(input.tokens[i]);
        }
        if (input.rows === undefined || input.cols === undefined) {
            console.log('Rows or cols are undefined');
            return;
        }
        if (input.fogOfWar === undefined) {
            input.fogOfWar = [];
            for (let i = 0; i < input.cols; i++) {
                input.fogOfWar.push([]);
                for (let j = 0; j < input.rows; j++) {
                    input.fogOfWar[i].push(false);
                }
            }
        }
        return input;
    }
    static create(model) {
        const fogOfWar = [];
        for (const column of model.fogOfWarState) {
            fogOfWar.push(column.slice());
        }
        return new RemoteBoardModel(model.id, model.name, model.backgroundImage.source, model.tileSize, model.tokens.map((tokenModel) => tokenModel.remoteCopy()), fogOfWar, model.cols, model.rows);
    }
    static mergedWith(model, diff) {
        if (model.id != diff.id) {
            throw new Error('[RemoteBoardModel] mergedWith called with different ids');
        }
        let mergedTokens = [];
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
        const fogOfWarState = copyFogOfWar(model.fogOfWar);
        if (diff.fogOfWarDiffs !== undefined) {
            for (const d of diff.fogOfWarDiffs) {
                fogOfWarState[d.col][d.row] = d.isFogOn;
            }
        }
        return new RemoteBoardModel(model.id, diff.name === undefined ? model.name : diff.name, diff.imageSource === undefined ? model.imageSource : diff.imageSource, diff.tileSize === undefined ? model.tileSize : diff.tileSize, mergedTokens, fogOfWarState, model.cols, model.rows);
    }
}
export function copyFogOfWar(fogOfWar) {
    const result = [];
    for (const column of fogOfWar) {
        result.push(column.slice());
    }
    return result;
}
/** Represents a mutation of RemoteBoardModel. */
export class RemoteBoardDiff {
    constructor(id, name, tokenDiffs = [], removedTokens = [], newTokens = [], imageSource, tileSize, fogOfWarDiffs) {
        this.id = id;
        this.name = name;
        this.tokenDiffs = tokenDiffs;
        this.removedTokens = removedTokens;
        this.newTokens = newTokens;
        this.imageSource = imageSource;
        this.tileSize = tileSize;
        this.fogOfWarDiffs = fogOfWarDiffs;
    }
    static isValid(input) {
        const maybeDiff = input;
        const isValid = maybeDiff.id !== undefined &&
            maybeDiff.newTokens !== undefined &&
            maybeDiff.removedTokens !== undefined &&
            maybeDiff.tokenDiffs != undefined;
        if (!isValid) {
            return false;
        }
        for (const tokenDiff of maybeDiff.tokenDiffs) {
            if (!RemoteTokenDiff.isValid(tokenDiff)) {
                return false;
            }
        }
        for (const newToken of maybeDiff.tokenDiffs) {
            if (!RemoteTokenDiff.isValid(newToken)) {
                return false;
            }
        }
        return isValid;
    }
    static computeBetween(newModel, oldModel) {
        if (newModel.id != oldModel.id) {
            throw new Error('[RemoteBoardDiff] computeBetween called with diferent ids');
        }
        const newTokens = [];
        const modifiedTokens = [];
        const removedTokens = [];
        for (const newToken of newModel.tokens) {
            let foundMatch = false;
            for (const oldToken of oldModel.tokens) {
                if (newToken.id != oldToken.id) {
                    continue;
                }
                foundMatch = true;
                if (!RemoteTokenModel.equals(newToken, oldToken)) {
                    modifiedTokens.push(RemoteTokenDiff.computeBetween(newToken, oldToken));
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
        const fogOfWarDiffs = [];
        if (newModel.imageSource === oldModel.imageSource) {
            for (let i = 0; i < newModel.cols; i++) {
                for (let j = 0; j < newModel.rows; j++) {
                    if (oldModel.fogOfWar[i][j] === newModel.fogOfWar[i][j]) {
                        continue;
                    }
                    fogOfWarDiffs.push({ col: i, row: j, isFogOn: newModel.fogOfWar[i][j] });
                }
            }
        }
        else {
            console.log('Warning - skipping fog of war diff calculation.');
        }
        const diffImageSource = newModel.imageSource === oldModel.imageSource ?
            undefined : newModel.imageSource;
        const diffTileSize = newModel.tileSize === oldModel.tileSize ? undefined : newModel.tileSize;
        const diffName = newModel.name === oldModel.name ? undefined : newModel.name;
        const isValidDiff = diffName != undefined ||
            modifiedTokens.length > 0 ||
            removedTokens.length > 0 ||
            newTokens.length > 0 ||
            diffImageSource != undefined ||
            diffTileSize != undefined ||
            fogOfWarDiffs.length > 0;
        if (!isValidDiff) {
            return undefined;
        }
        return new RemoteBoardDiff(newModel.id, diffName, modifiedTokens, removedTokens, newTokens, diffImageSource, diffTileSize, fogOfWarDiffs);
    }
}
