import {ContextMenuModel} from '_client/game_board/context_menu/context_menu_model';
import {Location, Point} from '_common/coordinates';
import {getId} from '_client/common/id_generator';
import {RemoteBoardDiff, RemoteBoardModel, RemoteTokenDiff, RemoteTokenModel} from '_common/board/remote_board_model';
import {LoadedImage, loadImage, loadImages} from '_client/utils/image_utils';

/** Data model for a token on the game board. */
export class TokenModel {
  static create(
      name: string,
      image: LoadedImage,
      size: number,
      location: Location,
      isActive: boolean,
      speed: number): TokenModel {
    console.log('Warning - creating new TokenModel!');
    return new TokenModel(
        getId(), name, image.source, image.image, size, location, isActive,
        speed);
  }

  static fromRemoteAndMap(
      model: RemoteTokenModel,
      imageMap: Map<string, CanvasImageSource>): TokenModel {
    const image = getOrThrow(imageMap, model.imageSource);
    const loadedImage = new LoadedImage(image, model.imageSource);
    return TokenModel.fromRemoteAndImage(model, loadedImage);
  }

  static fromRemoteAndImage(
      model: RemoteTokenModel, loadedImage: LoadedImage): TokenModel {
    return new TokenModel(
        model.id, model.name, loadedImage.source, loadedImage.image,
        model.size, model.location, false, model.speed);
  }

  static async fromRemote(model: RemoteTokenModel): Promise<TokenModel> {
    const loadedImage = await loadImage(model.imageSource);
    return TokenModel.fromRemoteAndImage(model, loadedImage);
  }

  constructor(
      readonly id: string,
      readonly name: string,
      readonly imageSource: string,
      readonly image: CanvasImageSource,
      readonly size: number,
      readonly location: Location,
      readonly isActive: boolean,
      readonly speed: number) {

  }

  mergedWith(diff: RemoteTokenDiff): RemoteTokenModel {
    console.log('Unexpectedly got diffId: ' + diff.id);
    throw new Error('We should not be here!');
  }

  equals(other: TokenModel): boolean {
    if (this.isActive != other.isActive) {
      return false;
    }
    return RemoteTokenModel.equals(this.remoteCopy(), other.remoteCopy());
  }

  deepCopy(): TokenModel {
    return new TokenModel(
        this.id,
        this.name,
        this.imageSource,
        this.image,
        this.size,
        this.location,
        this.isActive,
        this.speed,
    );
  }

  remoteCopy(): RemoteTokenModel {
    return new RemoteTokenModel(
        this.id,
        this.location,
        this.name,
        this.imageSource,
        this.size,
        this.speed,
    );
  }

  mutableCopy(): MutableTokenModel {
    return new MutableTokenModel(
        this.id, this.name, this.imageSource, this.image, this.size,
        this.location, this.isActive, this.speed,
    );
  }
}

/** Mutable version of TokenModel. */
export class MutableTokenModel {
  constructor(
      public id: string,
      public name: string,
      public imageSource: string,
      public image: CanvasImageSource,
      public size: number,
      public location: Location,
      public isActive: boolean,
      public speed: number) {}

  freeze(): TokenModel {
    return new TokenModel(
        this.id, this.name, this.imageSource, this.image, this.size,
        this.location, this.isActive, this.speed,
    );
  }
}

function getOrThrow<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (value == undefined) {
    throw new Error('No value for key: ' + String(key));
  }
  return value;
}

/** Data model representing the game board. */
export class BoardModel {
  width: number;
  height: number;
  rows: number;
  cols: number;

