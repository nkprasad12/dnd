import { GameBoard } from './game_board/game_board.js'
import { loadImages } from './utils/image_utils.js'
import { Socket_, connectTo } from './server/socket_connection.js'

const backgroundUrl = 'http://localhost:5000/retrieve_image/grrrr.jpg'
const wolfUrl = 'http://localhost:5000/retrieve_image/demon.png'
const egbertUrl = 'http://localhost:5000/retrieve_image/egbert.png'

let socketPromise = connectTo('board');
let imagesPromies = loadImages([backgroundUrl, wolfUrl, egbertUrl]);

Promise.all([socketPromise, imagesPromies])
  .then((inputs) => {
    let socket: Socket_ = inputs[0];
    let imageMap: Map<string, CanvasImageSource> = inputs[1];

    console.log(JSON.stringify(imageMap));
    let backgroundImage = imageMap.get(backgroundUrl);
    if (backgroundImage == undefined) {
      throw 'ERROR: Background image is undefined!';
    }
    let canvasHolder = document.getElementById('canvasHolder');
    if (canvasHolder == null) {
      throw 'canvasHolder is null! Can not display board';
    }
    let board = new GameBoard(backgroundImage, 60, canvasHolder);

    let wolfImage = imageMap.get(wolfUrl);
    if (wolfImage == undefined) {
      console.log('ERROR: Wolf image is undefined!')
    } else {
      board.placeToken('Wolf', wolfImage, { x: 5, y: 5 }, socket);
    }

    let egbertImage = imageMap.get(egbertUrl);
    if (egbertImage == undefined) {
      console.log('ERROR: Egbert image is undefined!')
    } else {
      board.placeToken('Egbert', egbertImage, { x: 6, y: 5 }, socket);
    }

    socket.on('board-update', (obj) => {
      board.onRemoteUpdate({ name: obj.name, x: obj.pt.x, y: obj.pt.y })
    });
  });
