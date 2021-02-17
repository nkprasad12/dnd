import { Location, Point, areLocationsEqual, copyPoint, copyLocation, deepCopyList } from "/src/common/common"
import { getId } from "/src/common/id_generator"
import { LoadedImage } from "/src/utils/image_utils"

/** Data model for a token on the game board. */
export class TokenModel {

  static create(
    name: string,
    image: LoadedImage,
    size: number,
    location: Location,
    isActive: boolean): TokenModel {

    return new TokenModel(getId(), name, image, size, location, isActive);
  }

  private constructor(
    readonly id: string, public name: string, public image: LoadedImage, public size: number,
    public location: Location, public isActive: boolean) { }

  equals(other: TokenModel): boolean {
    if (this.id != other.id) {
      return false;
    }
    if (this.name != other.name) {
      return false;
    }
    if (this.image.source != other.image.source) {
      return false;
    }
    if (this.size != other.size) {
      return false;
    }
    if (!areLocationsEqual(this.location, other.location)) {
      return false;
    }
    if (this.isActive != other.isActive) {
      return false;
    }
    return true;
  }

  deepCopy(): TokenModel {
    return new TokenModel(
      this.id,
      this.name,
      this.image.deepCopy(),
      this.size,
      copyLocation(this.location),
      this.isActive,
    );
  }
}

/** Data model for a context menu on the game board. */
export class ContextMenuModel {

  // TODO: Separate tile selection from the context menu.
  constructor(
    public clickPoint: Point, public selectedTiles: Location[], public isVisible: boolean) { }

  deepCopy(): ContextMenuModel {
    return new ContextMenuModel(
      copyPoint(this.clickPoint),
      deepCopyList(this.selectedTiles, copyLocation),
      this.isVisible
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
    this.tileSize = Math.round(tileSize)
    if (this.tileSize != tileSize) {
      console.log("Rounded input tileSize to " + this.tileSize);
    }

    this.width = <number>backgroundImage.image.width;
    this.height = <number>backgroundImage.image.height;
    this.cols = Math.ceil(this.width / this.tileSize);
    this.rows = Math.ceil(this.height / this.tileSize);

    this.tokens = deepCopyList(tokens, (token) => token.deepCopy());

    this.contextMenuState = contextMenuState.deepCopy();
    // TODO: Figure out how to do this more efficiently
    let useFowState =
      fogOfWarState.length == this.cols &&
      fogOfWarState[0].length == this.rows;
    this.fogOfWarState = [];
    for (let i = 0; i < this.cols; i++) {
      let colState: Array<boolean> = [];
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
  private contextMenu: ContextMenuModel = new ContextMenuModel({ x: 0, y: 0 }, [], false);
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
    this.contextMenu = contextMenu
    return this;
  }

  setFogOfWarState(state: boolean[][]): BoardModelBuilder {
    this.fogOfWarState = state;
    return this;
  }

  build(): BoardModel {
    if (this.backgroundImage == undefined) {
      throw 'BoardModelBuilder requires backgroundImage';
    }
    if (this.tileSize < 1) {
      throw 'BoardModelBuilder requires a tileSize >= 1';
    }
    return new BoardModel(
      this.backgroundImage, this.tileSize, this.tokens, this.contextMenu,
      this.fogOfWarState);
  }
}