  private constructor(
      readonly id: string,
      public name: string,
      public backgroundImage: LoadedImage,
      public tileSize: number,
      public tokens: TokenModel[],
      public contextMenuState: ContextMenuModel,
      public publicSelection: string[][],
      public localSelection: Location[],
      public gridOffset: Point,
      public scale: number,
      public fogOfWarState: string[][]) {
    this.backgroundImage = backgroundImage.deepCopy();
    this.tileSize = Math.round(tileSize);
    if (this.tileSize != tileSize) {
      console.log('Rounded input tileSize to ' + this.tileSize);
    }

    this.width = <number>backgroundImage.image.width;
    this.height = <number>backgroundImage.image.height;
    this.cols = Math.ceil(this.width / this.tileSize);
    this.rows = Math.ceil(this.height / this.tileSize);

    if (gridOffset.x < 0 || gridOffset.x >= tileSize ||
        gridOffset.y < 0 || gridOffset.y >= tileSize) {
      console.log('Grid offset is invalid! Ignoring.');
      this.gridOffset = {x: 0, y: 0};
    }
    this.tokens = tokens.map((token) => token.deepCopy());
    this.localSelection = localSelection.slice();
    this.contextMenuState = contextMenuState.deepCopy();
    const usePublicSelection =
      publicSelection.length == this.cols &&
      publicSelection[0].length == this.rows;
    this.publicSelection = Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      if (usePublicSelection) {
        this.publicSelection[i] = publicSelection[i].slice();
      } else {
        this.publicSelection[i] = Array(this.rows).fill('0');
      }
    }
    const useFowState =
      fogOfWarState.length == this.cols &&
      fogOfWarState[0].length == this.rows;
    this.fogOfWarState = Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      if (useFowState) {
        this.fogOfWarState[i] = fogOfWarState[i].slice();
      } else {
        this.fogOfWarState[i] = Array(this.rows).fill('0');
      }
    }
  }

  deepCopy(): BoardModel {
    return BoardModel.Builder.from(this).build();
  }

  static createRemote(model: BoardModel): RemoteBoardModel {
    const fogOfWar: string[][] = [];
    for (const column of model.fogOfWarState) {
      fogOfWar.push(column.map((item) => item === '2' ? '1' : item));
    }
    return new RemoteBoardModel(
        model.id,
        model.name,
        model.backgroundImage.source,
        model.tileSize,
        model.tokens.map((tokenModel) => tokenModel.remoteCopy()),
        fogOfWar,
        model.publicSelection.map((col) => col.slice()),
        model.gridOffset,
        model.cols,
        model.rows,
    );
  }

  static async createFromRemote(
      remoteModel: RemoteBoardModel): Promise<BoardModel> {
    const imageSources = remoteModel.tokens.map((token) => token.imageSource);
    imageSources.push(remoteModel.imageSource);
    const imageMap = await loadImages(imageSources);
    return BoardModel.Builder.fromRemote(remoteModel, imageMap).build();
  }

  async mergedFrom(diff: RemoteBoardDiff): Promise<BoardModel> {
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
    const newTokens =
        await Promise.all(diff.newTokens.map(TokenModel.fromRemote));
    newModel.tokens = newModel.tokens.concat(newTokens);
    console.log(newModel.tokens);
    if (diff.tileSize) {
      newModel.tileSize = diff.tileSize;
    }
    if (diff.gridOffset) {
      newModel.gridOffset = diff.gridOffset;
    }
    if (diff.imageSource) {
      newModel.backgroundImage = await loadImage(diff.imageSource);
    }
    newModel.fogOfWarState = this.fogOfWarState.map((col) => col.slice());
    if (diff.fogOfWarDiffs !== undefined) {
      for (const d of diff.fogOfWarDiffs) {
        newModel.fogOfWarState[d.col][d.row] = d.isFogOn ? '1' : '0';
      }
    }
    newModel.publicSelection = this.publicSelection;
    if (diff.publicSelectionDiffs !== undefined) {
      for (const d of diff.publicSelectionDiffs) {
        newModel.publicSelection[d.col][d.row] = d.value;
      }
    }

    return BoardModel.Builder.from(newModel).build();
  }

