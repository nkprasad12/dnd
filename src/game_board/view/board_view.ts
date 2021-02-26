import {Location, areLocationsEqual, tileDistance} from '/src/common/common';
import {BoardModel, TokenModel, ContextMenuModel} from '/src/game_board/model/board_model';

const defaultGridColor: string = 'rgba(255, 255, 255, 0.3)';
const selectedGridColor: string = 'rgba(0, 60, 0, 0.75)';
const activeTokenColor: string = 'rgba(200, 0, 200, 0.5)';
const movableToGridColor: string = 'rgba(100, 0, 0, 0.3)';
const movableToTileColor: string = 'rgba(255, 220, 220, 0.15)';
const fogColor: string = 'rgba(0, 0, 0, 1.0)';
const peekFogColor: string = 'rgba(0, 0, 0, 0.5)';
const selectedTileColor: string = 'rgba(200, 255, 200, 0.25)';
const publicSelectionBlue: string = 'rgba(0, 0, 204, 0.20)';
const publicSelectionOrange: string = 'rgba(255, 128, 0, 0.20)';

function createBoardCanvas(
    zIndex: string, parent: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

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
  private readonly localSelectionCanvas: HTMLCanvasElement;
  private readonly publicSelectionCanvas: HTMLCanvasElement;
  private readonly gridCanvas: HTMLCanvasElement;
  private readonly allCanvases: Array<HTMLCanvasElement>;
  readonly topCanvas: HTMLCanvasElement;

  readonly menu: ContextMenu = new ContextMenu();

  private tiles: Tile[][] = [];
  private model?: BoardModel = undefined;

  constructor(parent: HTMLElement) {
    this.backgroundCanvas = createBoardCanvas('1', parent);
    this.tokenCanvas = createBoardCanvas('2', parent);
    this.fogOfWarCanvas = createBoardCanvas('3', parent);
    this.publicSelectionCanvas = createBoardCanvas('4', parent);
    this.localSelectionCanvas =
        createBoardCanvas('5', parent);
    this.gridCanvas = createBoardCanvas('6', parent);
    this.topCanvas = createBoardCanvas('7', parent);
    this.allCanvases = [
      this.backgroundCanvas,
      this.fogOfWarCanvas,
      this.publicSelectionCanvas,
      this.tokenCanvas,
      this.localSelectionCanvas,
      this.gridCanvas,
      this.topCanvas,
    ];
  }

  bind(newModel: BoardModel): void {
    this.bindBackgroundImage(newModel);
    this.handleTileSizeChange(newModel);
    this.bindGrid(newModel);
    this.bindTokens(newModel);
    this.bindFogOfWarState(newModel);
    this.bindLocalSelection(newModel);
    this.bindPublicSelection(newModel);
    this.bindContextMenu(newModel);

    this.model = newModel;
  }

  private handleTileSizeChange(newModel: BoardModel): void {
    if (newModel.tileSize === this.model?.tileSize) {
      return;
    }
    this.model = undefined;
    for (const canvas of this.allCanvases) {
      if (canvas === this.backgroundCanvas) {
        continue;
      }
      getContext(canvas).clearRect(0, 0, canvas.width, canvas.height);
    }
    // TODO: We need to handle moving the tokens here if they're
    //       of bounds. But this needs to be propagated back up...
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

  private bindLocalSelection(newModel: BoardModel): void {
    let oldSelection: Location[] = [];
    if (this.model != undefined) {
      oldSelection = this.model.localSelection;
    }
    const newSelection = newModel.localSelection;

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
        this.tiles[oldTile.col][oldTile.row].selectionOff();
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
        this.tiles[newTile.col][newTile.row].localSelectionOn();
      }
    }
  }

  private bindPublicSelection(newModel: BoardModel): void {
    for (let i = 0; i < newModel.cols; i++) {
      for (let j = 0; j < newModel.rows; j++) {
        const tile = this.tiles[i][j];
        tile.bindPublicSelection(newModel.publicSelection[i][j]);
      }
    }
  }

  private bindContextMenu(newModel: BoardModel): void {
    this.menu.bind(newModel.contextMenuState);
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
                this.localSelectionCanvas,
                this.publicSelectionCanvas,
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
      for (const tile of this.getMovableTiles(tokenModel, newModel)) {
        tile.activeTokenGrid();
        tile.movableToSelectionOn();
      }
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
      for (const tile of this.getMovableTiles(tokenModel, newModel)) {
        tile.defaultGrid();
        tile.selectionOff();
      }
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
  startX: number;
  startY: number;

  fogState = '0';
  publicSelectionState = '0';

  constructor(
      private size: number,
      location: Location,
      private fogOfWarCanvas: HTMLCanvasElement,
      private localSelectionCanvas: HTMLCanvasElement,
      private publicSelectionCanvas: HTMLCanvasElement,
      private gridCanvas: HTMLCanvasElement) {
    this.size = size;
    this.startX = location.col * size;
    this.startY = location.row * size;
    this.fogOfWarCanvas = fogOfWarCanvas;
    this.gridCanvas = gridCanvas;
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

  localSelectionOn(): void {
    fillCanvasTile(
        this.startX, this.startY, this.size, selectedTileColor,
        this.localSelectionCanvas);
  }

  selectionOff(): void {
    getContext(this.localSelectionCanvas)
        .clearRect(this.startX, this.startY, this.size, this.size);
  }

  movableToSelectionOn(): void {
    fillCanvasTile(
        this.startX, this.startY, this.size, movableToGridColor,
        this.localSelectionCanvas);
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
        movableToTileColor,
        this.gridCanvas);
  }

  bindPublicSelection(selection: string): void {
    if (selection === this.publicSelectionState) {
      return;
    }
    this.publicSelectionState = selection;
    getContext(this.publicSelectionCanvas)
        .clearRect(this.startX, this.startY, this.size, this.size);
    if (selection === '0') {
      // 0 is for no selection, so we're done.
      return;
    }
    const color =
        selection === '1' ? publicSelectionBlue : publicSelectionOrange;
    fillCanvasTile(
        this.startX, this.startY, this.size, color, this.publicSelectionCanvas);
  }

  bindFogOfWar(fogState: string): void {
    if (fogState === this.fogState) {
      return;
    }
    this.fogState = fogState;
    getContext(this.fogOfWarCanvas)
        .clearRect(this.startX, this.startY, this.size, this.size);
    if (fogState === '0') {
      // 0 is for no fog, so we're done.
      return;
    }
    const color = fogState === '1' ? fogColor : peekFogColor;
    fillCanvasTile(
        this.startX, this.startY, this.size, color, this.fogOfWarCanvas);
  }
}

