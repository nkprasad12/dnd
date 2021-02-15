import { LoadedImage } from "../../utils/image_utils.js"
import { Maybe } from "../../utils/maybe.js"
import { Location, Point, areLocationsEqual, copyPoint, copyLocation, deepCopyList } from "../../common/common.js"

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

  deepCopy(): TokenModel {
    return new TokenModel(
      this.name, 
      this.image.deepCopy(),
      this.size,
      copyLocation(this.location),
      this.isActive
    );
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

  deepCopy(): ContextMenuModel {
    return new ContextMenuModel(
      copyPoint(this.clickPoint),
      deepCopyList(this.selectedTiles, copyLocation)
    );
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

  contextMenuState: Maybe<ContextMenuModel>;
  fogOfWarState: Array<Array<boolean>>;

  constructor(
    backgroundImage: LoadedImage,
    tileSize: number,
    tokens: Array<TokenModel>,
    contextMenuState: Maybe<ContextMenuModel>) {

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

    if (contextMenuState.present()) {
      this.contextMenuState = Maybe.of(contextMenuState.get().deepCopy());
    } else {
      this.contextMenuState = Maybe.absent();
    }
    this.fogOfWarState = [];
    for (let i = 0; i < this.cols; i++) {
      let colState: Array<boolean> = [];
      for (let j = 0; j < this.rows; j++) {
        colState.push(false);
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
    let builder = new BoardModelBuilder()
      .setBackgroundImage(model.backgroundImage)
      .setTileSize(model.tileSize)
      .setTokens(model.tokens);
    if (model.contextMenuState.present()) {
      builder.setContextMenu(model.contextMenuState.get());
    }
    return builder;
  }

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

  setTokens(tokens: Array<TokenModel>): BoardModelBuilder {
    this.tokens = tokens;
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
