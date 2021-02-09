var canvas = <HTMLCanvasElement>document.getElementById("myCanvas");

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
    drawTile(xStart, yStart, 50, "rgba(120, 0, 120, 0.3)", canvas)
}

function onMouseClick(canvas: HTMLElement, event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const xVal = event.clientX - rect.left
    const yVal = event.clientY - rect.top
    console.log("x: " + xVal + " y: " + yVal)
    handleMouseClick({ x: xVal, y: yVal }, canvas)
}

canvas.addEventListener('mousedown', function (e) {
    onMouseClick(canvas, e)
})

function drawCanvas(canvas: HTMLCanvasElement) {
    const { width, height } = canvas.getBoundingClientRect();

    var tileSize = 50;
    var hSquares = Math.ceil(height / tileSize);
    var wSquares = Math.ceil(width / tileSize);

    var i: number;
    var j: number;

    for (i = 0; i < hSquares; i++) {
        for (j = 0; j < wSquares; j++) {
            var color: string;
            if (((i + j) % 2) == 0) {
                color = "rgba(10, 0, 255, 0.2)";
            } else {
                color = "rgba(0, 255, 10, 0.2)";
            }
            drawTile(j * 50, i * 50, 50, color, canvas)
        }
    }
}

// var client = new HttpClient();
// client.get('http://127.0.0.1:5000/api/getCanvasSize', function (response: string) {
//     console.log(response);

//     var parts = response.split("x");
//     canvas.width = parseInt(parts[0]);
//     canvas.height = parseInt(parts[1]);
//     drawCanvas(canvas);
//     loadCanvasBackground()
// });

// fetch('http://localhost:5000/retrieve_image/Screenshot_from_2020-12-18_14-11-08.png')
//     .then(res => res.blob())
//     .then(blob => {
//         var image = URL.createObjectURL(blob)

//     })

function loadCanvasBackground() {
    let image = new Image();
    image.src = 'http://localhost:5000/retrieve_image/Screenshot_from_2020-12-18_14-11-08.png'
    image.onload = function (event) {
        let loadedImage = event.currentTarget
        console.log(loadedImage.width + 'x' + loadedImage.height)
        canvas.width = loadedImage.width
        canvas.height = loadedImage.height
        var ctx = canvas.getContext("2d");
        ctx.drawImage(loadedImage, 0, 0)
        drawCanvas(canvas)
    }
}

loadCanvasBackground()