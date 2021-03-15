import {Location, areLocationsEqual} from '_common/coordinates';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';

import {ModelHandler, INVALID_INDEX} from './model_handler';
import {EditTokenForm, NewTokenForm} from '_client/board_tools/board_form';
import {BaseClickData} from '_client/game_board/controller/input_listener';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {TokenModel} from '_client/game_board/model/token_model';

interface ClickData extends BaseClickData {
  tile: Location;
}

interface ClickResult {
  diff: BoardDiff;
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
  ): InteractionState {
    if (mouseButton != 0 && mouseButton != 2) {
      return this;
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
    this.modelHandler.applyLocalDiff(result.diff);
    return result.newState;
  }

  protected onContextMenuClickInternal(action: ContextMenuItem): ClickResult {
    console.log('Got click on action: ' + action);
    throw new Error('Invalid state for onContextMenuClickInternal');
  }

  onContextMenuClick(action: ContextMenuItem): InteractionState {
    console.log('Handling context menu click');
    const result = this.onContextMenuClickInternal(action);
    this.modelHandler.applyLocalDiff(result.diff);
    return result.newState;
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
    const actionDiff = this.handleContextMenuAction(action);
    actionDiff.contextMenuState = {isVisible: false, clickPoint: {x: 0, y: 0}};
    actionDiff.localSelection = [];
    return {
      diff: actionDiff,
      newState: new DefaultState(this.modelHandler),
    };
  }

  private fogDiff(model: BoardModel, fogOn: boolean): BoardDiff {
    const fogOfWarDiffs = model.localSelection.map((tile) => {
      return {col: tile.col, row: tile.row, isFogOn: fogOn};
    });
    return {
      inner: {
        fogOfWarDiffs: fogOfWarDiffs,
        removedTokens: [],
        publicSelectionDiffs: [],
        newTokens: [],
        id: model.inner.id,
      },
    };
  }

  private peekDiff(model: BoardModel, isPeeked = true): BoardDiff {
    const startCol = Math.min(...model.localSelection.map((tile) => tile.col));
    const startRow = Math.min(...model.localSelection.map((tile) => tile.row));
    const endCol = Math.max(...model.localSelection.map((tile) => tile.col));
    const endRow = Math.max(...model.localSelection.map((tile) => tile.row));
    return {
      peekDiff: {
        start: {col: startCol, row: startRow},
        end: {col: endCol, row: endRow},
        isPeeked: isPeeked,
      },
    };
  }

  private highlightDiff(model: BoardModel, color: string): BoardDiff {
    const publicSelectionDiffs = model.localSelection.map((tile) => {
      return {col: tile.col, row: tile.row, value: color};
    });
    return {
      inner: {
        fogOfWarDiffs: [],
        removedTokens: [],
        publicSelectionDiffs: publicSelectionDiffs,
        newTokens: [],
        id: model.inner.id,
      },
    };
  }

  private handleContextMenuAction(action: ContextMenuItem): BoardDiff {
    const model = this.modelHandler.getModel();
    switch (action) {
      case ContextMenuItem.AddFog:
        return this.fogDiff(model, true);
      case ContextMenuItem.ClearFog:
        return this.fogDiff(model, false);
      case ContextMenuItem.PeekFog:
        return this.peekDiff(model, true);
      case ContextMenuItem.UnpeekFog:
        return this.peekDiff(model, false);
      case ContextMenuItem.ClearHighlight:
        return this.highlightDiff(model, '0');
      case ContextMenuItem.BlueHighlight:
        return this.highlightDiff(model, '1');
      case ContextMenuItem.OrangeHighlight:
        return this.highlightDiff(model, '2');
      case ContextMenuItem.GreenHighlight:
        return this.highlightDiff(model, '3');
      case ContextMenuItem.AddToken:
        NewTokenForm.create(model.localSelection[0], this.modelHandler);
        return {};
      case ContextMenuItem.EditToken:
        return this.handleEditToken(model);
      case ContextMenuItem.CopyToken:
        return this.handleCopyToken(model);
      case ContextMenuItem.ZoomIn:
        return {scale: model.scale * 2};
      case ContextMenuItem.ZoomOut:
        return {scale: model.scale / 2};
      default:
        throw new Error('Unsupported context menu action: ' + action);
    }
  }

  private findTokenOnTile(tile: Location): number | undefined {
    const collisions = this.modelHandler.wouldCollide(tile, 1);
    if (collisions.length === 0) {
      return undefined;
    }
    if (collisions.length > 1) {
      console.log('Unexpected multiple collisions! Taking the first one.');
    }
    return collisions[0];
  }

  private handleEditToken(model: BoardModel): BoardDiff {
    if (model.localSelection.length !== 1) {
      console.log('Requires exactly one tile selected, ignoring');
      return {};
    }
    const tile = model.localSelection[0];
    const tokenIndex = this.findTokenOnTile(tile);
    if (tokenIndex === undefined) {
      console.log('No token in selection, ignoring');
      return {};
    }
    const selectedToken = model.tokens[tokenIndex];
    EditTokenForm.create(selectedToken, this.modelHandler);
    return {};
  }

  private handleCopyToken(model: BoardModel): BoardDiff {
    if (model.localSelection.length !== 1) {
      console.log('Requires exactly one tile selected, ignoring');
      return {};
    }

    const tile = model.localSelection[0];
    const tokenIndex = this.findTokenOnTile(tile);
    if (tokenIndex === undefined) {
      console.log('No token in selection, ignoring');
      return {};
    }
    const selectedToken = model.tokens[tokenIndex];

    const rowDir = tile.row < model.inner.rows / 2 ? 1 : -1;
    const colDir = tile.col < model.inner.cols / 2 ? 1 : -1;
    let i = 1;
    while (true) {
      const newRow = tile.row + rowDir * i;
      const newCol = tile.col + colDir * i;
      const rowInBounds = 0 < newRow && newRow < model.inner.rows - 1;
      const colInBounds = 0 < newCol && newCol < model.inner.cols - 1;
      if (!rowInBounds && !colInBounds) {
        console.log('Found no target tile for copy, ignoring');
        return {};
      }
      const candidates: Location[] = [];
      if (rowInBounds) {
        const target = {col: tile.col, row: tile.row + rowDir * i};
        candidates.push(target);
      }
      if (colInBounds) {
        const target = {col: tile.col + colDir * i, row: tile.row};
        candidates.push(target);
      }
      for (const target of candidates) {
        const collisions = this.modelHandler.wouldCollide(
          target,
          selectedToken.inner.size
        );
        if (collisions.length > 0) {
          continue;
        }
        const copy = TokenModel.duplicate(selectedToken);
        // TODO: Make TokenDiff have a separate newTokens field.
        const newToken = TokenModel.merge(copy, {
          inner: {id: copy.inner.id, location: target},
        });
        return {
          inner: {
            newTokens: [newToken.inner],
            id: model.inner.id,
          },
        };
      }

      i += 1;
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
    mouseButton: number
  ): void {
    const newState = this.currentState.onDragEvent(
      fromPoint,
      toPoint,
      mouseButton
    );
    this.currentState = newState;
  }

  onContextMenuClick(action: ContextMenuItem): void {
    const newState = this.currentState.onContextMenuClick(action);
    this.currentState = newState;
  }
}
