import { BoardModel, TokenModel, ContextMenuModel } from "../model/board_model.js"
import { Maybe } from "../../utils/maybe.js"
import { Location, areLocationsEqual } from "../../common/common.js"

const defaultGridColor: string = "rgba(255, 255, 255, 0.3)";
const selectedGridColor: string = "rgba(0, 255, 0, 0.5)";
const fogColor: string = "rgba(0, 0, 0, 1.0)";

function createBoardCanvas(id: string, zIndex: string, parent: HTMLElement): HTMLCanvasElement {
  let canvas = document.createElement('canvas');

  canvas.id = id;
  canvas.style.zIndex = zIndex;
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  parent.appendChild(canvas);

  return canvas;
}

/** View for a game board. */
export class BoardView {

  backgroundCanvas: HTMLCanvasElement;
  fogOfWarCanvas: HTMLCanvasElement;
  tokenCanvas: HTMLCanvasElement;
  gridCanvas: HTMLCanvasElement;
  topCanvas: HTMLCanvasElement;
  allCanvases: Array<HTMLCanvasElement>;

  tiles: Array<Array<Tile>>;
  menu: ContextMenu;
  model: Maybe<BoardModel>;

  constructor(parent: HTMLElement) {
    this.backgroundCanvas = createBoardCanvas("backgroundCanvas", "1", parent);
    this.fogOfWarCanvas = createBoardCanvas("fogOfWarCanvas", "2", parent);
    this.tokenCanvas = createBoardCanvas("tokenCanvas", "3", parent);
    this.gridCanvas = createBoardCanvas("gridCanvas", "4", parent);
    this.topCanvas = createBoardCanvas("topCanvas", "5", parent);
    this.allCanvases = [
      this.backgroundCanvas, this.fogOfWarCanvas, this.tokenCanvas, this.gridCanvas, this.topCanvas];

    this.tiles = [];
    this.menu = new ContextMenu();
    this.model = Maybe.absent();
  }

  bind(newModel: BoardModel): void {
    this.bindBackgroundImage(newModel);
    this.bindGrid(newModel);
    this.bindTokens(newModel);
    this.bindFogOfWarState(newModel);
    this.bindContextMenu(newModel);

    this.model = Maybe.of(newModel);
  }

  private bindBackgroundImage(newModel: BoardModel): void {
    let needsUpdate =
      !this.model.present() ||
      (this.model.get().backgroundImage.source != newModel.backgroundImage.source);

    if (!needsUpdate) {
      return;
    }

    for (let canvas of this.allCanvases) {
      canvas.width = newModel.width;
      canvas.height = newModel.height;
      getContext(canvas).clearRect(0, 0, newModel.width, newModel.height);
    }
    getContext(this.backgroundCanvas).drawImage(newModel.backgroundImage.image, 0, 0);
  }

  private bindGrid(newModel: BoardModel): void {
    let needsUpdate = false;
    if (this.model.present()) {
      let model = this.model.get();
      needsUpdate = needsUpdate || (model.cols != newModel.cols);
      needsUpdate = needsUpdate || (model.rows != newModel.rows);
      needsUpdate = needsUpdate || (model.tileSize != newModel.tileSize);
    } else {
      needsUpdate = true;
    }

    if (!needsUpdate) {
      return;
    }

    this.initializeTileGrid(newModel);
    for (let i = 0; i < newModel.cols; i++) {
      for (let j = 0; j < newModel.rows; j++) {
        this.tiles[i][j].defaultGrid();
      }
    }
  }

