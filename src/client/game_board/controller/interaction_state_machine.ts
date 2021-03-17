import {Location, areLocationsEqual} from '_common/coordinates';
import {BoardDiff} from '_client/game_board/model/board_model';

import {ModelHandler, INVALID_INDEX} from './model_handler';
import {BaseClickData} from '_client/game_board/controller/input_listener';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ContextActionHandler} from '_client/game_board/controller/context_action_handler';

interface ClickData extends BaseClickData {
  tile: Location;
}

interface ClickResult {
  diff: BoardDiff;
  newState: InteractionState;
}

interface InteractionResult {
  updatePromise: Promise<any>;
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
  constructor(protected readonly modelHandler: ModelHandler) {}

  protected abstract onLeftDrag(
    fromData: ClickData,
    toData: ClickData
  ): ClickResult;

  protected abstract onRightDrag(
    fromData: ClickData,
    toData: ClickData
  ): ClickResult;

  protected abstract onLeftClick(clickData: ClickData): ClickResult;

  protected abstract onRightClick(clickData: ClickData): ClickResult;

  onDragEvent(
    fromPoint: BaseClickData,
    toPoint: BaseClickData,
    mouseButton: number
  ): InteractionResult {
    if (mouseButton != 0 && mouseButton != 2) {
      return {newState: this, updatePromise: Promise.resolve()};
    }

    const isLeftClick = mouseButton == 0;
    const from = this.clickDataForPoint(fromPoint);
    const to = this.clickDataForPoint(toPoint);
    const isSingleTileClick = areLocationsEqual(from.tile, to.tile);

    let result: ClickResult;
    if (isLeftClick) {
      if (isSingleTileClick) {
        result = this.onLeftClick(from);
      } else {
        result = this.onLeftDrag(from, to);
      }
    } else {
      if (isSingleTileClick) {
        result = this.onRightClick(from);
      } else {
        result = this.onRightDrag(from, to);
      }
    }
    return {
      newState: result.newState,
      updatePromise: this.modelHandler.applyLocalDiff(result.diff),
    };
  }

  protected onContextMenuClickInternal(action: ContextMenuItem): ClickResult {
    console.log('Got click on action: ' + action);
    throw new Error('Invalid state for onContextMenuClickInternal');
  }

  onContextMenuClick(action: ContextMenuItem): InteractionResult {
    console.log('Handling context menu click');
    const result = this.onContextMenuClickInternal(action);
    return {
      newState: result.newState,
      updatePromise: this.modelHandler.applyLocalDiff(result.diff),
    };
  }

  private clickDataForPoint(point: BaseClickData): ClickData {
    return {
      clientPoint: point.clientPoint,
      pagePoint: point.pagePoint,
      tile: this.modelHandler.tileForPoint(point.clientPoint),
    };
  }
}

class DefaultState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  onLeftDrag(fromData: ClickData, toData: ClickData): ClickResult {
    return this.onRightDrag(fromData, toData);
  }

  onRightDrag(fromData: ClickData, toData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {clickPoint: toData.pagePoint, isVisible: true},
        localSelection: tilesInDrag(fromData, toData),
      },
      newState: new ContextMenuOpenState(this.modelHandler),
    };
  }

  onLeftClick(clickData: ClickData): ClickResult {
    const collisions = this.modelHandler.wouldCollide(clickData.tile, 1);
    const model = this.modelHandler.getModel();
    if (collisions.length > 1) {
      console.log('Unexpected multiple collisions! Taking the first one.');
    }
    if (collisions.length === 0) {
      return this.onRightClick(clickData);
    }
    const tokenIndex = collisions[0];
    const tokenDiff = {
      isActive: true,
      inner: {id: model.tokens[tokenIndex].inner.id},
    };
    return {
      diff: {tokenDiffs: [tokenDiff]},
      newState: new PickedUpTokenState(this.modelHandler),
    };
  }

  onRightClick(clickData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {clickPoint: clickData.pagePoint, isVisible: true},
        localSelection: [clickData.tile],
      },
      newState: new ContextMenuOpenState(this.modelHandler),
    };
  }
}

class PickedUpTokenState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLeftDrag(fromData: ClickData, _toData: ClickData): ClickResult {
    return this.onRightClick(fromData);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRightDrag(fromData: ClickData, _toData: ClickData): ClickResult {
    return this.onRightClick(fromData);
  }

  onLeftClick(clickData: ClickData): ClickResult {
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    const model = this.modelHandler.getModel();
    const activeTokenSize = model.tokens[activeTokenIndex].inner.size;
    const collisions = this.modelHandler.wouldCollide(
      clickData.tile,
      activeTokenSize
    );
    if (
      collisions.length > 1 ||
      (collisions.length === 1 && activeTokenIndex !== collisions[0])
    ) {
      return this.onRightClick(clickData);
    }
    const tokenDiff = {
      isActive: false,
      inner: {
        id: model.tokens[activeTokenIndex].inner.id,
        location: clickData.tile,
      },
    };
    return {
      diff: {tokenDiffs: [tokenDiff]},
      newState: new DefaultState(this.modelHandler),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRightClick(_clickData: ClickData): ClickResult {
    const activeTokenIndex = this.modelHandler.activeTokenIndex();
    if (activeTokenIndex == INVALID_INDEX) {
      throw new Error('No active token found in PickedUpTokenState');
    }
    const model = this.modelHandler.getModel();
    const tokenDiff = {
      isActive: false,
      inner: {id: model.tokens[activeTokenIndex].inner.id},
    };
    return {
      diff: {tokenDiffs: [tokenDiff]},
      newState: new DefaultState(this.modelHandler),
    };
  }
}

class ContextMenuOpenState extends InteractionState {
  constructor(modelHandler: ModelHandler) {
    super(modelHandler);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLeftDrag(fromData: ClickData, _toData: ClickData): ClickResult {
    return this.onRightClick(fromData);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRightDrag(fromData: ClickData, _toData: ClickData): ClickResult {
    return this.onRightClick(fromData);
  }

  onLeftClick(clickData: ClickData): ClickResult {
    return this.onRightClick(clickData);
  }

  onRightClick(clickData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {isVisible: false, clickPoint: clickData.pagePoint},
        localSelection: [],
      },
      newState: new DefaultState(this.modelHandler),
    };
  }

  onContextMenuClickInternal(action: ContextMenuItem): ClickResult {
    const actionDiff = new ContextActionHandler(
      this.modelHandler
    ).handleContextMenuAction(action);
    actionDiff.contextMenuState = {isVisible: false, clickPoint: {x: 0, y: 0}};
    actionDiff.localSelection = [];
    return {
      diff: actionDiff,
      newState: new DefaultState(this.modelHandler),
    };
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
    mouseButton: number
  ): Promise<void> {
    const result = this.currentState.onDragEvent(
      fromPoint,
      toPoint,
      mouseButton
    );
    this.currentState = result.newState;
    return result.updatePromise;
  }

  onContextMenuClick(action: ContextMenuItem): Promise<void> {
    const result = this.currentState.onContextMenuClick(action);
    this.currentState = result.newState;
    return result.updatePromise;
  }
}
