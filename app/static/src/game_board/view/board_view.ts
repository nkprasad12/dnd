import {Location, areLocationsEqual, tileDistance} from '/src/common/common';
import {BoardModel, TokenModel, ContextMenuModel} from '/src/game_board/model/board_model';

const defaultGridColor: string = 'rgba(255, 255, 255, 0.3)';
const selectedGridColor: string = 'rgba(0, 255, 0, 0.5)';
const activeTokenColor: string = 'rgba(200, 0, 200, 0.5)';
const movableToColor: string = 'rgba(200, 0, 00, 0.37)';
const fogColor: string = 'rgba(0, 0, 0, 1.0)';

function createBoardCanvas(
    id: string, zIndex: string, parent: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  canvas.id = id;
  canvas.style.zIndex = zIndex;
  canvas.style.position = 'absolute';
  canvas.style.left = '0px';
  canvas.style.top = '0px';
  parent.appendChild(canvas);

  return canvas;
}

/** View for a game board. */
export class BoardView {
  private readonly backgroundCanvas: HTMLCanvasElement;
  private readonly fogOfWarCanvas: HTMLCanvasElement;
  private readonly tokenCanvas: HTMLCanvasElement;
  private readonly gridCanvas: HTMLCanvasElement;
  private readonly allCanvases: Array<HTMLCanvasElement>;
  readonly topCanvas: HTMLCanvasElement;

  readonly menu: ContextMenu = new ContextMenu();

  private tiles: Tile[][] = [];
  private model?: BoardModel = undefined;

  constructor(parent: HTMLElement) {
    this.backgroundCanvas = createBoardCanvas('backgroundCanvas', '1', parent);
    this.tokenCanvas = createBoardCanvas('tokenCanvas', '2', parent);
    this.fogOfWarCanvas = createBoardCanvas('fogOfWarCanvas', '3', parent);
    this.gridCanvas = createBoardCanvas('gridCanvas', '4', parent);
    this.topCanvas = createBoardCanvas('topCanvas', '5', parent);
    this.allCanvases = [
      this.backgroundCanvas,
      this.fogOfWarCanvas,
      this.tokenCanvas,
      this.gridCanvas,
      this.topCanvas,
    ];
  }

  bind(newModel: BoardModel): void {
    this.bindBackgroundImage(newModel);
    this.bindGrid(newModel);
    this.bindTokens(newModel);
    this.bindFogOfWarState(newModel);
    this.bindContextMenu(newModel);

    this.model = newModel;
  }

  private bindBackgroundImage(newModel: BoardModel): void {
    const needsUpdate =
      this.model == undefined ||
      (this.model.backgroundImage.source != newModel.backgroundImage.source);

    if (!needsUpdate) {
      return;
    }

    for (const canvas of this.allCanvases) {
      canvas.width = newModel.width;
      canvas.height = newModel.height;
      getContext(canvas).clearRect(0, 0, newModel.width, newModel.height);
    }
    getContext(this.backgroundCanvas)
        .drawImage(newModel.backgroundImage.image, 0, 0);
  }