function addButton(
    parent: HTMLElement, label: string): HTMLElement {
  const item = document.createElement('button');
  item.type = 'button';
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

class ContextMenu {
  menu = <HTMLElement>document.getElementById('rightClickMenu');
  clearFogButton = <HTMLElement>document.getElementById('clear-fow');
  applyFogButton = <HTMLElement>document.getElementById('apply-fow');
  addTokenButton = <HTMLElement>document.getElementById('add-token');
  peekFogButton: HTMLElement;
  unpeekFogButton: HTMLElement;
  clearHighlightButton: HTMLElement;
  orangeHighlightButton: HTMLElement;
  blueHighlightButton: HTMLElement;

  constructor() {
    this.menu.style.display = 'none';
    // this.menu.style.position = 'relative';
    this.clearFogButton.style.display = 'initial';
    this.applyFogButton.style.display = 'initial';
    this.addTokenButton.style.display = 'initial';
    this.peekFogButton = addButton(this.menu, 'Peek Fog');
    this.unpeekFogButton = addButton(this.menu, 'Un-peek Fog');
    this.clearHighlightButton = addButton(this.menu, 'Clear Highlight');
    this.orangeHighlightButton = addButton(this.menu, 'Highlight Orange');
    this.blueHighlightButton = addButton(this.menu, 'Highlight Blue');
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
