import { BoardModel } from "../model/board_model.js";
import { BoardView } from '../view/board_view.js'
import { InputListener } from './input_listener.js'
import { Point, Location, areLocationsEqual } from "../../common/common.js"
import { Maybe } from "../../utils/maybe.js"

export class GameController {

  view: BoardView;
  model: BoardModel;
  inputListener: InputListener;

  activeTokenIndex: Maybe<number>;

  constructor(model: BoardModel) {
    let canvasHolder = document.getElementById('canvasHolder');
    if (canvasHolder == null) {
      throw 'canvasHolder is null! Can not display board';
    }
    this.view = new BoardView(canvasHolder);
    this.model = model;
    this.view.bind(this.model);
    this.inputListener = new InputListener(
      this.view,
      (from, to) => { this.handleMouseDrag(from, to); },
      (_clickPoint) => {}
    );

    this.activeTokenIndex = Maybe.absent();
  }

  boardPoint(absolutePoint: Point): Point {
    const rect = this.view.topCanvas.getBoundingClientRect();
    return { x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top };
  }

  boardLocation(relativePoint: Point): Location {
    const col = Math.floor(relativePoint.x / this.model.tileSize);
    const row = Math.floor(relativePoint.y / this.model.tileSize);
    return { col: col, row: row };
  }

  handleMouseDrag(fromPoint: Point, toPoint: Point): void {
    const from = this.boardLocation(this.boardPoint(fromPoint));
    const to = this.boardLocation(this.boardPoint(toPoint));

    let selectedTiles: Array<Location> = []
    const colFrom = Math.min(from.col, to.col);
    const colTo = Math.max(from.col, to.col);
    const rowFrom = Math.min(from.row, to.row);
    const rowTo = Math.max(from.row, to.row);

    for (let i = colFrom; i <= colTo; i++) {
      for (let j = rowFrom; j <= rowTo; j++) {
        selectedTiles.push({col: i, row: j});
      }
    }

    if (selectedTiles.length == 1 && this.handleSingleTileClick(selectedTiles[0])) {
      return;
    } else if (selectedTiles.length > 1 && this.activeTokenIndex.present()) {
      this.activeTokenIndex = Maybe.absent();
      return;
    }
  }

  handleSingleTileClick(tile: Location): boolean {
    let tileTokenIndex = this.tokenIndexOfTile(tile)
    if (this.activeTokenIndex.present()) {
      console.log('ActiveToken is present');
      let activeIndex = this.activeTokenIndex.get();
      let newModel = this.model.deepCopy();
      if (tileTokenIndex == -1) {
        console.log('Target tile is empty, moving token');
        newModel.tokens[activeIndex].location = tile;
      }
      newModel.tokens[activeIndex].isActive = false;
      this.activeTokenIndex = Maybe.absent();
      this.model = newModel;
      this.view.bind(newModel);
      return true;
    } else if (tileTokenIndex >= 0) {
      console.log('Picking up token');
      let newModel = this.model.deepCopy();
      newModel.tokens[tileTokenIndex].isActive = true;
      this.activeTokenIndex = Maybe.of(tileTokenIndex);
      this.model = newModel;
      this.view.bind(newModel);
      return true;
    }
    return false;
  }

  tokenIndexOfTile(tile: Location): number {
    for (let i = 0; i < this.model.tokens.length; i++) {
      let token = this.model.tokens[i];
      if (areLocationsEqual(token.location, tile)) {
        return i;
      }
    }
    return -1;
  }
}