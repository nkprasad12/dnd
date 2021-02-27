import {Location} from '/src/common/common';
import {ContextMenuItem} from '/src/game_board/context_menu/context_menu_model';
import {ContextMenuView} from '/src/game_board/context_menu/context_menu_view';
import {BoardModel} from '/src/game_board/model/board_model';

export class ContextMenu {
  private readonly view: ContextMenuView

  constructor(
      parent: HTMLElement,
      clickListener: (item: ContextMenuItem) => any) {
    this.view = new ContextMenuView(parent, clickListener);
  }

  onNewModel(model: BoardModel): void {
    const invalidItems: ContextMenuItem[] = [];
    if (model.localSelection.length > 1) {
      invalidItems.push(ContextMenuItem.AddToken);
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    } else if (model.localSelection.length === 1 &&
        !this.hasTokenAt(model, model.localSelection[0])) {
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    }

    let fullFogTiles = 0;
    let peekedFogTiles = 0;
    let noFogTiles = 0;
    let highlightedTiles = 0;

    for (const tile of model.localSelection) {
      const fogValue = model.fogOfWarState[tile.col][tile.row];
      fullFogTiles += fogValue === '1' ? 1 : 0;
      peekedFogTiles += fogValue === '2' ? 1 : 0;
      noFogTiles += fogValue === '0' ? 1 : 0;
      highlightedTiles +=
          model.publicSelection[tile.col][tile.row] === '0' ? 0 : 1;
    }

    if (fullFogTiles + peekedFogTiles === 0) {
      invalidItems.push(ContextMenuItem.ClearFog);
    }
    if (noFogTiles === 0) {
      invalidItems.push(ContextMenuItem.AddFog);
    }
    if (fullFogTiles === 0) {
      invalidItems.push(ContextMenuItem.PeekFog);
    }
    if (peekedFogTiles === 0) {
      invalidItems.push(ContextMenuItem.UnpeekFog);
    }
    if (highlightedTiles === 0) {
      invalidItems.push(ContextMenuItem.ClearHighlight);
    }

    this.view.bind(model.contextMenuState, invalidItems);
  }

  // TODO: Merge this duplicated logic with ModelHandler
  private hasTokenAt(model: BoardModel, target: Location): boolean {
    for (let i = 0; i < model.tokens.length; i++) {
      const token = model.tokens[i];
      const minCol = token.location.col;
      const maxCol = minCol + token.size;
      const minRow = token.location.row;
      const maxRow = minRow + token.size;

      const colsDisjoint =
          (target.col >= maxCol) || (target.col + 1 <= minCol);
      const rowsDisjoint =
          (target.row >= maxRow) || (target.row + 1 <= minRow);
      if (!colsDisjoint && !rowsDisjoint) {
        return true;
      }
    }
    return false;
  }
}
