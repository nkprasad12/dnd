import {Location} from '_common/coordinates';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ContextMenuView} from '_client/game_board/context_menu/context_menu_view';
import {BoardModel} from '_client/game_board/model/board_model';

export class ContextMenu {
  static create(
    parent: HTMLElement,
    clickListener: (item: ContextMenuItem) => any
  ): ContextMenu {
    const view = new ContextMenuView(parent, clickListener);
    return new ContextMenu(view);
  }

  constructor(private readonly view: ContextMenuView) {}

  onNewModel(model: BoardModel): void {
    const invalidItems: ContextMenuItem[] = [];
    const selectedTiles = model.localSelection.length;
    const hasToken =
      selectedTiles > 0 && this.hasTokenAt(model, model.localSelection[0]);
    if (selectedTiles > 1) {
      invalidItems.push(ContextMenuItem.AddToken);
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    } else if (selectedTiles === 1 && !hasToken) {
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    } else if (selectedTiles === 1 && hasToken) {
      invalidItems.push(ContextMenuItem.AddToken);
    }

    let fullFogTiles = 0;
    let peekedFogTiles = 0;
    let noFogTiles = 0;
    let highlightedTiles = 0;

    for (const tile of model.localSelection) {
      const fogValue = model.inner.fogOfWar[tile.col][tile.row];
      const isFoggy = fogValue === '1';
      const isPeeked = model.peekedTiles[tile.col][tile.row];
      fullFogTiles += isFoggy && !isPeeked ? 1 : 0;
      peekedFogTiles += isFoggy && isPeeked ? 1 : 0;
      noFogTiles += !isFoggy ? 1 : 0;
      highlightedTiles +=
        model.inner.publicSelection[tile.col][tile.row] === '0' ? 0 : 1;
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
      const minCol = token.inner.location.col;
      const maxCol = minCol + token.inner.size;
      const minRow = token.inner.location.row;
      const maxRow = minRow + token.inner.size;

      const colsDisjoint = target.col >= maxCol || target.col + 1 <= minCol;
      const rowsDisjoint = target.row >= maxRow || target.row + 1 <= minRow;
      if (!colsDisjoint && !rowsDisjoint) {
        return true;
      }
    }
    return false;
  }
}