  private bindTokens(newModel: BoardModel): void {
    let oldTokens: Array<TokenModel> = []
    if (this.model.present()) {
      oldTokens = this.model.get().tokens;
    }
    let newTokens = newModel.tokens;
    for (let oldToken of oldTokens) {
      let hasMatch = false;
      for (let newToken of newTokens) {
        if (newToken.equals(oldToken)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.clearToken(oldToken, newModel);
      }
    }

    for (let newToken of newTokens) {
      let hasMatch = false;
      for (let oldToken of oldTokens) {
        if (newToken.equals(oldToken)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.drawToken(newToken, newModel);
      }
    }
  }

  private bindFogOfWarState(newModel: BoardModel): void {
    for (let i = 0; i < newModel.cols; i++) {
      for (let j = 0; j < newModel.rows; j++) {
        let tile = this.tiles[i][j];
        tile.bindFogOfWar(newModel.fogOfWarState[i][j]);
      }
    }
  }

  private bindContextMenu(newModel: BoardModel): void {
    this.menu.bind(newModel.contextMenuState);
    let oldSelection: Array<Location> = [];
    if (this.model.present()) {
      oldSelection = this.model.get().contextMenuState.selectedTiles;
    }
    let newSelection: Array<Location> = [];
    if (newModel.contextMenuState.isVisible) {
      newSelection = newModel.contextMenuState.selectedTiles;
    }

    for (let oldTile of oldSelection) {
      let hasMatch = false;
      for (let newTile of newSelection) {
        if (areLocationsEqual(oldTile, newTile)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.tiles[oldTile.col][oldTile.row].defaultGrid();
      }
    }

    for (let newTile of newSelection) {
      let hasMatch = false;
      for (let oldTile of oldSelection) {
        if (areLocationsEqual(oldTile, newTile)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.tiles[newTile.col][newTile.row].selectedGrid();
      }
    }
  }

  private initializeTileGrid(model: BoardModel): void {
    this.tiles = [];
    for (let i = 0; i < model.cols; i++) {
      this.tiles.push([]);
      for (let j = 0; j < model.rows; j++) {
        this.tiles[i].push(
          new Tile(model.tileSize, { col: i, row: j }, this.fogOfWarCanvas, this.gridCanvas));
      }
    }
  }

  private drawToken(tokenModel: TokenModel, newModel: BoardModel): void {
    getContext(this.tokenCanvas)
      .drawImage(tokenModel.image.image,
        tokenModel.location.col * newModel.tileSize, tokenModel.location.row * newModel.tileSize,
        tokenModel.size, tokenModel.size);
  }

  private clearToken(tokenModel: TokenModel, newModel: BoardModel): void {
    getContext(this.tokenCanvas)
      .clearRect(
        tokenModel.location.col * newModel.tileSize - 1, tokenModel.location.row * newModel.tileSize - 1,
        tokenModel.size + 2, tokenModel.size + 2);
  }

}

/** Represents a tile in the game board. */
class Tile {

  size: number;
  startX: number;
  startY: number;

  fogOfWarCanvas: HTMLCanvasElement;
  gridCanvas: HTMLCanvasElement;

  hasFog: boolean;

  constructor(
    size: number,
    location: Location,
    fogOfWarCanvas: HTMLCanvasElement,
    gridCanvas: HTMLCanvasElement) {

    this.size = size;
    this.startX = location.col * size;
    this.startY = location.row * size;
    this.fogOfWarCanvas = fogOfWarCanvas;
    this.gridCanvas = gridCanvas;
    this.hasFog = false;
  }

  clearGrid(): void {
    getContext(this.gridCanvas)
      .clearRect(
        this.startX - 1, this.startY - 1,
        this.size + 2, this.size + 2);
  }

  defaultGrid(): void {
    this.clearGrid();
    drawCanvasTile(this.startX, this.startY, this.size, defaultGridColor, this.gridCanvas);
  }

  selectedGrid(): void {
    this.clearGrid();
    drawCanvasTile(this.startX, this.startY, this.size, selectedGridColor, this.gridCanvas);
  }

  bindFogOfWar(showFog: boolean): void {
    if (showFog == this.hasFog) {
      return;
    }
    if (showFog) {
      fillCanvasTile(this.startX, this.startY, this.size, fogColor, this.fogOfWarCanvas);
      this.hasFog = true;
    } else {
      getContext(this.fogOfWarCanvas).clearRect(this.startX, this.startY, this.size, this.size);
      this.hasFog = false;
    }
  }
}

class ContextMenu {

  menu = <HTMLElement>document.getElementById('rightClickMenu');
  clearFogButton = <HTMLElement>document.getElementById('clear-fow');
  applyFogButton = <HTMLElement>document.getElementById('apply-fow');

  tiles: Array<Tile>;

  constructor() {
    this.tiles = []
    this.menu.style.display = 'none';
    this.clearFogButton.style.display = 'initial';
    this.applyFogButton.style.display = 'initial';
  }

  bind(model: ContextMenuModel): void {
    if (model.isVisible) {
      let point = model.clickPoint;
      this.menu.style.top = point.y + "px";
      this.menu.style.left = point.x + "px";
      this.menu.style.display = 'initial';
    } else {
      this.menu.style.display = 'none';
    }
    // TODO: Remove irrelevant menu options.
  }
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  let context = canvas.getContext("2d");
  if (context == null) {
    throw 'Canvas context was null!'
  }
  return context;
}

function drawCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement): void {
  let ctx = getContext(canvas)

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function fillCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement): void {
  let ctx = getContext(canvas);

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
