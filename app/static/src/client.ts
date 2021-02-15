// import { GameBoard } from './game_board/game_board.js'
import { BoardModelBuilder, ContextMenuModel, TokenModel } from './game_board/model/board_model.js'
import { BoardView } from './game_board/view/board_view.js'
import { LoadedImage, loadImages } from './utils/image_utils.js'
import { Socket_, connectTo } from './server/socket_connection.js'
import { GameController } from './game_board/controller/game_controller.js'

const backgroundUrl = 'http://localhost:5000/retrieve_image/grrrr.jpg'
const wolfUrl = 'http://localhost:5000/retrieve_image/demon.png'
const egbertUrl = 'http://localhost:5000/retrieve_image/egbert.png'

let socketPromise = connectTo('board');
let imagesPromies = loadImages([backgroundUrl, wolfUrl, egbertUrl]);

Promise.all([socketPromise, imagesPromies])
  .then((inputs) => {
    // let socket: Socket_ = inputs[0];
    let imageMap: Map<string, CanvasImageSource> = inputs[1];

    let modelBuilder = new BoardModelBuilder().setTileSize(60);
    
    let backgroundImage = imageMap.get(backgroundUrl);
    if (backgroundImage == undefined) {
      throw 'ERROR: Background image is undefined!';
    }
    let canvasHolder = document.getElementById('canvasHolder');
    if (canvasHolder == null) {
      throw 'canvasHolder is null! Can not display board';
    }
    // let board = new GameBoard(backgroundImage, 60, canvasHolder);
    // let boardView = new BoardView(canvasHolder);

    modelBuilder.setBackgroundImage(new LoadedImage(backgroundImage, backgroundUrl));

    let wolfImage = imageMap.get(wolfUrl);
    if (wolfImage == undefined) {
      console.log('ERROR: Wolf image is undefined!')
    } else {
      modelBuilder.addToken(
        new TokenModel(
          'Wolf',
           new LoadedImage(wolfImage, wolfUrl),
           60,
          {col: 5, row: 5}, false));
      // board.placeToken('Wolf', wolfImage, { x: 5, y: 5 }, socket);
    }

    let egbertImage = imageMap.get(egbertUrl);
    if (egbertImage == undefined) {
      console.log('ERROR: Egbert image is undefined!')
    } else {
      // board.placeToken('Egbert', egbertImage, { x: 6, y: 5 }, socket);
      modelBuilder.addToken(
        new TokenModel(
          'Egbert',
           new LoadedImage(egbertImage, egbertUrl),
           60,
          {col: 6, row: 6}, false));
    }

    // modelBuilder.setContextMenu(
    //   new ContextMenuModel(
    //     {x: 30, y: 200},
    //     [{col: 5, row: 5}, {col: 5, row: 6}, {col: 6, row: 5}, {col: 6, row: 6}]
    //   )
    // );

    // boardView.bind(modelBuilder.build());
    let _gameController = new GameController(modelBuilder.build());

    // socket.on('board-update', (obj) => {
    //   board.onRemoteUpdate({ name: obj.name, x: obj.pt.x, y: obj.pt.y })
    // });
  });
