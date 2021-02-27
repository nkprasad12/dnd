import {Location, areLocationsEqual} from '/src/common/common';
import {BoardModel} from '/src/game_board/model/board_model';

import {ModelHandler, INVALID_INDEX} from './model_handler';
import {NewTokenForm} from '/src/board_tools/board_form';
import {BaseClickData} from '/src/game_board/controller/input_listener';
import {ContextMenuItem} from '/src/game_board/context_menu/context_menu_model';

interface ClickData extends BaseClickData {
  tile: Location;
  // point: Point;
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
      fromPoint: BaseClickData,
      toPoint: BaseClickData,
      mouseButton: number): InteractionState {
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
      action: ContextMenuItem, model: BoardModel): ClickResult {
    console.log('Got click on board: ' + model.id + ', action: ' + action);
    throw new Error('Invalid state for onContextMenuClickInternal');
  }

  onContextMenuClick(action: ContextMenuItem): InteractionState {
    console.log('Handling context menu click');
    const newModel = this.modelHandler.copyModel();
    const result = this.onContextMenuClickInternal(action, newModel);
    this.modelHandler.update(result.model);
    return result.newState;
  }

  private clickDataForPoint(point: BaseClickData): ClickData {
    return {
      clientPoint: point.clientPoint,
      pagePoint: point.pagePoint,
      tile: this.modelHandler.tileForPoint(point.clientPoint)};
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
    model.localSelection = tilesInDrag(fromData, toData);
    model.contextMenuState.clickPoint = toData.pagePoint;
    return {
      model: model,
      newState: new ContextMenuOpenState(this.modelHandler)};
  }

  onLeftClick(clickData: ClickData, model: BoardModel): ClickResult {
    const collisions = this.modelHandler.wouldCollide(clickData.tile, 1);
    if (collisions.length > 1) {
      console.log('Got multiple collisions! Taking the first one.');
    }
    if (collisions.length === 0) {
      return this.onRightClick(clickData, model);
    }
    const tokenIndex = collisions[0];
    const mutableToken = model.tokens[tokenIndex].mutableCopy();
    mutableToken.isActive = true;
    model.tokens[tokenIndex] = mutableToken.freeze();
    return {model: model, newState: new PickedUpTokenState(this.modelHandler)};
  }

  onRightClick(clickData: ClickData, model: BoardModel): ClickResult {
    model.contextMenuState.isVisible = true;
    model.localSelection = [clickData.tile];
    model.contextMenuState.clickPoint = clickData.pagePoint;
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
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    const activeTokenSize = model.tokens[activeTokenIndex].size;
    const collisions =
        this.modelHandler.wouldCollide(clickData.tile, activeTokenSize);
    if (collisions.length > 1 ||
        (collisions.length === 1 && activeTokenIndex !== collisions[0])) {
      return this.onRightClick(clickData, model);
    }
    const mutableToken = model.tokens[activeTokenIndex].mutableCopy();
    mutableToken.isActive = false;
    mutableToken.location = clickData.tile;
    model.tokens[activeTokenIndex] = mutableToken.freeze();
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  onRightClick(_clickData: ClickData, model: BoardModel): ClickResult {
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    const mutableToken = model.tokens[activeTokenIndex].mutableCopy();
    mutableToken.isActive = false;
    model.tokens[activeTokenIndex] = mutableToken.freeze();
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
    model.localSelection = [];
    model.contextMenuState.clickPoint = clickData.pagePoint;
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  onContextMenuClickInternal(
      action: ContextMenuItem, model: BoardModel): ClickResult {
    this.handleContextMenuAction(action, model);
    model.contextMenuState.isVisible = false;
    model.localSelection = [];
    return {model: model, newState: new DefaultState(this.modelHandler)};
  }

  private handleContextMenuAction(
      action: ContextMenuItem, model: BoardModel): void {
    switch (action) {
      case ContextMenuItem.AddFog:
        for (const tile of model.localSelection) {
          model.fogOfWarState[tile.col][tile.row] = '1';
        }
        break;
      case ContextMenuItem.ClearFog:
        for (const tile of model.localSelection) {
          model.fogOfWarState[tile.col][tile.row] = '0';
        }
        break;
      case ContextMenuItem.PeekFog:
        for (const tile of model.localSelection) {
          const current = model.fogOfWarState[tile.col][tile.row];
          if (current === '1') {
            model.fogOfWarState[tile.col][tile.row] = '2';
          }
        }
        break;
      case ContextMenuItem.UnpeekFog:
        for (const tile of model.localSelection) {
          const current = model.fogOfWarState[tile.col][tile.row];
          if (current === '2') {
            model.fogOfWarState[tile.col][tile.row] = '1';
          }
        }
        break;
      case ContextMenuItem.ClearHighlight:
        for (const tile of model.localSelection) {
          model.publicSelection[tile.col][tile.row] = '0';
        }
        break;
      case ContextMenuItem.BlueHighlight:
        for (const tile of model.localSelection) {
          model.publicSelection[tile.col][tile.row] = '1';
        }
        break;
      case ContextMenuItem.OrangeHighlight:
        for (const tile of model.localSelection) {
          model.publicSelection[tile.col][tile.row] = '2';
        }
        break;
      case ContextMenuItem.AddToken:
        NewTokenForm.create(
            model.localSelection[0], this.modelHandler);
        break;
      case ContextMenuItem.EditToken:
        this.handleEditToken(model);
        break;
      case ContextMenuItem.CopyToken:
        this.handleCopyToken(model);
        break;
      default:
        throw new Error('Unsupported context menu action: ' + action);
    }
  }

  private handleEditToken(model: BoardModel): void {
    if (model.localSelection.length !== 1) {
      console.log('Requires exactly one tile selected, ignoring');
    } else {
      // TODO: Find the token here
      // TODO: create a version of this form that takes a token for editing
      NewTokenForm.create(
          model.localSelection[0], this.modelHandler);
    }
  }

  private handleCopyToken(model: BoardModel): void {
    if (model.localSelection.length !== 1) {
      console.log('Requires exactly one tile selected, ignoring');
    } else {
      // TODO: List all the neighboring locations
      // TODO: Create a new token there
      NewTokenForm.create(
          model.localSelection[0], this.modelHandler);
    }
  }
}

export class InteractionStateMachine {
  private currentState: InteractionState;

  constructor(modelHandler: ModelHandler) {
    this.currentState = new DefaultState(modelHandler);
  }

  onDragEvent(
      fromPoint: BaseClickData,
      toPoint: BaseClickData,
      mouseButton: number): void {
    const newState =
        this.currentState.onDragEvent(fromPoint, toPoint, mouseButton);
    this.currentState = newState;
  }

  onContextMenuClick(action: ContextMenuItem): void {
    const newState = this.currentState.onContextMenuClick(action);
    this.currentState = newState;
  }
}
