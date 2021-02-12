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

const gridColor: string = "rgba(255, 255, 255, 0.1)";
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

  setBackground(source: string) : void {
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
      this.forAllTiles((tile) => tile.drawGridOutline());
      this.topCanvas.addEventListener(
        'mousedown',
        (e) => {
          this.onMouseClick(e)
        });
      this.topCanvas.addEventListener(
        'contextmenu',
         (e) => {
           e.preventDefault();
           const clickPoint = this.mousePoint(e);
           var activeTiles = [this.tileForPoint(this.canvasPoint(clickPoint))];
           this.menu.showAt(clickPoint, activeTiles);
         }
      );
    }
  }

  /** Returns the absolute point of a mouse event. */
  mousePoint(event: MouseEvent) : Point {
    return {x: event.clientX, y: event.clientY}
  }
 
  canvasPoint(absolutePoint: Point) : Point {
    const rect = this.topCanvas.getBoundingClientRect();
    return {x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top};
  }

  initializeTileGrid() : void {
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

  forAllTiles(operation: (t: Tile) => any) : void {
    for (var i = 0; i < this.cols; i++) {
      for (var j = 0; j < this.rows; j++) {
        operation(this.tiles[i][j]);
      }
    }
  }  
  
  /* Returns the tile containing a given point on the canvas. Must be in bounds. */
  tileForPoint(point: Point) : Tile {
    const col = Math.floor(point.x / this.tileSize);
    const row = Math.floor(point.y / this.tileSize);
    return this.tiles[col][row];
  }

  outOfBounds(point: Point) : boolean {
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

  handleMouseClick(point: Point) : void {
    if (this.outOfBounds(point)) {
      return;
    }
    console.log("Handling click at " + point);
    this.tileForPoint(point).toggleFog();
  }

  onMouseClick(event: MouseEvent) : void {
    if (this.menu.isVisible()) {
      this.menu.hide();
      return;
    }
    if (event.button != 0) {
      console.log('Ignoring mouse click for non-main button.');
      return;
    }
    this.handleMouseClick(this.canvasPoint(this.mousePoint(event)));
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

  drawGridOutline() : void {
    drawCanvasTile(this.startX, this.startY, this.size, gridColor, this.gridCanvas);
  }

  setFog(showFog: boolean) : void {
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

  toggleFog() : void {
    this.setFog(!this.hasFog);
  }
}

class ContextMenu {

  menu = <HTMLElement>document.getElementById('rightClickMenu');
  toggleFowButton = <HTMLElement>document.getElementById('toggle-fow');

  point: Point;
  tiles: Array<Tile>;

  constructor() {
    this.menu.style.display = 'none';
    this.toggleFowButton.addEventListener(
      'click',
      () => {
        for (let tile of this.tiles) {
          tile.toggleFog();
        }  
        this.hide();
      });
  }

  isVisible() : boolean {
    return this.menu.style.display != 'none';
  }

  showAt(point: Point, selectedTiles: Array<Tile>) : void {
    this.menu.style.top = point.y + "px";
    this.menu.style.left = point.x + "px";
    this.menu.style.display = 'initial';
    this.point = point;
    this.tiles = selectedTiles;
  }

  hide() : void {
    this.menu.style.display = 'none';
    this.tiles = [];
  }
}

function getContext(canvas: HTMLCanvasElement) : CanvasRenderingContext2D {
  return canvas.getContext("2d");
}

function drawCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement) : void {
  var ctx = getContext(canvas)

  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

function fillCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement) : void {
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

const backgroundUrl = 'http://localhost:5000/retrieve_image/Screenshot_from_2020-12-18_14-11-08.png'
var board = new GameBoard(60)
board.setBackground(backgroundUrl)