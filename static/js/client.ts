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

/** Represents the main game board. */
class GameBoard {

    tileSize: number;
    width: number;
    height: number;

    backgroundCanvas: HTMLCanvasElement;
    fogOfWarCanvas: HTMLCanvasElement;
    tokenCanvas: HTMLCanvasElement;
    gridCanvas: HTMLCanvasElement;
    topCanvas: HTMLCanvasElement;

    allCanvases: Array<HTMLCanvasElement>;

    constructor(tileSize: number) {
        this.backgroundCanvas = <HTMLCanvasElement>document.getElementById("backgroundCanvas");
        this.fogOfWarCanvas = <HTMLCanvasElement>document.getElementById("fogOfWarCanvas");
        this.tokenCanvas = <HTMLCanvasElement>document.getElementById("tokenCanvas");
        this.gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");
        this.topCanvas = <HTMLCanvasElement>document.getElementById("topCanvas");

        this.allCanvases = [
            this.backgroundCanvas, this.fogOfWarCanvas, this.tokenCanvas, this.gridCanvas, this.topCanvas]

        this.tileSize = Math.round(tileSize)
        if (this.tileSize != tileSize) {
            console.log("Rounded input tileSize to " + this.tileSize)
        }
    }

    setBackground(source: string) {
        let image = new Image();
        image.src = source
        image.onload = (event) => {
            let loadedImage = <CanvasImageSource>event.currentTarget
            this.width = <number>loadedImage.width
            this.height = <number>loadedImage.height
            console.log('Loaded image: ' + this.width + 'x' + this.height)

            for (var canvas of this.allCanvases) {
                console.log(canvas)
                canvas.width = this.width
                canvas.height = this.height
                getContext(canvas).clearRect(0, 0, this.width, this.height)
            }
            getContext(this.backgroundCanvas).drawImage(loadedImage, 0, 0)
            this.drawGrid(this.gridCanvas)
            this.topCanvas.addEventListener(
                'mousedown',
                (e) => {
                    this.onMouseClick(e)
                })
        }
    }

    drawGrid(canvas: HTMLCanvasElement) {
        const { width, height } = canvas.getBoundingClientRect();

        var hSquares = Math.ceil(height / this.tileSize);
        var wSquares = Math.ceil(width / this.tileSize);

        var i: number;
        var j: number;

        const gridColor: string = "rgba(255, 255, 255, 0.1)";
        for (i = 0; i < hSquares; i++) {
            for (j = 0; j < wSquares; j++) {
                drawCanvasTile(j * this.tileSize, i * this.tileSize, this.tileSize, gridColor, this.gridCanvas);
            }
        }
    }

    outOfBounds(point: Point) {
        const { width, height } = this.topCanvas.getBoundingClientRect();
        if (point.x < 0 || point.y < 0) {
            return true
        } else if (point.x >= width) {
            return true
        } else if (point.y >= height) {
            return true
        }
        return false
    }

    handleMouseClick(point: Point) {
        if (this.outOfBounds(point)) {
            return
        }
        const xStart = Math.floor(point.x / this.tileSize) * this.tileSize
        const yStart = Math.floor(point.y / this.tileSize) * this.tileSize
        fillCanvasTile(xStart, yStart, this.tileSize, "rgba(0, 0, 0, 1.0)", this.fogOfWarCanvas)
    }

    onMouseClick(event: MouseEvent) {
        console.log('onMouseClick')

        const rect = this.topCanvas.getBoundingClientRect()
        const xVal = event.clientX - rect.left
        const yVal = event.clientY - rect.top
        console.log("Mouse click canvas coordinates: (x: " + xVal + ", y: " + yVal + ")")
        this.handleMouseClick({ x: xVal, y: yVal })
    }

}

/** Represents a tile in the game board. */
class Tile {

    size: number;
    startX: number;
    startY: number;

    fogOfWarCanvas: HTMLCanvasElement;

    constructor(size: number, startX: number, startY: number, fogOfWarCanvas: HTMLCanvasElement) {
        this.size = size;
        this.startX = startX;
        this.startY = startY;
        this.fogOfWarCanvas = fogOfWarCanvas;
    }
}

function getContext(canvas: HTMLCanvasElement) {
    return canvas.getContext("2d");
}

function drawCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement) {
    var ctx = getContext(canvas)

    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function fillCanvasTile(x: number, y: number, size: number, color: string, canvas: HTMLCanvasElement) {
    var ctx = getContext(canvas)

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