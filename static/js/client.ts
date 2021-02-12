// Usage:
// var client = new HttpClient();
// client.get('http://blah/request', function (response: string) {
//     console.log(response);
// });
var HttpClient = function () {
  this.get = function (aUrl: string, aCallback: (arg0: string) => void) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function () {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open("GET", aUrl, true);
    anHttpRequest.send(null);
  }
}

const defaultGridColor: string = "rgba(255, 255, 255, 0.1)";
const selectedGridColor: string = "rgba(0, 255, 0, 0.5)";
const fogColor: string = "rgba(0, 0, 0, 1.0)";

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

  constructor(tileSize: number) {
    this.backgroundCanvas = <HTMLCanvasElement>document.getElementById("backgroundCanvas");
    this.fogOfWarCanvas = <HTMLCanvasElement>document.getElementById("fogOfWarCanvas");
    this.tokenCanvas = <HTMLCanvasElement>document.getElementById("tokenCanvas");
    this.gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");
    this.topCanvas = <HTMLCanvasElement>document.getElementById("topCanvas");

    this.allCanvases = [
      this.backgroundCanvas, this.fogOfWarCanvas, this.tokenCanvas, this.gridCanvas, this.topCanvas];

    this.menu = new ContextMenu();
    this.tileSize = Math.round(tileSize)
    if (this.tileSize != tileSize) {
      console.log("Rounded input tileSize to " + this.tileSize);
    }
  }

  setBackground(source: string): void {
    let image = new Image();
    image.src = source;
    image.onload = (event) => {
      let loadedImage = <CanvasImageSource>event.currentTarget;
      this.width = <number>loadedImage.width;
      this.height = <number>loadedImage.height;
      console.log('Loaded image: ' + this.width + 'x' + this.height);
      this.cols = Math.ceil(this.width / this.tileSize);
      this.rows = Math.ceil(this.height / this.tileSize);

      for (var canvas of this.allCanvases) {
        canvas.width = this.width;
        canvas.height = this.height;
        getContext(canvas).clearRect(0, 0, this.width, this.height);
      }
      getContext(this.backgroundCanvas).drawImage(loadedImage, 0, 0);
      this.initializeTileGrid();
      this.forAllTiles((tile) => tile.defaultGrid());
      this.topCanvas.addEventListener(
        'contextmenu',
        (e) => {
          e.preventDefault();
          if (this.menu.isVisible()) {
            this.menu.hide();
            return;
          }
          const clickPoint = mousePoint(e);
          var activeTiles = [this.tileForPoint(this.canvasPoint(clickPoint))];
          this.menu.showAt(clickPoint, activeTiles);
        }
      );
      this.mouseStateMachine = new MouseStateMachine(
        this.topCanvas,
        (from, to) => { this.handleMouseDrag(from, to); });
    }
  }

  handleMouseDrag(fromPoint: Point, toPoint: Point): void {
    if (this.menu.isVisible()) {
      this.menu.hide();
      return;
    }
    const from = this.tileCoordinates(this.canvasPoint(fromPoint));
    const to = this.tileCoordinates(this.canvasPoint(toPoint));
    console.log('Mouse drag: ' + JSON.stringify(from) + " -> " + JSON.stringify(to));

    var selectedTiles = []
    const xFrom = Math.min(from.x, to.x);
    const xTo = Math.max(from.x, to.x);
    const yFrom = Math.min(from.y, to.y);
    const yTo = Math.max(from.y, to.y);

    for (var i = xFrom; i <= xTo; i++) {
      for (var j = yFrom; j <= yTo; j++) {
        selectedTiles.push(this.tiles[i][j]);
      }
    }
    console.log('Selected tiles: ' + selectedTiles.length);
    this.menu.showAt(toPoint, selectedTiles);
  }

  canvasPoint(absolutePoint: Point): Point {
    const rect = this.topCanvas.getBoundingClientRect();
    return { x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top };
  }

  initializeTileGrid(): void {
    this.tiles = []
    for (var i = 0; i < this.cols; i++) {
      this.tiles.push([])
    }
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        this.tiles[i].push(
          new Tile(this.tileSize, i * this.tileSize, j * this.tileSize, this.fogOfWarCanvas, this.gridCanvas));
      }
    }
  }

  forAllTiles(operation: (t: Tile) => any): void {
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
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

  /* Returns the tile containing a given point on the canvas. Must be in bounds. */
  tileForPoint(point: Point): Tile {
    const coordinates = this.tileCoordinates(point);
    return this.tiles[coordinates.x][coordinates.y];
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
}

class ContextMenu {

  menu = <HTMLElement>document.getElementById('rightClickMenu');
  clearFogButton = <HTMLElement>document.getElementById('clear-fow');
  applyFogButton = <HTMLElement>document.getElementById('apply-fow');

  point: Point;
  tiles: Array<Tile>;

  constructor() {
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
    this.point = point;
    this.tiles = selectedTiles;

    var fogCount = 0;
    var clearCount = 0;
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
  return canvas.getContext("2d");
}

function drawCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement): void {
  var ctx = getContext(canvas)

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function fillCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement): void {
  var ctx = getContext(canvas);

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

  mouseDownPoint: Point;

  constructor(element: HTMLElement, dragCallback: DragCallback) {
    this.element = element;
    this.dragCallback = dragCallback;
    this.mouseDownPoint = null;

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
    this.mouseDownPoint = mousePoint(event);
  }

  handleMouseUp(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }
    if (this.mouseDownPoint == null) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint, mousePoint(event));
    this.mouseDownPoint = null;
  }
}

const backgroundUrl = 'http://localhost:5000/retrieve_image/Screenshot_from_2020-12-18_14-11-08.png'
var board = new GameBoard(60)
board.setBackground(backgroundUrl)