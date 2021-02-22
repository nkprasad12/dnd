var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { copyPoint, copyLocation, deepCopyList } from '/static/js/common/common.js';
import { getId } from '/static/js/common/id_generator.js';
import { copyFogOfWar, RemoteTokenModel } from '/static/js/game_board/model/remote_board_model.js';
import { LoadedImage, loadImage, loadImages } from '/static/js/utils/image_utils.js';
/** Data model for a token on the game board. */
export class TokenModel {
    constructor(id, name, imageSource, image, size, location, isActive, speed) {
        this.id = id;
        this.name = name;
        this.imageSource = imageSource;
        this.image = image;
        this.size = size;
        this.location = location;
        this.isActive = isActive;
        this.speed = speed;
    }
    static create(name, image, size, location, isActive, speed) {
        console.log('Warning - creating new TokenModel!');
        return new TokenModel(getId(), name, image.source, image.image, size, location, isActive, speed);
    }
    static fromRemoteAndMap(model, imageMap) {
        const image = getOrThrow(imageMap, model.imageSource);
        const loadedImage = new LoadedImage(image, model.imageSource);
        return TokenModel.fromRemoteAndImage(model, loadedImage);
    }
    static fromRemoteAndImage(model, loadedImage) {
        return new TokenModel(model.id, model.name, loadedImage.source, loadedImage.image, model.size, model.location, false, model.speed);
    }
    static fromRemote(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const loadedImage = yield loadImage(model.imageSource);
            return TokenModel.fromRemoteAndImage(model, loadedImage);
        });
    }
    mergedWith(_diff) {
        throw new Error('We should not be here!');
    }
    equals(other) {
        if (this.isActive != other.isActive) {
            return false;
        }
        return RemoteTokenModel.equals(this.remoteCopy(), other.remoteCopy());
    }
    deepCopy() {
        return new TokenModel(this.id, this.name, this.imageSource, this.image, this.size, this.location, this.isActive, this.speed);
    }
    remoteCopy() {
        return new RemoteTokenModel(this.id, this.location, this.name, this.imageSource, this.size, this.speed);
    }
    mutableCopy() {
        return new MutableTokenModel(this.id, this.name, this.imageSource, this.image, this.size, this.location, this.isActive, this.speed);
    }
}
/** Mutable version of TokenModel. */
export class MutableTokenModel {
    constructor(id, name, imageSource, image, size, location, isActive, speed) {
        this.id = id;
        this.name = name;
        this.imageSource = imageSource;
        this.image = image;
        this.size = size;
        this.location = location;
        this.isActive = isActive;
        this.speed = speed;
    }
    freeze() {
        return new TokenModel(this.id, this.name, this.imageSource, this.image, this.size, this.location, this.isActive, this.speed);
    }
}
/** Data model for a context menu on the game board. */
export class ContextMenuModel {
    // TODO: Separate tile selection from the context menu.
    constructor(clickPoint, selectedTiles, isVisible) {
        this.clickPoint = clickPoint;
        this.selectedTiles = selectedTiles;
        this.isVisible = isVisible;
    }
    deepCopy() {
        return new ContextMenuModel(copyPoint(this.clickPoint), deepCopyList(this.selectedTiles, copyLocation), this.isVisible);
    }
}
function getOrThrow(map, key) {
    const value = map.get(key);
    if (value == undefined) {
        throw new Error('No value for key: ' + String(key));
    }
    return value;
}
/** Data model representing the game board. */
export class BoardModel {
    constructor(id, name, backgroundImage, tileSize, tokens, contextMenuState, fogOfWarState) {
        this.id = id;
        this.name = name;
        this.backgroundImage = backgroundImage;
        this.tileSize = tileSize;
        this.tokens = tokens;
        this.contextMenuState = contextMenuState;
        this.fogOfWarState = fogOfWarState;
        this.backgroundImage = backgroundImage.deepCopy();
        this.tileSize = Math.round(tileSize);
        if (this.tileSize != tileSize) {
            console.log('Rounded input tileSize to ' + this.tileSize);
        }
        this.width = backgroundImage.image.width;
        this.height = backgroundImage.image.height;
        this.cols = Math.ceil(this.width / this.tileSize);
        this.rows = Math.ceil(this.height / this.tileSize);
        this.tokens = deepCopyList(tokens, (token) => token.deepCopy());
        this.contextMenuState = contextMenuState.deepCopy();
        // TODO: Figure out how to do this more efficiently
        const useFowState = fogOfWarState.length == this.cols &&
            fogOfWarState[0].length == this.rows;
        this.fogOfWarState = [];
        for (let i = 0; i < this.cols; i++) {
            const colState = [];
            for (let j = 0; j < this.rows; j++) {
                let value = false;
                if (useFowState) {
                    value = fogOfWarState[i][j];
                }
                colState.push(value);
            }
            this.fogOfWarState.push(colState);
        }
    }
    deepCopy() {
        return BoardModel.Builder.from(this).build();
    }
    static createFromRemote(remoteModel) {
        return __awaiter(this, void 0, void 0, function* () {
            const imageSources = remoteModel.tokens.map((token) => token.imageSource);
            imageSources.push(remoteModel.imageSource);
            const imageMap = yield loadImages(imageSources);
            return BoardModel.Builder.fromRemote(remoteModel, imageMap).build();
        });
    }
    mergedFrom(diff) {
        return __awaiter(this, void 0, void 0, function* () {
            const newModel = this.deepCopy();
            for (const tokenDiff of diff.tokenDiffs) {
                for (let i = 0; i < newModel.tokens.length; i++) {
                    if (newModel.tokens[i].id == tokenDiff.id && tokenDiff.location) {
                        const mutableToken = newModel.tokens[i].mutableCopy();
                        mutableToken.location = tokenDiff.location;
                        newModel.tokens[i] = mutableToken.freeze();
                        break;
                    }
                }
            }
            newModel.tokens.filter((token) => !diff.removedTokens.includes(token.id));
            const newTokens = yield Promise.all(diff.newTokens.map(TokenModel.fromRemote));
            newModel.tokens = newModel.tokens.concat(newTokens);
            console.log(newModel.tokens);
            if (diff.tileSize) {
                newModel.tileSize = diff.tileSize;
            }
            if (diff.imageSource) {
                newModel.backgroundImage = yield loadImage(diff.imageSource);
            }
            newModel.fogOfWarState = copyFogOfWar(this.fogOfWarState);
            if (diff.fogOfWarDiffs !== undefined) {
                for (const d of diff.fogOfWarDiffs) {
                    newModel.fogOfWarState[d.col][d.row] = d.isFogOn;
                }
            }
            return BoardModel.Builder.from(newModel).build();
        });
    }
}
BoardModel.Builder = class {
    constructor() {
        this.id = undefined;
        this.name = undefined;
        this.backgroundImage = undefined;
        this.tileSize = -1;
        this.tokens = [];
        this.contextMenu = new ContextMenuModel({ x: 0, y: 0 }, [], false);
        this.fogOfWarState = [];
    }
    static from(model) {
        return new BoardModel.Builder()
            .setId(model.id)
            .setName(model.name)
            .setBackgroundImage(model.backgroundImage)
            .setTileSize(model.tileSize)
            .setTokens(model.tokens)
            .setContextMenu(model.contextMenuState)
            .setFogOfWarState(model.fogOfWarState);
    }
    static fromRemote(model, imageMap) {
        const image = getOrThrow(imageMap, model.imageSource);
        const loadedImage = new LoadedImage(image, model.imageSource);
        const tokens = model.tokens.map((token) => TokenModel.fromRemoteAndMap(token, imageMap));
        return new BoardModel.Builder()
            .setId(model.id)
            .setName(model.name)
            .setBackgroundImage(loadedImage)
            .setTileSize(model.tileSize)
            .setTokens(tokens)
            .setFogOfWarState(model.fogOfWar);
    }
    static forNewBoard() {
        const id = getId();
        console.log('Warning: creating new board with id: ' + id);
        return new BoardModel.Builder().setId(id);
    }
    setId(id) {
        this.id = id;
        return this;
    }
    setBackgroundImage(image) {
        this.backgroundImage = image;
        return this;
    }
    setTileSize(tileSize) {
        this.tileSize = tileSize;
        return this;
    }
    setTokens(tokens) {
        this.tokens = tokens;
        return this;
    }
    addToken(token) {
        this.tokens.push(token);
        return this;
    }
    setContextMenu(contextMenu) {
        this.contextMenu = contextMenu;
        return this;
    }
    setFogOfWarState(state) {
        this.fogOfWarState = state;
        return this;
    }
    setName(name) {
        if (name.length === 0) {
            throw new Error('Board name can not be empty!');
        }
        this.name = name;
        return this;
    }
    build() {
        if (this.id === undefined) {
            throw new Error('BoardModel.Builder requires id');
        }
        if (this.backgroundImage === undefined) {
            throw new Error('BoardModel.Builder requires backgroundImage');
        }
        if (this.tileSize < 1) {
            throw new Error('BoardModel.Builder requires a tileSize >= 1');
        }
        if (this.name === undefined) {
            throw new Error('BoardModel.Builder must have a name');
        }
        return new BoardModel(this.id, this.name, this.backgroundImage, this.tileSize, this.tokens, this.contextMenu, this.fogOfWarState);
    }
};
