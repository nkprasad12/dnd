var backgroundCanvas = <HTMLCanvasElement>document.getElementById("backgroundCanvas");
var fogOfWarCanvas = <HTMLCanvasElement>document.getElementById("fogOfWarCanvas");
var gridCanvas = <HTMLCanvasElement>document.getElementById("gridCanvas");

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

function drawTile(x: number, y: number, size: number, color: string, canvas: { getContext: (arg0: string) => any; }) {
    var ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function fillTile(x: number, y: number, size: number, color: string, canvas: { getContext: (arg0: string) => any; }) {
    var ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function outOfBounds(point: { x: number; y: number; }, canvas: { getBoundingClientRect: () => { width: any; height: any; }; }) {
    const { width, height } = canvas.getBoundingClientRect();
    if (point.x < 0 || point.y < 0) {
        console.log("Negative indexed point")
        return true
    } else if (point.x >= width) {
        console.log("OOB X")
        return true
    } else if (point.y >= height) {
        console.log("OOB Y")
        return true
    }
    return false
}

function handleMouseClick(point: { x: number; y: number; }, canvas: any) {
    if (outOfBounds(point, canvas)) {
        return
    }
    const xStart = Math.floor(point.x / 50) * 50
    const yStart = Math.floor(point.y / 50) * 50
    console.log("xStart: " + xStart + ", yStart: " + yStart)
    fillTile(xStart, yStart, 50, "rgba(0, 0, 0, 0.8)", canvas)
}

function onMouseClick(canvas: HTMLElement, event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const xVal = event.clientX - rect.left
    const yVal = event.clientY - rect.top
    console.log("x: " + xVal + " y: " + yVal)
    handleMouseClick({ x: xVal, y: yVal }, canvas)
}

gridCanvas.addEventListener('mousedown', function (e) {
    onMouseClick(fogOfWarCanvas, e)
})

function drawGrid(canvas: HTMLCanvasElement) {
    const { width, height } = canvas.getBoundingClientRect();

    var tileSize = 50;
    var hSquares = Math.ceil(height / tileSize);
    var wSquares = Math.ceil(width / tileSize);

    var i: number;
    var j: number;

    for (i = 0; i < hSquares; i++) {
        for (j = 0; j < wSquares; j++) {
            var color = "rgba(255, 255, 255, 0.1)"
            drawTile(j * 50, i * 50, 50, color, canvas)
        }
    }
}

function loadCanvasBackground() {
    let image = new Image();
    image.src = 'http://localhost:5000/retrieve_image/Screenshot_from_2020-12-18_14-11-08.png'
    image.onload = function (event) {
        let loadedImage = <CanvasImageSource> event.currentTarget
        const width = <number> loadedImage.width
        const height = <number> loadedImage.height
        console.log(width + 'x' + height)

        backgroundCanvas.width = width
        backgroundCanvas.height = height
        var backgroundContext = backgroundCanvas.getContext("2d");
        backgroundContext.drawImage(loadedImage, 0, 0)

        fogOfWarCanvas.width = width
        fogOfWarCanvas.height = height
        // var fogOfWarContext = fogOfWarCanvas.getContext("2d");
        // fogOfWarContext.fillStyle = "rgba(0, 0, 0, 0.3)"
        // fogOfWarContext.fillRect(0, 0, width, height)        
        // // fogOfWarContext.clearRect(0, 0, width, height)        

        gridCanvas.width = width
        gridCanvas.height = height
        // var gridContext = gridCanvas.getContext("2d");
        // gridContext.fillStyle = "rgba(0, 0, 0, 0.3)"
        // gridContext.fillRect(0, 0, width, height)        
        // // gridContext.clearRect(0, 0, width, height)  

        drawGrid(gridCanvas)
    }
}

loadCanvasBackground()