  private bindGrid(newModel: BoardModel): void {
    let needsUpdate = false;
    if (this.model != undefined) {
      const model = this.model;
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
    let oldTokens: TokenModel[] = [];
    if (this.model != undefined) {
      oldTokens = this.model.tokens;
    }
    const newTokens = newModel.tokens;
    for (const oldToken of oldTokens) {
      let hasMatch = false;
      for (const newToken of newTokens) {
        if (newToken.equals(oldToken)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.clearToken(oldToken, newModel);
      }
    }

    for (const newToken of newTokens) {
      let hasMatch = false;
      for (const oldToken of oldTokens) {
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
        const tile = this.tiles[i][j];
        tile.bindFogOfWar(newModel.fogOfWarState[i][j]);
      }
    }
  }

  private bindContextMenu(newModel: BoardModel): void {
    this.menu.bind(newModel.contextMenuState);
    let oldSelection: Array<Location> = [];
    if (this.model != undefined) {
      oldSelection = this.model.contextMenuState.selectedTiles;
    }
    let newSelection: Array<Location> = [];
    if (newModel.contextMenuState.isVisible) {
      newSelection = newModel.contextMenuState.selectedTiles;
    }

    for (const oldTile of oldSelection) {
      let hasMatch = false;
      for (const newTile of newSelection) {
        if (areLocationsEqual(oldTile, newTile)) {
          hasMatch = true;
          break;
        }
      }
      if (!hasMatch) {
        this.tiles[oldTile.col][oldTile.row].defaultGrid();
      }
    }

    for (const newTile of newSelection) {
      let hasMatch = false;
      for (const oldTile of oldSelection) {
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
            new Tile(
                model.tileSize,
                {col: i, row: j},
                this.fogOfWarCanvas,
                this.gridCanvas));
      }
    }
  }

  private drawToken(tokenModel: TokenModel, newModel: BoardModel): void {
    const tokenSize = tokenModel.size * newModel.tileSize;
    getContext(this.tokenCanvas)
        .drawImage(tokenModel.image,
            tokenModel.location.col * newModel.tileSize,
            tokenModel.location.row * newModel.tileSize,
            tokenSize, tokenSize);
    if (tokenModel.isActive) {
      this.getTile(tokenModel.location).activeTokenGrid();
      this.getMovableTiles(tokenModel, newModel)
          .map((tile) => tile.activeTokenGrid());
    }
  }

  private clearToken(tokenModel: TokenModel, newModel: BoardModel): void {
    const tokenSize = tokenModel.size * newModel.tileSize;
    getContext(this.tokenCanvas)
        .clearRect(
            tokenModel.location.col * newModel.tileSize - 1,
            tokenModel.location.row * newModel.tileSize - 1,
            tokenSize + 2, tokenSize + 2);
    this.getTile(tokenModel.location).defaultGrid();
    if (tokenModel.isActive) {
      this.getMovableTiles(tokenModel, newModel)
          .map((tile) => tile.defaultGrid());
    }
  }

  private getMovableTiles(
      tokenModel: TokenModel, newModel: BoardModel): Tile[] {
    const result: Tile[] = [];
    for (let i = 0; i < newModel.cols; i++) {
      for (let j = 0; j < newModel.rows; j++) {
        const d = tileDistance(tokenModel.location, {col: i, row: j});
        if (0 < d && d <= tokenModel.speed) {
          result.push(this.tiles[i][j]);
        }
      }
    }
    return result;
  }

  private getTile(tile: Location): Tile {
    return this.tiles[tile.col][tile.row];
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

  private clearGrid(): void {
    getContext(this.gridCanvas)
        .clearRect(
            this.startX - 1, this.startY - 1,
            this.size + 2, this.size + 2);
  }

  defaultGrid(): void {
    this.clearGrid();
    drawCanvasTile(
        this.startX, this.startY, this.size, defaultGridColor, this.gridCanvas);
  }

  selectedGrid(): void {
    this.clearGrid();
    drawCanvasTile(
        this.startX,
        this.startY,
        this.size,
        selectedGridColor,
        this.gridCanvas);
  }

  activeTokenGrid(): void {
    this.clearGrid();
    drawCanvasTile(
        this.startX,
        this.startY,
        this.size,
        activeTokenColor,
        this.gridCanvas);
  }

  movableToGrid(): void {
    // TODO - rethink this logic. We might overwrite something and then not
    // bring it back. Might be better to have movable on a different layer.
    this.clearGrid();
    drawCanvasTile(
        this.startX,
        this.startY,
        this.size,
        movableToColor,
        this.gridCanvas);
  }

  bindFogOfWar(showFog: boolean): void {
    if (showFog == this.hasFog) {
      return;
    }
    if (showFog) {
      fillCanvasTile(
          this.startX, this.startY, this.size, fogColor, this.fogOfWarCanvas);
      this.hasFog = true;
    } else {
      getContext(this.fogOfWarCanvas)
          .clearRect(this.startX, this.startY, this.size, this.size);
      this.hasFog = false;
    }
  }
}

class ContextMenu {
  menu = <HTMLElement>document.getElementById('rightClickMenu');
  clearFogButton = <HTMLElement>document.getElementById('clear-fow');
  applyFogButton = <HTMLElement>document.getElementById('apply-fow');
  addTokenButton = <HTMLElement>document.getElementById('add-token');

  tiles: Array<Tile>;

  constructor() {
    this.tiles = [];
    this.menu.style.display = 'none';
    this.clearFogButton.style.display = 'initial';
    this.applyFogButton.style.display = 'initial';
    this.addTokenButton.style.display = 'initial';
  }

  bind(model: ContextMenuModel): void {
    if (model.isVisible) {
      const point = model.clickPoint;
      this.menu.style.top = point.y + 'px';
      this.menu.style.left = point.x + 'px';
      this.menu.style.display = 'initial';
    } else {
      this.menu.style.display = 'none';
    }
    // TODO: Remove irrelevant menu options.
  }
}

function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (context == null) {
    throw new Error('Canvas context was null!');
  }
  return context;
}

function drawCanvasTile(
    x: number,
    y: number,
    size: number,
    color: string,
    canvas: HTMLCanvasElement): void {
  const ctx = getContext(canvas);

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function fillCanvasTile(
    x: number,
    y: number,
    size: number,
    color: string,
    canvas: HTMLCanvasElement): void {
  const ctx = getContext(canvas);

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
