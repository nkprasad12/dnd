import {
  Location,
  areLocationsEqual,
  tileDistance,
  arePointsEqual,
  Point,
} from '_common/coordinates';
import {BoardModel} from '_client/game_board/model/board_model';
import {TokenModel} from '_client/game_board/model/token_model';
import {checkDefined} from '_common/preconditions';

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
const publicSelectionGreen: string = 'rgba(50, 255, 100, 0.25)';

const colorMap: Map<string, string> = new Map([
  ['1', publicSelectionBlue],
  ['2', publicSelectionOrange],
  ['3', publicSelectionGreen],
]);

function createBoardCanvas(
  zIndex: string,
  parent: HTMLElement
): HTMLCanvasElement {
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

  private tiles: Tile[][] = [];
  private model?: BoardModel = undefined;

  constructor(parent: HTMLElement) {
    this.backgroundCanvas = createBoardCanvas('1', parent);
    this.tokenCanvas = createBoardCanvas('2', parent);
    this.fogOfWarCanvas = createBoardCanvas('3', parent);
    this.publicSelectionCanvas = createBoardCanvas('4', parent);
    this.localSelectionCanvas = createBoardCanvas('5', parent);
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
    const backgroundChange = this.bindBackgroundImage(newModel);
    this.handleGridParameterChange(newModel, backgroundChange);
    this.bindGrid(newModel, backgroundChange);
    this.bindTokens(newModel, backgroundChange);
    this.bindFogOfWarState(newModel, backgroundChange);
    this.bindLocalSelection(newModel, backgroundChange);
    this.bindPublicSelection(newModel, backgroundChange);

    this.model = newModel;
  }

  private handleGridParameterChange(
    newModel: BoardModel,
    backgroundChange: boolean
  ): void {
    if (
      this.model !== undefined &&
      !backgroundChange &&
      newModel.inner.tileSize === this.model.inner.tileSize &&
      arePointsEqual(newModel.inner.gridOffset, this.model.inner.gridOffset)
    ) {
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

  private bindBackgroundImage(newModel: BoardModel): boolean {
    const scaleChange = this.model?.scale !== newModel.scale;
    const backgroundChange =
      this.model?.backgroundImage !== newModel.backgroundImage;
    const needsUpdate =
      this.model === undefined || scaleChange || backgroundChange;

    if (!needsUpdate) {
      return false;
    }

    for (const canvas of this.allCanvases) {
      if (this.model !== undefined) {
        getContext(canvas).clearRect(
          0,
          0,
          this.model.inner.width,
          this.model.inner.height
        );
      }
      canvas.width = newModel.inner.width * newModel.scale;
      canvas.height = newModel.inner.height * newModel.scale;
      getContext(canvas).scale(newModel.scale, newModel.scale);
    }
    getContext(this.backgroundCanvas).drawImage(
      newModel.backgroundImage.image,
      0,
      0
    );
    return true;
  }

  private bindGrid(newModel: BoardModel, backgroundChange: boolean): void {
    let needsUpdate = backgroundChange;
    if (this.model != undefined) {
      const model = this.model;
      needsUpdate = needsUpdate || model.inner.cols != newModel.inner.cols;
      needsUpdate = needsUpdate || model.inner.rows != newModel.inner.rows;
      needsUpdate =
        needsUpdate || model.inner.tileSize != newModel.inner.tileSize;
    } else {
      needsUpdate = true;
    }

    if (!needsUpdate) {
      return;
    }

    this.initializeTileGrid(newModel);
    for (let i = 0; i < newModel.inner.cols; i++) {
      for (let j = 0; j < newModel.inner.rows; j++) {
        this.tiles[i][j].defaultGrid();
      }
    }
  }

  private bindTokens(newModel: BoardModel, backgroundChange: boolean): void {
    let oldTokens: readonly TokenModel[] = [];
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
      if (!hasMatch || backgroundChange) {
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
      if (!hasMatch || backgroundChange) {
        this.drawToken(newToken, newModel);
      }
    }
  }

  private bindFogOfWarState(
    newModel: BoardModel,
    backgroundChange: boolean
  ): void {
    for (let i = 0; i < newModel.inner.cols; i++) {
      for (let j = 0; j < newModel.inner.rows; j++) {
        const tile = this.tiles[i][j];
        tile.bindFogOfWar(
          newModel.inner.fogOfWar[i][j],
          newModel.peekedTiles[i][j],
          backgroundChange
        );
      }
    }
  }

  private bindLocalSelection(
    newModel: BoardModel,
    backgroundChange: boolean
  ): void {
    let oldSelection: readonly Location[] = [];
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
      if (!hasMatch || backgroundChange) {
        this.tiles[newTile.col][newTile.row].selectedGrid();
        this.tiles[newTile.col][newTile.row].localSelectionOn();
      }
    }
  }

  private bindPublicSelection(
    newModel: BoardModel,
    backgroundChange: boolean
  ): void {
    for (let i = 0; i < newModel.inner.cols; i++) {
      for (let j = 0; j < newModel.inner.rows; j++) {
        const tile = this.tiles[i][j];
        tile.bindPublicSelection(
          newModel.inner.publicSelection[i][j],
          backgroundChange
        );
      }
    }
  }

  private initializeTileGrid(model: BoardModel): void {
    this.tiles = [];
    for (let i = 0; i < model.inner.cols; i++) {
      this.tiles.push([]);
      for (let j = 0; j < model.inner.rows; j++) {
        const startPoint = getStartPoint(
          {col: i, row: j},
          model.inner.gridOffset,
          model.inner.tileSize
        );
        this.tiles[i].push(
          new Tile(
            model.inner.tileSize,
            startPoint.x,
            startPoint.y,
            this.fogOfWarCanvas,
            this.localSelectionCanvas,
            this.publicSelectionCanvas,
            this.gridCanvas
          )
        );
      }
    }
  }

  private drawToken(tokenModel: TokenModel, newModel: BoardModel): void {
    const tokenSize = tokenModel.inner.size * newModel.inner.tileSize;
    const startPoint = getStartPoint(
      tokenModel.inner.location,
      newModel.inner.gridOffset,
      newModel.inner.tileSize
    );
    getContext(this.tokenCanvas).drawImage(
      tokenModel.image,
      startPoint.x,
      startPoint.y,
      tokenSize,
      tokenSize
    );
    if (tokenModel.isActive) {
      this.getTile(tokenModel.inner.location).activeTokenGrid();
      for (const tile of this.getMovableTiles(tokenModel, newModel)) {
        tile.activeTokenGrid();
        tile.movableToSelectionOn();
      }
    }
  }

  private clearToken(tokenModel: TokenModel, newModel: BoardModel): void {
    const tokenSize = tokenModel.inner.size * newModel.inner.tileSize;
    const startPoint = getStartPoint(
      tokenModel.inner.location,
      newModel.inner.gridOffset,
      newModel.inner.tileSize
    );
    getContext(this.tokenCanvas).clearRect(
      startPoint.x - 1,
      startPoint.y - 1,
      tokenSize + 2,
      tokenSize + 2
    );
    this.getTile(tokenModel.inner.location).defaultGrid();
    if (tokenModel.isActive) {
      for (const tile of this.getMovableTiles(tokenModel, newModel)) {
        tile.defaultGrid();
        tile.selectionOff();
      }
    }
  }

  private getMovableTiles(
    tokenModel: TokenModel,
    newModel: BoardModel
  ): Tile[] {
    const result: Tile[] = [];
    for (let i = 0; i < newModel.inner.cols; i++) {
      for (let j = 0; j < newModel.inner.rows; j++) {
        const d = tileDistance(tokenModel.inner.location, {col: i, row: j});
        if (0 < d && d <= tokenModel.inner.speed) {
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

function getStartPoint(tile: Location, offset: Point, tileSize: number): Point {
  let startX = tile.col * tileSize;
  let startY = tile.row * tileSize;
  if (offset.x > 0) {
    startX = startX - tileSize + offset.x;
  }
  if (offset.y > 0) {
    startY = startY - tileSize + offset.y;
  }
  return {x: startX, y: startY};
}

/** Represents a tile in the game board. */
class Tile {
  fogState = '0';
  publicSelectionState = '0';
  peekState = false;

  constructor(
    private size: number,
    private startX: number,
    private startY: number,
    private fogOfWarCanvas: HTMLCanvasElement,
    private localSelectionCanvas: HTMLCanvasElement,
    private publicSelectionCanvas: HTMLCanvasElement,
    private gridCanvas: HTMLCanvasElement
  ) {
    this.size = size;
    this.fogOfWarCanvas = fogOfWarCanvas;
    this.gridCanvas = gridCanvas;
  }

  private clearGrid(): void {
    getContext(this.gridCanvas).clearRect(
      this.startX - 1,
      this.startY - 1,
      this.size + 2,
      this.size + 2
    );
  }

  defaultGrid(): void {
    this.clearGrid();
    drawCanvasTile(
      this.startX,
      this.startY,
      this.size,
      defaultGridColor,
      this.gridCanvas
    );
  }

  localSelectionOn(): void {
    fillCanvasTile(
      this.startX,
      this.startY,
      this.size,
      selectedTileColor,
      this.localSelectionCanvas
    );
  }

  selectionOff(): void {
    getContext(this.localSelectionCanvas).clearRect(
      this.startX,
      this.startY,
      this.size,
      this.size
    );
  }

  movableToSelectionOn(): void {
    fillCanvasTile(
      this.startX,
      this.startY,
      this.size,
      movableToGridColor,
      this.localSelectionCanvas
    );
  }

  selectedGrid(): void {
    this.clearGrid();
    drawCanvasTile(
      this.startX,
      this.startY,
      this.size,
      selectedGridColor,
      this.gridCanvas
    );
  }

  activeTokenGrid(): void {
    this.clearGrid();
    drawCanvasTile(
      this.startX,
      this.startY,
      this.size,
      activeTokenColor,
      this.gridCanvas
    );
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
      this.gridCanvas
    );
  }

  bindPublicSelection(selection: string, backgroundChange: boolean): void {
    if (selection === this.publicSelectionState && !backgroundChange) {
      return;
    }
    this.publicSelectionState = selection;
    getContext(this.publicSelectionCanvas).clearRect(
      this.startX,
      this.startY,
      this.size,
      this.size
    );
    if (selection === '0') {
      // 0 is for no selection, so we're done.
      return;
    }
    const color = checkDefined(colorMap.get(selection));
    fillCanvasTile(
      this.startX,
      this.startY,
      this.size,
      color,
      this.publicSelectionCanvas
    );
  }

  bindFogOfWar(
    fogState: string,
    peekState: boolean,
    backgroundChange: boolean
  ): void {
    if (
      fogState === this.fogState &&
      this.peekState === peekState &&
      !backgroundChange
    ) {
      return;
    }
    this.fogState = fogState;
    this.peekState = peekState;
    getContext(this.fogOfWarCanvas).clearRect(
      this.startX,
      this.startY,
      this.size,
      this.size
    );
    if (fogState === '0') {
      // 0 is for no fog, so we're done.
      return;
    }
    const color = peekState ? peekFogColor : fogColor;
    fillCanvasTile(
      this.startX,
      this.startY,
      this.size,
      color,
      this.fogOfWarCanvas
    );
  }
}

export function addButton(parent: HTMLElement, label: string): HTMLElement {
  const item = document.createElement('button');
  item.type = 'button';
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
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
  canvas: HTMLCanvasElement
): void {
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
  canvas: HTMLCanvasElement
): void {
  const ctx = getContext(canvas);

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
