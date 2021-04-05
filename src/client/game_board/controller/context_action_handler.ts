import {areLocationsEqual, Location} from '_common/coordinates';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ModelHandler} from '_client/game_board/controller/model_handler';
import {BoardModel, BoardDiff} from '_client/game_board/model/board_model';
import {TokenModel} from '_client/game_board/model/token_model';
import {checkDefined} from '_common/preconditions';
import {FOG_OFF, FOG_ON} from '_common/board/remote_board_model';
import {UiController} from '_client/entrypoints/main/ui_controller';

export class ContextActionHandler {
  constructor(
    private modelHandler: ModelHandler,
    private controller: UiController
  ) {}

  handleContextMenuAction(action: ContextMenuItem): BoardDiff {
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
        // NewTokenForm.create(
        //   checkDefined(model.localSelection.area).start,
        //   this.modelHandler
        // );
        this.controller.createNewTokenForm(
          checkDefined(model.localSelection.area).start
        );
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

  private fogDiff(model: BoardModel, fogOn: boolean): BoardDiff {
    const fogOfWarDiffs = {
      area: checkDefined(model.localSelection.area),
      value: fogOn ? FOG_ON : FOG_OFF,
    };
    return {
      inner: {
        fogOfWarDiffs: fogOfWarDiffs,
        id: model.inner.id,
      },
    };
  }

  private peekDiff(model: BoardModel, isPeeked = true): BoardDiff {
    return {
      peekDiff: {
        area: checkDefined(model.localSelection.area),
        value: isPeeked,
      },
    };
  }

  private highlightDiff(model: BoardModel, color: string): BoardDiff {
    const publicSelectionDiffs = {
      area: checkDefined(model.localSelection.area),
      value: color,
    };
    return {
      inner: {
        publicSelectionDiffs: publicSelectionDiffs,
        id: model.inner.id,
      },
    };
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
    const localSelection = checkDefined(model.localSelection.area);
    if (!areLocationsEqual(localSelection.start, localSelection.end)) {
      console.log('Requires exactly one tile selected, ignoring');
      return {};
    }
    const tile = localSelection.start;
    const tokenIndex = this.findTokenOnTile(tile);
    if (tokenIndex === undefined) {
      console.log('No token in selection, ignoring');
      return {};
    }
    this.controller.editTokenForm(model.tokens[tokenIndex]);
    return {};
  }

  private handleCopyToken(model: BoardModel): BoardDiff {
    const localSelection = checkDefined(model.localSelection.area);
    if (!areLocationsEqual(localSelection.start, localSelection.end)) {
      console.log('Requires exactly one tile selected, ignoring');
      return {};
    }

    const tile = localSelection.start;
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
