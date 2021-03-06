import {
  ContextMenuItem,
  ContextMenuModel,
} from '_client/game_board/context_menu/context_menu_model';
import {BoardModel} from '_client/game_board/model/board_model';
import {Location} from '_common/coordinates';
import {Grid} from '_common/util/grid';

// TODO: Merge this duplicated logic with ModelHandler
function hasTokenAt(model: BoardModel, target: Location): boolean {
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

export namespace ContextMenu {
  export function processModel(
    model: BoardModel
  ): [ContextMenuModel, ContextMenuItem[]] {
    const invalidItems: ContextMenuItem[] = [];
    const selectedTiles =
      model.localSelection.area === undefined
        ? []
        : Grid.SimpleArea.toTiles(model.localSelection.area);
    const selection = model.localSelection.area;
    const hasToken =
      selection !== undefined && hasTokenAt(model, selection.start);
    const oneTileSelected = selectedTiles.length === 1;
    const multipleTilesSelected = selectedTiles.length > 1;
    if (multipleTilesSelected) {
      invalidItems.push(ContextMenuItem.AddToken);
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    } else if (oneTileSelected && !hasToken) {
      invalidItems.push(ContextMenuItem.EditToken);
      invalidItems.push(ContextMenuItem.CopyToken);
    } else if (oneTileSelected && hasToken) {
      invalidItems.push(ContextMenuItem.AddToken);
    }

    let fullFogTiles = 0;
    let peekedFogTiles = 0;
    let noFogTiles = 0;
    let highlightedTiles = 0;

    for (const tile of selectedTiles) {
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

    return [model.contextMenuState, invalidItems];
  }
}
