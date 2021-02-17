// import { GameBoard } from './game_board/game_board'
import { BoardModelBuilder, TokenModel } from '/src/game_board/model/board_model'
// import { BoardView } from './game_board/view/board_view'
import { LoadedImage, loadImages } from '/src/utils/image_utils'
import { connectTo } from '/src/server/socket_connection'
import { GameController } from '/src/game_board/controller/game_controller'

const backgroundUrl = 'http://localhost:5000/retrieve_image/grrrr.jpg'
const wolfUrl = 'http://localhost:5000/retrieve_image/demon.png'
const egbertUrl = 'http://localhost:5000/retrieve_image/egbert.png'

let canvasHolder = document.getElementById('canvasHolder');
if (canvasHolder == null) {
  throw 'canvasHolder is null! Can not display board';
}

let socketPromise = connectTo('board');
let imagesPromise = loadImages([backgroundUrl, wolfUrl, egbertUrl]);

Promise.all([imagesPromise, socketPromise])
  .then((inputs) => {
    let [imageMap, socket] = inputs;

    let modelBuilder = new BoardModelBuilder().setTileSize(60);

    modelBuilder.setBackgroundImage(
      new LoadedImage(getOrThrow(imageMap, backgroundUrl), backgroundUrl));
    modelBuilder.addToken(
      TokenModel.create(
        'Wolf',
        new LoadedImage(getOrThrow(imageMap, wolfUrl), wolfUrl),
        60,
        { col: 5, row: 5 }, false));
    modelBuilder.addToken(
      TokenModel.create(
        'Egbert',
        new LoadedImage(getOrThrow(imageMap, egbertUrl), egbertUrl),
        60,
        { col: 6, row: 6 }, false));

    let gameController = new GameController(modelBuilder.build(), socket);
    console.log(gameController);

    // socket.on('board-update', (obj) => {
    //   board.onRemoteUpdate({ name: obj.name, x: obj.pt.x, y: obj.pt.y })
    // });
  });

function getOrThrow<K, V>(map: Map<K, V>, key: K): V {
  let value = map.get(key);
  if (value == undefined) {
    throw 'No value for key: ' + String(key);
  }
  return value;
} 