static Builder = class {
  static from(model: BoardModel): BoardModel.Builder {
    return new BoardModel.Builder()
        .setId(model.id)
        .setName(model.name)
        .setBackgroundImage(model.backgroundImage)
        .setTileSize(model.tileSize)
        .setTokens(model.tokens)
        .setContextMenu(model.contextMenuState)
        .setLocalSelection(model.localSelection)
        .setPublicSelection(model.publicSelection)
        .setGridOffset(model.gridOffset)
        .setScale(model.scale)
        .setFogOfWarState(model.fogOfWarState);
  }

  static fromRemote(
      model: RemoteBoardModel,
      imageMap: Map<string, CanvasImageSource>): BoardModel.Builder {
    const image = getOrThrow(imageMap, model.imageSource);
    const loadedImage = new LoadedImage(image, model.imageSource);
    const tokens =
        model.tokens.map(
            (token) => TokenModel.fromRemoteAndMap(token, imageMap));
    return new BoardModel.Builder()
        .setId(model.id)
        .setName(model.name)
        .setBackgroundImage(loadedImage)
        .setTileSize(model.tileSize)
        .setTokens(tokens)
        .setPublicSelection(model.publicSelection)
        .setGridOffset(model.gridOffset)
        .setFogOfWarState(model.fogOfWar);
  }

  static forNewBoard(): BoardModel.Builder {
    const id = getId();
    console.log('Warning: creating new board with id: ' + id);
    return new BoardModel.Builder().setId(id);
  }

  constructor() {}

  private id?: string = undefined;
  private name?: string = undefined;
  private backgroundImage?: LoadedImage = undefined;
  private tileSize = -1;
  private tokens: TokenModel[] = [];
  private contextMenu: ContextMenuModel =
      new ContextMenuModel({x: 0, y: 0}, false);
  private localSelection: Location[] = [];
  private fogOfWarState: string[][] = []
  private gridOffset: Point = {x: 0, y: 0};
  private publicSelection: string[][] = [];
  private scale = 1;

  private setId(id: string): BoardModel.Builder {
    this.id = id;
    return this;
  }

  setBackgroundImage(image: LoadedImage): BoardModel.Builder {
    this.backgroundImage = image;
    return this;
  }

  setTileSize(tileSize: number): BoardModel.Builder {
    this.tileSize = tileSize;
    return this;
  }

  setTokens(tokens: TokenModel[]): BoardModel.Builder {
    this.tokens = tokens;
    return this;
  }

  addToken(token: TokenModel): BoardModel.Builder {
    this.tokens.push(token);
    return this;
  }

  setContextMenu(contextMenu: ContextMenuModel): BoardModel.Builder {
    this.contextMenu = contextMenu;
    return this;
  }

  setFogOfWarState(state: string[][]): BoardModel.Builder {
    this.fogOfWarState = state;
    return this;
  }

  setLocalSelection(selection: Location[]): BoardModel.Builder {
    this.localSelection = selection;
    return this;
  }

  setPublicSelection(selection: string[][]): BoardModel.Builder {
    this.publicSelection = selection;
    return this;
  }

  setScale(scale: number): BoardModel.Builder {
    this.scale = scale;
    return this;
  }

  setGridOffset(gridOffset: Point): BoardModel.Builder {
    this.gridOffset = gridOffset;
    return this;
  }

  setName(name: string): BoardModel.Builder {
    if (name.length === 0) {
      throw new Error('Board name can not be empty!');
    }
    this.name = name;
    return this;
  }

  build(): BoardModel {
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
    return new BoardModel(
        this.id, this.name, this.backgroundImage, this.tileSize, this.tokens,
        this.contextMenu, this.publicSelection, this.localSelection,
        this.gridOffset, this.scale, this.fogOfWarState);
  }
} // Builder
}

export namespace BoardModel {
  export type Builder = InstanceType<typeof BoardModel.Builder>;
}