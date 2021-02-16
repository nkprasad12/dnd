import { Maybe } from "/src/utils/maybe"
import { Socket_ } from "/src/server/socket_connection"

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

/** Represents the main game board. */
class GameBoard {

  tileSize: number;
  width: number;
  height: number;
  rows: number;
  cols: number;

  backgroundCanvas: HTMLCanvasElement;
  fogOfWarCanvas: HTMLCanvasElement;
  tokenCanvas: HTMLCanvasElement;
  gridCanvas: HTMLCanvasElement;
  topCanvas: HTMLCanvasElement;

  allCanvases: Array<HTMLCanvasElement>;
  tiles: Array<Array<Tile>>;
  menu: ContextMenu;
  mouseStateMachine: MouseStateMachine;

  tokens: Array<Token>;
  activeToken: Maybe<Token>;

  constructor(backgroundImage: CanvasImageSource, tileSize: number, parent: HTMLElement) {
    this.backgroundCanvas = createBoardCanvas("backgroundCanvas", "1", parent);
    this.fogOfWarCanvas = createBoardCanvas("fogOfWarCanvas", "2", parent);
    this.tokenCanvas = createBoardCanvas("tokenCanvas", "3", parent);
    this.gridCanvas = createBoardCanvas("gridCanvas", "4", parent);
    this.topCanvas = createBoardCanvas("topCanvas", "5", parent);
    this.allCanvases = [
      this.backgroundCanvas, this.fogOfWarCanvas, this.tokenCanvas, this.gridCanvas, this.topCanvas];

    this.tileSize = Math.round(tileSize)
    if (this.tileSize != tileSize) {
      console.log("Rounded input tileSize to " + this.tileSize);
    }

    this.width = <number>backgroundImage.width;
    this.height = <number>backgroundImage.height;
    this.cols = Math.ceil(this.width / this.tileSize);
    this.rows = Math.ceil(this.height / this.tileSize);

    for (let canvas of this.allCanvases) {
      canvas.width = this.width;
      canvas.height = this.height;
      getContext(canvas).clearRect(0, 0, this.width, this.height);
    }
    getContext(this.backgroundCanvas).drawImage(backgroundImage, 0, 0);

    this.tiles = []
    this.initializeTileGrid();
    this.forAllTiles((tile) => tile.defaultGrid());

    this.menu = new ContextMenu();
    this.tokens = []
    this.activeToken = Maybe.absent();

    this.topCanvas.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        if (this.menu.isVisible()) {
          this.menu.hide();
          return;
        }
        if (this.activeToken.present()) {
          this.activeToken = Maybe.absent();
          return;
        }
        const clickPoint = mousePoint(e);
        let activeTiles = [this.tileForPoint(this.canvasPoint(clickPoint))];
        this.menu.showAt(clickPoint, activeTiles);
      }
    );
    this.mouseStateMachine = new MouseStateMachine(
      this.topCanvas,
      (from, to) => { this.handleMouseDrag(from, to); });
  }

  handleMouseDrag(fromPoint: Point, toPoint: Point): void {
    if (this.menu.isVisible()) {
      this.menu.hide();
      return;
    }
    const from = this.tileCoordinates(this.canvasPoint(fromPoint));
    const to = this.tileCoordinates(this.canvasPoint(toPoint));
    console.log('Mouse drag: ' + JSON.stringify(from) + " -> " + JSON.stringify(to));

    let selectedTiles = []
    const xFrom = Math.min(from.x, to.x);
    const xTo = Math.max(from.x, to.x);
    const yFrom = Math.min(from.y, to.y);
    const yTo = Math.max(from.y, to.y);

    for (let i = xFrom; i <= xTo; i++) {
      for (let j = yFrom; j <= yTo; j++) {
        selectedTiles.push(this.tiles[i][j]);
      }
    }
    console.log('Selected tiles: ' + selectedTiles.length);
    if (selectedTiles.length == 1 && this.handleSingleTileClick(selectedTiles[0])) {
      return;
    } else if (selectedTiles.length > 1 && this.activeToken.present()) {
      this.activeToken = Maybe.absent();
      return;
    }
    this.menu.showAt(toPoint, selectedTiles);
  }

  handleSingleTileClick(tile: Tile): boolean {
    if (this.activeToken.present()) {
      if (!tile.hasToken()) {
        this.activeToken.get().setLocation(tile);
      }
      this.activeToken = Maybe.absent();
      return true;
    } else if (tile.hasToken()) {
      this.activeToken = Maybe.of(tile.getToken());
      return true;
    }
    return false;
  }

  canvasPoint(absolutePoint: Point): Point {
    const rect = this.topCanvas.getBoundingClientRect();
    return { x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top };
  }

  initializeTileGrid(): void {
    for (let i = 0; i < this.cols; i++) {
      this.tiles.push([])
    }
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.tiles[i].push(
          new Tile(this.tileSize, i * this.tileSize, j * this.tileSize, this.fogOfWarCanvas, this.gridCanvas));
      }
    }
  }

  forAllTiles(operation: (t: Tile) => any): void {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        operation(this.tiles[i][j]);
      }
    }
  }

  /** The coordinates of the tile containing the given canvas-relative point. */
  tileCoordinates(point: Point): Point {
    const col = Math.floor(point.x / this.tileSize);
    const row = Math.floor(point.y / this.tileSize);
    return { x: col, y: row };
  }

  /** Returns the tile containing a given point on the canvas. Must be in bounds. */
  tileForPoint(point: Point): Tile {
    const coordinates = this.tileCoordinates(point);
    return this.tiles[coordinates.x][coordinates.y];
  }

  /** Places the token on the given grid coordinates. */
  placeToken(name: string, loadedImage: CanvasImageSource, point: Point, socket: Socket_): void {
    let tile = this.tiles[point.x][point.y];
    let token = new Token(name, loadedImage, this.tokenCanvas, this.tileSize, tile, socket);
    tile.addToken(token);
    this.tokens.push(token);
  }

  onRemoteUpdate(update: { name: string, x: number, y: number }) {
    console.log('onRemoteUpdate: ' + JSON.stringify(update));
    console.log('Searching for ' + update.name);
    for (let token of this.tokens) {
      console.log('Token: ' + token.name);
      if (token.name == update.name) {
        let newTile = this.tileForPoint({ x: update.x + 1, y: update.y + 1 })
        if (newTile != token.location) {
          token.setLocation(newTile)
        }
        break;
      } else {
        console.log('Not a match');
      }
    }
  }

  outOfBounds(point: Point): boolean {
    const { width, height } = this.topCanvas.getBoundingClientRect();
    if (point.x < 0 || point.y < 0) {
      return true;
    } else if (point.x >= width) {
      return true;
    } else if (point.y >= height) {
      return true;
    }
    return false;
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
  token: Maybe<Token>;

  constructor(
    size: number,
    startX: number,
    startY: number,
    fogOfWarCanvas: HTMLCanvasElement,
    gridCanvas: HTMLCanvasElement) {
    this.size = size;
    this.startX = startX;
    this.startY = startY;
    this.fogOfWarCanvas = fogOfWarCanvas;
    this.gridCanvas = gridCanvas;
    this.hasFog = false;
    this.token = Maybe.absent();
  }

  clearGrid(): void {
    getContext(this.gridCanvas).clearRect(this.startX - 1, this.startY - 1, this.size + 2, this.size + 2);
  }

  defaultGrid(): void {
    this.clearGrid();
    drawCanvasTile(this.startX, this.startY, this.size, defaultGridColor, this.gridCanvas);
  }

  selectedGrid(): void {
    this.clearGrid();
    drawCanvasTile(this.startX, this.startY, this.size, selectedGridColor, this.gridCanvas);
  }

  setFog(showFog: boolean): void {
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

  toggleFog(): void {
    this.setFog(!this.hasFog);
  }

  hasToken(): boolean {
    return this.token.present();
  }

  addToken(token: Token): void {
    this.token = Maybe.of(token);
  }

  getToken(): Token {
    return this.token.get();
  }

  popToken(): void {
    this.token = Maybe.absent();
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
    this.clearFogButton.addEventListener(
      'click',
      () => {
        for (let tile of this.tiles) {
          tile.setFog(false);
          tile.defaultGrid();
        }
        this.hide();
      });
    this.applyFogButton.addEventListener(
      'click',
      () => {
        for (let tile of this.tiles) {
          tile.setFog(true);
          tile.defaultGrid();
        }
        this.hide();
      });
  }

  isVisible(): boolean {
    return this.menu.style.display != 'none';
  }

  showAt(point: Point, selectedTiles: Array<Tile>): void {
    this.menu.style.top = point.y + "px";
    this.menu.style.left = point.x + "px";
    this.menu.style.display = 'initial';
    this.tiles = selectedTiles;

    let fogCount = 0;
    let clearCount = 0;
    for (let tile of this.tiles) {
      tile.selectedGrid();
      fogCount += tile.hasFog ? 1 : 0;
      clearCount += tile.hasFog ? 0 : 1;
    }
    this.clearFogButton.style.display = fogCount > 0 ? 'initial' : 'none';
    this.applyFogButton.style.display = clearCount > 0 ? 'initial' : 'none';
  }

  hide(): void {
    this.menu.style.display = 'none';
    for (let tile of this.tiles) {
      tile.defaultGrid();
    }
    this.tiles = [];
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

interface Point {
  x: number;
  y: number;
}

/** Returns the absolute point of a mouse event. */
function mousePoint(event: MouseEvent): Point {
  return { x: event.clientX, y: event.clientY }
}

type DragCallback = (from: Point, to: Point) => any;

class MouseStateMachine {

  element: HTMLElement;
  dragCallback: DragCallback;

  mouseDownPoint: Maybe<Point>;

  constructor(element: HTMLElement, dragCallback: DragCallback) {
    this.element = element;
    this.dragCallback = dragCallback;
    this.mouseDownPoint = Maybe.absent();

    this.element.addEventListener(
      'mousedown',
      (e) => { this.handleMouseDown(e); });

    this.element.addEventListener(
      'mouseup',
      (e) => { this.handleMouseUp(e); });
  }

  handleMouseDown(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }
    this.mouseDownPoint = Maybe.of(mousePoint(event));
  }

  handleMouseUp(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }
    if (!this.mouseDownPoint.present()) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint.get(), mousePoint(event));
    this.mouseDownPoint = Maybe.absent();
  }
}

class Token {

  name: string;
  image: CanvasImageSource;
  socket: Socket_;

  location: Tile;
  canvas: HTMLCanvasElement;
  size: number;

  constructor(name: string, loadedImage: CanvasImageSource, canvas: HTMLCanvasElement,
    size: number, location: Tile, socket: Socket_) {

    this.socket = socket;
    this.name = name;
    this.canvas = canvas;
    this.size = size;
    this.image = loadedImage;
    this.location = location;
    getContext(this.canvas).drawImage(this.image, location.startX, location.startY, this.size, this.size);
  }

  setLocation(tile: Tile): void {
    if (this.location == tile) {
      console.log('Same as current, ignoring update')
      return;
    }
    console.log(this.name + " setLocation: " + tile.startX + ", " + tile.startY);
    this.socket.emit('board-update', { name: this.name, pt: { x: tile.startX, y: tile.startY } });
    tile.addToken(this);
    let oldLocation = this.location;
    this.location = tile;
    oldLocation.popToken();
    getContext(this.canvas).clearRect(oldLocation.startX - 1, oldLocation.startY - 1, this.size + 2, this.size + 2);
    getContext(this.canvas).drawImage(this.image, tile.startX, tile.startY, this.size, this.size);
  }
}

export { GameBoard }
