import { ModelHandler, INVALID_INDEX } from "./model_handler.js";
import { Point, Location, areLocationsEqual } from "../../common/common.js"
import { BoardModel } from "../model/board_model.js";

interface ClickData {
  tile: Location;
  point: Point;
}

interface ClickResult {
  model: BoardModel;
  newState: InteractionState;
}

function tilesInDrag(fromData: ClickData, toData: ClickData) {
  let from = fromData.tile;
  let to = toData.tile;
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

  return selectedTiles;
}

abstract class InteractionState {

  modelHandler: ModelHandler;

  constructor(modelHandler: ModelHandler) {
    this.modelHandler = modelHandler;
  }

  protected abstract onLeftDrag(fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult;

  protected abstract onRightDrag(fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult;

  protected abstract onLeftClick(clickData: ClickData, model: BoardModel): ClickResult;

  protected abstract onRightClick(clickData: ClickData, model: BoardModel): ClickResult;

  onDragEvent(fromPoint: Point, toPoint: Point, mouseButton: number): InteractionState {
    if (mouseButton != 0 && mouseButton != 2) {
      return this;
    }
    console.log('Handling mouse event');

    let isLeftClick = mouseButton == 0;
    let from = this.clickDataForPoint(fromPoint);
    let to = this.clickDataForPoint(toPoint);
    let isSingleTileClick = areLocationsEqual(from.tile, to.tile);

    let newModel = this.modelHandler.copyModel();
    let result: ClickResult;
    if (isLeftClick) {
      if (isSingleTileClick) {
        result = this.onLeftClick(from, newModel);
      } else {
        result = this.onLeftDrag(from, to, newModel);
      }
    } else {
      if (isSingleTileClick) {
        result = this.onRightClick(from, newModel);
      } else {
        result = this.onRightDrag(from, to, newModel);
      }
    }
    this.modelHandler.update(result.model);
    return result.newState;
  }

  protected onContextMenuClickInternal(_action: number, _model: BoardModel): ClickResult {
    throw 'Invalid state for onContextMenuClickInternal';
  }

  onContextMenuClick(action: number): InteractionState {
    console.log('Handling context menu click');
    let newModel = this.modelHandler.copyModel();
    let result = this.onContextMenuClickInternal(action, newModel);
    this.modelHandler.update(result.model);
    return result.newState;
  }

  private clickDataForPoint(absolutePoint: Point): ClickData {
    return {point: absolutePoint, tile: this.tileForPoint(absolutePoint)};
  }

  private tileForPoint(absolutePoint: Point): Location {
    const rect = this.modelHandler.view.topCanvas.getBoundingClientRect();
    let relativePoint = { x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top };
    let tileSize = this.modelHandler.tileSize();
    const col = Math.floor(relativePoint.x / tileSize);
    const row = Math.floor(relativePoint.y / tileSize);
    return { col: col, row: row };
  }
}

class DefaultState extends InteractionState {

  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightDrag(fromData, toData, model);
  }

  onRightDrag(fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult {
    model.contextMenuState.isVisible = true;
    model.contextMenuState.selectedTiles = tilesInDrag(fromData, toData);
    model.contextMenuState.clickPoint = toData.point;
    return {model: model, newState: new ContextMenuOpenState(this.modelHandler)}
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    let tokenIndex = this.modelHandler.tokenIndexOfTile(clickData.tile);
    if (tokenIndex == INVALID_INDEX) {
      return this.onRightClick(clickData, model);
    }
    model.tokens[tokenIndex].isActive = true;
    return {model: model, newState: new PickedUpTokenState(this.modelHandler)};
  }

  onRightClick(clickData: ClickData, model: BoardModel): ClickResult {
    model.contextMenuState.isVisible = true;
    model.contextMenuState.selectedTiles = [clickData.tile];
    model.contextMenuState.clickPoint = clickData.point;
    return {model: model, newState: new ContextMenuOpenState(this.modelHandler)};
  }
}

class PickedUpTokenState extends InteractionState {

  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onRightDrag(fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    let isTileOpen = this.modelHandler.tokenIndexOfTile(clickData.tile) == INVALID_INDEX;
    if (!isTileOpen) {
      return this.onRightClick(clickData, model);
    }
    let activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw 'No active token found in PickedUpTokenState';
    }
    model.tokens[activeTokenIndex].isActive = false;
    model.tokens[activeTokenIndex].location = clickData.tile;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  onRightClick(_clickData: ClickData, model: BoardModel): ClickResult {
    let activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw 'No active token found in PickedUpTokenState';
    }
    model.tokens[activeTokenIndex].isActive = false;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }
}

class ContextMenuOpenState extends InteractionState {

  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onRightDrag(fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(clickData, model);
  }

  onRightClick(clickData: ClickData, model: BoardModel): ClickResult {
    model.contextMenuState.isVisible = false;
    model.contextMenuState.selectedTiles = [];
    model.contextMenuState.clickPoint = clickData.point;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  onContextMenuClickInternal(action: number, model: BoardModel): ClickResult {
    // TODO: Refactor how the context menu interaction works.
    for (let tile of model.contextMenuState.selectedTiles) {
      model.fogOfWarState[tile.col][tile.row] = (action == 2);
    }
    model.contextMenuState.isVisible = false;
    model.contextMenuState.selectedTiles = [];
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }
}

export class InteractionStateMachine {

  private currentState: InteractionState;

  constructor(modelHandler: ModelHandler) {
    this.currentState = new DefaultState(modelHandler);
  }

  onDragEvent(fromPoint: Point, toPoint: Point, mouseButton: number): void {
    let newState = this.currentState.onDragEvent(fromPoint, toPoint, mouseButton);
    this.currentState = newState;
  }

  onContextMenuClick(action: number): void {
    let newState = this.currentState.onContextMenuClick(action);
    this.currentState = newState;
  }
}
