import { GameBoard } from './game_board.js'
import { loadImages } from './utils/image_utils.js'

// import { io } from 'socket.io-client'

// var socket;

// TODO - figure out how to import io here. Currently we're running a js script
//        in the html before this script runs that sets up the io variable. 
// socket = io.connect('http://localhost:5000/board')
// socket.on('connect', function () {
//   console.log('Connected to board socket')
// });

// const defaultGridColor: string = "rgba(255, 255, 255, 0.3)";
// const selectedGridColor: string = "rgba(0, 255, 0, 0.5)";
// const fogColor: string = "rgba(0, 0, 0, 1.0)";

const backgroundUrl = 'http://localhost:5000/retrieve_image/grrrr.jpg'
const wolfUrl = 'http://localhost:5000/retrieve_image/wolf.jpg'
const egbertUrl = 'http://localhost:5000/retrieve_image/egbert.png'

var board = new GameBoard(60);
loadImages([backgroundUrl, wolfUrl, egbertUrl])
  .then((imageMap) => {
    console.log(JSON.stringify(imageMap));
    board.setBackground(imageMap.get(backgroundUrl));
    board.placeToken('Wolf', imageMap.get(wolfUrl), { x: 5, y: 5 });
    board.placeToken('Egbert', imageMap.get(egbertUrl), { x: 6, y: 6 });
    console.log('Done loading!')
  });

// socket.on('board-update', (message) => {
//   console.log('message: ' + JSON.stringify(message));
//   var obj = message;
//   board.onRemoteUpdate({name: obj.name, x: obj.pt.x, y: obj.pt.y})
// });