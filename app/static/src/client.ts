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

loadImages([backgroundUrl, wolfUrl, egbertUrl])
  .then((imageMap) => {
    console.log(JSON.stringify(imageMap));
    let backgroundImage = imageMap.get(backgroundUrl);
    if (backgroundImage == undefined) {
      throw 'ERROR: Background image is undefined!';
    }
    let board = new GameBoard(backgroundImage, 60);

    let wolfImage = imageMap.get(wolfUrl);
    if (wolfImage == undefined) {
      console.log('ERROR: Wolf image is undefined!')
    } else {
      board.placeToken('Wolf', wolfImage, { x: 5, y: 5 });
    }

    let egbertImage = imageMap.get(egbertUrl);
    if (egbertImage == undefined) {
      console.log('ERROR: Egbert image is undefined!')
    } else {
      board.placeToken('Egbert', egbertImage, { x: 6, y: 5 });
    }
  });

// socket.on('board-update', (message) => {
//   console.log('message: ' + JSON.stringify(message));
//   var obj = message;
//   board.onRemoteUpdate({name: obj.name, x: obj.pt.x, y: obj.pt.y})
// });