var canvas = document.getElementById("myCanvas");

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

function drawCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    const { width, height } = canvas.getBoundingClientRect();

    var tileSize = 50;
    var hSquares = Math.ceil(height / tileSize);
    var wSquares = Math.ceil(width / tileSize);

    var i;
    var j;

    for (i = 0; i < hSquares; i++) {
        for (j = 0; j < wSquares; j++) {
            ctx.beginPath();
            ctx.rect(j * 50, i * 50, 50, 50);
            if (((i + j) % 2) == 0) {
                ctx.fillStyle = "rgba(10, 0, 255, 0.5)";
            } else {
                ctx.fillStyle = "rgba(0, 255, 10, 0.5)";
            }
            ctx.fill();
            ctx.closePath();
        }
    }
}

var client = new HttpClient();
client.get('http://nkprasad.pythonanywhere.com/api/getCanvasSize', function(response) {
    console.log(response);

    var parts = response.split("x");
    canvas.width = parseInt(parts[0]);
    canvas.height = parseInt(parts[1]);
    drawCanvas(canvas);
});
