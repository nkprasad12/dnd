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
    this.view.bind(model.contextMenuState);
  }
}
