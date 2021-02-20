// import { GameBoard } from './game_board/game_board'
import {BoardModel} from '/src/game_board/model/board_model';
// import { BoardView } from './game_board/view/board_view'
import {LoadedImage, loadImages} from '/src/utils/image_utils';
import {connectTo} from '/src/server/socket_connection';
import {GameBoard} from '/src/game_board/controller/game_board';
import {BoardServer} from '/src/game_board/remote/board_server';

const backgroundUrl = 'http://localhost:5000/retrieve_image/grrrr.jpg';
const wolfUrl = 'http://localhost:5000/retrieve_image/demon.png';
const egbertUrl = 'http://localhost:5000/retrieve_image/egbert.png';

const canvasHolder = document.getElementById('canvasHolder');
if (canvasHolder == null) {
  throw new Error('canvasHolder is null! Can not display board');
}

const socketPromise = connectTo('board');
const imagesPromise = loadImages([backgroundUrl, wolfUrl, egbertUrl]);

Promise.all([imagesPromise, socketPromise])
    .then((inputs) => {
      const [imageMap, socket] = inputs;

      const modelBuilder =
          BoardModel.Builder.forNewBoard()
              .setTileSize(60)
              .setName('MyTestBoard')
              .setBackgroundImage(
                  new LoadedImage(
                      getOrThrow(imageMap, backgroundUrl),
                      backgroundUrl));
      // modelBuilder.addToken(
      //     TokenModel.create(
      //         'Wolf',
      //         new LoadedImage(getOrThrow(imageMap, wolfUrl), wolfUrl),
      //         1,
      //         {col: 5, row: 5}, false));
      // modelBuilder.addToken(
      //     TokenModel.create(
      //         'Egbert',
      //         new LoadedImage(getOrThrow(imageMap, egbertUrl), egbertUrl),
      //         1,
      //         {col: 6, row: 6}, false));

      const gameController =
          new GameBoard(
              'canvasHolder', modelBuilder.build(), new BoardServer(socket));
      console.log(gameController);
    });

function getOrThrow<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (value == undefined) {
    throw new Error('No value for key: ' + String(key));
  }
  return value;
}
