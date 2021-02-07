var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

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
            ctx.fillStyle = "rgba(10, 0, 255, 0.7)";
        } else {
            ctx.fillStyle = "rgba(0, 255, 10, 0.7)";
        }
        ctx.fill();
        ctx.closePath();
    }
}