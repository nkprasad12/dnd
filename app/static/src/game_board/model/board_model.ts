import {Location, Point, copyPoint, copyLocation, deepCopyList} from '/src/common/common';
import {getId} from '/src/common/id_generator';
import {RemoteBoardDiff, RemoteTokenDiff, RemoteTokenModel} from '/src/game_board/model/remote_board_model';
import {LoadedImage, loadImage} from '/src/utils/image_utils';

/** Data model for a token on the game board. */
export class TokenModel {
  static create(
      name: string,
      image: LoadedImage,
      size: number,
      location: Location,
      isActive: boolean): TokenModel {
    return new TokenModel(
        getId(), name, image.source, image.image, size, location, isActive);
  }

  static async fromRemote(model: RemoteTokenModel): Promise<TokenModel> {
    const loadedImage = await loadImage(model.imageSource);
    return new TokenModel(
        model.id, model.name, loadedImage.source, loadedImage.image,
        model.size, model.location, false);
  }

  constructor(
      readonly id: string,
      readonly name: string,
      readonly imageSource: string,
      readonly image: CanvasImageSource,
      readonly size: number,
      readonly location: Location,
      readonly isActive: boolean) {

  }

  mergedWith(_diff: RemoteTokenDiff): RemoteTokenModel {
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
    );
  }

  remoteCopy(): RemoteTokenModel {
    return new RemoteTokenModel(
        this.id,
        this.location,
        this.name,
        this.imageSource,
        this.size,
    );
  }

  mutableCopy(): MutableTokenModel {
    return new MutableTokenModel(
        this.id, this.name, this.imageSource, this.image, this.size,
        this.location, this.isActive,
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
      public isActive: boolean) {}

  freeze(): TokenModel {
    return new TokenModel(
        this.id, this.name, this.imageSource, this.image, this.size,
        this.location, this.isActive,
    );
  }
}

/** Data model for a context menu on the game board. */
export class ContextMenuModel {
  // TODO: Separate tile selection from the context menu.
  constructor(
      public clickPoint: Point,
      public selectedTiles: Location[],
      public isVisible: boolean) { }

  deepCopy(): ContextMenuModel {
    return new ContextMenuModel(
        copyPoint(this.clickPoint),
        deepCopyList(this.selectedTiles, copyLocation),
        this.isVisible,
    );
  }
}

/** Data model representing the game board. */
export class BoardModel {
  width: number;
  height: number;
  rows: number;
  cols: number;

  constructor(
      public backgroundImage: LoadedImage,
      public tileSize: number,
      public tokens: TokenModel[],
      public contextMenuState: ContextMenuModel,
      public fogOfWarState: boolean[][]) {
    this.backgroundImage = backgroundImage.deepCopy();
    this.tileSize = Math.round(tileSize);
    if (this.tileSize != tileSize) {
      console.log('Rounded input tileSize to ' + this.tileSize);
    }

    this.width = <number>backgroundImage.image.width;
    this.height = <number>backgroundImage.image.height;
    this.cols = Math.ceil(this.width / this.tileSize);
    this.rows = Math.ceil(this.height / this.tileSize);

    this.tokens = deepCopyList(tokens, (token) => token.deepCopy());

    this.contextMenuState = contextMenuState.deepCopy();
    // TODO: Figure out how to do this more efficiently
    const useFowState =
      fogOfWarState.length == this.cols &&
      fogOfWarState[0].length == this.rows;
    this.fogOfWarState = [];
    for (let i = 0; i < this.cols; i++) {
      const colState: Array<boolean> = [];
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

  deepCopy(): BoardModel {
    return BoardModelBuilder.from(this).build();
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
    if (diff.imageSource) {
      newModel.backgroundImage = await loadImage(diff.imageSource);
    }
    return new BoardModelBuilder()
        .setBackgroundImage(newModel.backgroundImage)
        .setContextMenu(newModel.contextMenuState)
        .setFogOfWarState(newModel.fogOfWarState)
        .setTileSize(newModel.tileSize)
        .setTokens(newModel.tokens)
        .build();
  }
}

export class BoardModelBuilder {
  static from(model: BoardModel): BoardModelBuilder {
    return new BoardModelBuilder()
        .setBackgroundImage(model.backgroundImage)
        .setTileSize(model.tileSize)
        .setTokens(model.tokens)
        .setContextMenu(model.contextMenuState)
        .setFogOfWarState(model.fogOfWarState);
  }

  private backgroundImage?: LoadedImage = undefined;
  private tileSize = -1;
  private tokens: TokenModel[] = [];
  private contextMenu: ContextMenuModel =
      new ContextMenuModel({x: 0, y: 0}, [], false);
  private fogOfWarState: boolean[][] = [];

  setBackgroundImage(image: LoadedImage): BoardModelBuilder {
    this.backgroundImage = image;
    return this;
  }

  setTileSize(tileSize: number): BoardModelBuilder {
    this.tileSize = tileSize;
    return this;
  }

  setTokens(tokens: TokenModel[]): BoardModelBuilder {
    this.tokens = tokens;
    return this;
  }

  addToken(token: TokenModel): BoardModelBuilder {
    this.tokens.push(token);
    return this;
  }

  setContextMenu(contextMenu: ContextMenuModel): BoardModelBuilder {
    this.contextMenu = contextMenu;
    return this;
  }

  setFogOfWarState(state: boolean[][]): BoardModelBuilder {
    this.fogOfWarState = state;
    return this;
  }

  build(): BoardModel {
    if (this.backgroundImage == undefined) {
      throw new Error('BoardModelBuilder requires backgroundImage');
    }
    if (this.tileSize < 1) {
      throw new Error('BoardModelBuilder requires a tileSize >= 1');
    }
    return new BoardModel(
        this.backgroundImage, this.tileSize, this.tokens, this.contextMenu,
        this.fogOfWarState);
  }
}
