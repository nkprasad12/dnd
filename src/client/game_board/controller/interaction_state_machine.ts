import {Location, areLocationsEqual, Point} from '_common/coordinates';
import {BoardDiff} from '_client/game_board/model/board_model';

import {ModelHandler} from './model_handler';
import {BaseClickData} from '_client/game_board/controller/click_listener';
import {ContextMenuAction} from '_client/game_board/context_menu/context_menu_model';
import {ContextActionHandler} from '_client/game_board/controller/context_action_handler';
import {checkDefined} from '_common/preconditions';
import {Grid} from '_common/util/grid';
import {ChatClient} from '_client/chat_box/chat_client';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {EntityController} from '_client/game_board/controller/entity_controller';

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

function tilesInDrag(fromData: ClickData, toData: ClickData): Grid.SimpleArea {
  const from = fromData.tile;
  const to = toData.tile;

  const colFrom = Math.min(from.col, to.col);
  const colTo = Math.max(from.col, to.col);
  const rowFrom = Math.min(from.row, to.row);
  const rowTo = Math.max(from.row, to.row);

  return {start: {col: colFrom, row: rowFrom}, end: {col: colTo, row: rowTo}};
}

abstract class InteractionState {
  constructor(protected readonly params: InteractionParamaters) {
    document.body.style.cursor = 'default';
  }

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMouseMove(_hoverPoint: Point): void {}

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
      updatePromise: this.params.modelHandler.applyLocalDiff(result.diff),
    };
  }

  protected onContextMenuClickInternal(action: ContextMenuAction): ClickResult {
    console.log('Got click on action: ' + action);
    throw new Error('Invalid state for onContextMenuClickInternal');
  }

  onContextMenuClick(action: ContextMenuAction): InteractionResult {
    console.log('Handling context menu click');
    const result = this.onContextMenuClickInternal(action);
    return {
      newState: result.newState,
      updatePromise: this.params.modelHandler.applyLocalDiff(result.diff),
    };
  }

  private clickDataForPoint(point: BaseClickData): ClickData {
    return {
      clientPoint: point.clientPoint,
      pagePoint: point.pagePoint,
      tile: this.params.entityController.tileForPoint(point.clientPoint),
    };
  }
}

class DefaultState extends InteractionState {
  constructor(params: InteractionParamaters) {
    super(params);
  }

  onLeftDrag(fromData: ClickData, toData: ClickData): ClickResult {
    return this.onRightDrag(fromData, toData);
  }

  onRightDrag(fromData: ClickData, toData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {clickPoint: toData.pagePoint, isVisible: true},
        localSelection: {area: tilesInDrag(fromData, toData)},
      },
      newState: new ContextMenuOpenState(this.params),
    };
  }

  onLeftClick(clickData: ClickData): ClickResult {
    const collisions = this.params.entityController.wouldCollide(
      clickData.tile,
      1
    );
    const model = this.params.modelHandler.getModel();
    /* istanbul ignore next */
    // This shouldn't happen in practice.
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
      newState: new PickedUpTokenState(this.params),
    };
  }

  onRightClick(clickData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {clickPoint: clickData.pagePoint, isVisible: true},
        localSelection: {area: {start: clickData.tile, end: clickData.tile}},
      },
      newState: new ContextMenuOpenState(this.params),
    };
  }
}

class PickedUpTokenState extends InteractionState {
  constructor(params: InteractionParamaters) {
    super(params);
  }

  onMouseMove(hoverPoint: Point): void {
    // TODO: Set cursor styles to custom cursors.
    // TODO: Consolidate this logic with the logic in onLeftClick
    // and onRightClick (or, maybe move some into entityController).
    const activeTokenIndex = checkDefined(
      this.params.entityController.activeTokenIndex()
    );
    const model = this.params.modelHandler.getModel();
    const attackData = model.tokens[activeTokenIndex].inner.sheetData;
    const attackList =
      attackData?.attackBonuses && Object.keys(attackData?.attackBonuses);
    if (!attackList || attackList.length === 0) {
      document.body.style.cursor = 'default';
      return;
    }
    const activeTokenSize = model.tokens[activeTokenIndex].inner.size;
    const collisions = this.params.entityController.wouldCollide(
      this.params.entityController.tileForPoint(hoverPoint),
      activeTokenSize
    );
    if (
      collisions.length > 1 ||
      (collisions.length === 1 && activeTokenIndex !== collisions[0])
    ) {
      document.body.style.cursor = 'crosshair';
      return;
    }
    document.body.style.cursor = 'default';
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
    const activeTokenIndex = checkDefined(
      this.params.entityController.activeTokenIndex()
    );
    const model = this.params.modelHandler.getModel();
    const activeTokenSize = model.tokens[activeTokenIndex].inner.size;
    const collisions = this.params.entityController.wouldCollide(
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
      newState: new DefaultState(this.params),
    };
  }

  onRightClick(clickData: ClickData): ClickResult {
    const activeTokenIndex = checkDefined(
      this.params.entityController.activeTokenIndex()
    )!;
    const model = this.params.modelHandler.getModel();
    const tokenDiff = {
      isActive: false,
      inner: {id: model.tokens[activeTokenIndex].inner.id},
    };
    const attackData = model.tokens[activeTokenIndex].inner.sheetData;
    const attackList =
      attackData?.attackBonuses && Object.keys(attackData?.attackBonuses);
    if (attackList && attackList.length > 0) {
      return {
        diff: {
          tokenDiffs: [tokenDiff],
          contextMenuState: {
            isVisible: true,
            clickPoint: clickData.pagePoint,
            attackerSheet: attackData ?? undefined,
          },
        },
        newState: new ContextMenuOpenState(this.params),
      };
    }
    return {
      diff: {tokenDiffs: [tokenDiff]},
      newState: new DefaultState(this.params),
    };
  }
}

class ContextMenuOpenState extends InteractionState {
  constructor(params: InteractionParamaters) {
    super(params);
  }

  onLeftDrag(_fromData: ClickData, toData: ClickData): ClickResult {
    return this.onRightClick(toData);
  }

  onRightDrag(_fromData: ClickData, toData: ClickData): ClickResult {
    return this.onRightClick(toData);
  }

  onLeftClick(clickData: ClickData): ClickResult {
    return this.onRightClick(clickData);
  }

  onRightClick(clickData: ClickData): ClickResult {
    return {
      diff: {
        contextMenuState: {isVisible: false, clickPoint: clickData.pagePoint},
        localSelection: {},
      },
      newState: new DefaultState(this.params),
    };
  }

  onContextMenuClickInternal(action: ContextMenuAction): ClickResult {
    const actionDiff = new ContextActionHandler(
      this.params
    ).handleContextMenuAction(action);
    actionDiff.contextMenuState = {isVisible: false, clickPoint: {x: 0, y: 0}};
    actionDiff.localSelection = {};
    return {
      diff: actionDiff,
      newState: new DefaultState(this.params),
    };
  }
}

export interface InteractionParamaters {
  modelHandler: ModelHandler;
  entityController: EntityController;
  chatClient: ChatClient;
  controller: UiController;
}

export class InteractionStateMachine {
  private currentState: InteractionState;

  constructor(params: InteractionParamaters) {
    this.currentState = new DefaultState(params);
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

  onMouseMove(hoverPoint: Point): void {
    this.currentState.onMouseMove(hoverPoint);
  }

  onContextMenuClick(action: ContextMenuAction): Promise<void> {
    const result = this.currentState.onContextMenuClick(action);
    this.currentState = result.newState;
    return result.updatePromise;
  }
}
