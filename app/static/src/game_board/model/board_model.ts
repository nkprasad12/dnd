import { LoadedImage } from "../../utils/image_utils.js"
import { Maybe } from "../../utils/maybe.js"
import { Location, Point, areLocationsEqual } from "../../common/common.js"

/** Data model for a token on the game board. */
export class TokenModel {

  name: string;
  image: LoadedImage;
  size: number;
  location: Location;
  isActive: boolean;

  constructor(name: string, loadedImage: LoadedImage, size: number, location: Location, isActive: boolean) {
    this.name = name;
    this.image = loadedImage;
    this.size = size;
    this.location = location;
    this.isActive = isActive;
  }

  equals(other: TokenModel): boolean {
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
}

/** Data model for a context menu on the game board. */
export class ContextMenuModel {

  clickPoint: Point;
  selectedTiles: Array<Location>;

  constructor(clickPoint: Point, selectedTiles: Array<Location>) {
    this.clickPoint = clickPoint;
    this.selectedTiles = selectedTiles;
  }
}

/** Data model representing the game board. */
export class BoardModel {

  backgroundImage: LoadedImage;
  tileSize: number;

  width: number;
  height: number;
  rows: number;
  cols: number;

  tokens: Array<TokenModel>;
  activeToken: Maybe<TokenModel>;

  contextMenuState: Maybe<ContextMenuModel>;
  fogOfWarState: Array<Array<boolean>>;

  constructor(
    backgroundImage: LoadedImage,
    tileSize: number,
    tokens: Array<TokenModel>,
    contextMenuState: Maybe<ContextMenuModel>) {

    this.backgroundImage = backgroundImage;
    this.tileSize = Math.round(tileSize)
    if (this.tileSize != tileSize) {
      console.log("Rounded input tileSize to " + this.tileSize);
    }

    this.width = <number>backgroundImage.image.width;
    this.height = <number>backgroundImage.image.height;
    this.cols = Math.ceil(this.width / this.tileSize);
    this.rows = Math.ceil(this.height / this.tileSize);

    this.tokens = tokens;
    this.activeToken = Maybe.absent();

    this.contextMenuState = contextMenuState;
    this.fogOfWarState = [];
    for (let i = 0; i < this.cols; i++) {
      let colState: Array<boolean> = [];
      for (let j = 0; j < this.rows; j++) {
        colState.push(false);
      }
      this.fogOfWarState.push(colState);
    }
  }
}

export class BoardModelBuilder {

  backgroundImage: Maybe<LoadedImage>;
  tileSize: number;
  tokens: Array<TokenModel>;
  contextMenu: Maybe<ContextMenuModel>;

  constructor() {
    this.backgroundImage = Maybe.absent();
    this.tileSize = -1;
    this.tokens = [];
    this.contextMenu = Maybe.absent()
  }

  setBackgroundImage(image: LoadedImage): BoardModelBuilder {
    this.backgroundImage = Maybe.of(image);
    return this;
  }

  setTileSize(tileSize: number): BoardModelBuilder {
    this.tileSize = tileSize;
    return this;
  }

  addToken(token: TokenModel): BoardModelBuilder {
    this.tokens.push(token);
    return this;
  }

  setContextMenu(contextMenu: ContextMenuModel): BoardModelBuilder {
    this.contextMenu = Maybe.of(contextMenu);
    return this;
  }

  build(): BoardModel {
    if (!this.backgroundImage.present()) {
      throw 'BoardModelBuilder requires backgroundImage';
    }
    if (this.tileSize < 1) {
      throw 'BoardModelBuilder requires a tileSize >= 1';
    }
    return new BoardModel(
      this.backgroundImage.get(), this.tileSize, this.tokens, this.contextMenu);
  }
}
