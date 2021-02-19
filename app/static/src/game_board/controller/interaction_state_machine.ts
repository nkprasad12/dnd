import {Point, Location, areLocationsEqual} from '/src/common/common';
import {BoardModel} from '/src/game_board/model/board_model';

import {ModelHandler, INVALID_INDEX} from './model_handler';
import {NewTokenForm} from '/src/board_tools/board_form';

interface ClickData {
  tile: Location;
  point: Point;
}

interface ClickResult {
  model: BoardModel;
  newState: InteractionState;
}

function tilesInDrag(fromData: ClickData, toData: ClickData) {
  const from = fromData.tile;
  const to = toData.tile;
  const selectedTiles: Array<Location> = [];

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
  constructor(protected readonly modelHandler: ModelHandler) { }

  protected abstract onLeftDrag(
    fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult;

  protected abstract onRightDrag(
    fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult;

  protected abstract onLeftClick(
    clickData: ClickData, model: BoardModel): ClickResult;

  protected abstract onRightClick(
    clickData: ClickData, model: BoardModel): ClickResult;

  onDragEvent(
      fromPoint: Point, toPoint: Point, mouseButton: number): InteractionState {
    if (mouseButton != 0 && mouseButton != 2) {
      return this;
    }

    const isLeftClick = mouseButton == 0;
    const from = this.clickDataForPoint(fromPoint);
    const to = this.clickDataForPoint(toPoint);
    const isSingleTileClick = areLocationsEqual(from.tile, to.tile);

    const newModel = this.modelHandler.copyModel();
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

  protected onContextMenuClickInternal(
      _action: number, _model: BoardModel): ClickResult {
    throw new Error('Invalid state for onContextMenuClickInternal');
  }

  onContextMenuClick(action: number): InteractionState {
    console.log('Handling context menu click');
    const newModel = this.modelHandler.copyModel();
    const result = this.onContextMenuClickInternal(action, newModel);
    this.modelHandler.update(result.model);
    return result.newState;
  }

  private clickDataForPoint(absolutePoint: Point): ClickData {
    return {point: absolutePoint, tile: this.tileForPoint(absolutePoint)};
  }

  private tileForPoint(absolutePoint: Point): Location {
    const rect = this.modelHandler.view.topCanvas.getBoundingClientRect();
    const relativePoint =
      {x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top};
    const tileSize = this.modelHandler.tileSize();
    const col = Math.floor(relativePoint.x / tileSize);
    const row = Math.floor(relativePoint.y / tileSize);
    return {col: col, row: row};
  }
}

class DefaultState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(
      fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightDrag(fromData, toData, model);
  }

  onRightDrag(
      fromData: ClickData, toData: ClickData, model: BoardModel): ClickResult {
    model.contextMenuState.isVisible = true;
    model.contextMenuState.selectedTiles = tilesInDrag(fromData, toData);
    model.contextMenuState.clickPoint = toData.point;
    return {
      model: model,
      newState: new ContextMenuOpenState(this.modelHandler)};
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    const tokenIndex = this.modelHandler.tokenIndexOfTile(clickData.tile);
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
    console.log('New contextMenuState');
    console.log(model.contextMenuState);
    return {
      model: model,
      newState: new ContextMenuOpenState(this.modelHandler)};
  }
}

class PickedUpTokenState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(
      fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onRightDrag(
      fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    const isTileOpen =
        this.modelHandler.tokenIndexOfTile(clickData.tile) == INVALID_INDEX;
    if (!isTileOpen) {
      return this.onRightClick(clickData, model);
    }
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    model.tokens[activeTokenIndex].isActive = false;
    model.tokens[activeTokenIndex].location = clickData.tile;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  onRightClick(_clickData: ClickData, model: BoardModel): ClickResult {
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    model.tokens[activeTokenIndex].isActive = false;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }
}

class ContextMenuOpenState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(
      fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
    return this.onRightClick(fromData, model);
  }

  onRightDrag(
      fromData: ClickData, _toData: ClickData, model: BoardModel): ClickResult {
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
    if (action == 1) {
      for (const tile of model.contextMenuState.selectedTiles) {
        model.fogOfWarState[tile.col][tile.row] = false;
      }
    } else if (action == 2) {
      for (const tile of model.contextMenuState.selectedTiles) {
        model.fogOfWarState[tile.col][tile.row] = true;
      }
    } else {
      NewTokenForm.create(
          model.contextMenuState.selectedTiles[0], this.modelHandler);
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
    const newState =
        this.currentState.onDragEvent(fromPoint, toPoint, mouseButton);
    this.currentState = newState;
  }

  onContextMenuClick(action: number): void {
    const newState = this.currentState.onContextMenuClick(action);
    this.currentState = newState;
  }
}
