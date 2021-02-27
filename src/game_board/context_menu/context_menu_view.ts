import {checkDefined} from '/src/common/common';
import {ContextMenuModel, ContextMenuItem} from '/src/game_board/context_menu/context_menu_model';
import {addButton} from '/src/game_board/view/board_view';

const SUPPORTED_MENU_ITEMS = [
  ContextMenuItem.AddToken,
  ContextMenuItem.EditToken,
  ContextMenuItem.CopyToken,
  ContextMenuItem.ClearHighlight,
  ContextMenuItem.OrangeHighlight,
  ContextMenuItem.BlueHighlight,
  ContextMenuItem.PeekFog,
  ContextMenuItem.UnpeekFog,
  ContextMenuItem.ClearFog,
  ContextMenuItem.AddFog,
  ContextMenuItem.ZoomIn,
  ContextMenuItem.ZoomOut,
];

export class ContextMenuView {
  private readonly menu: HTMLElement;
  private readonly buttons: Map<ContextMenuItem, HTMLElement>;

  constructor(
      parent: HTMLElement,
      clickListener: (item: ContextMenuItem) => any) {
    this.menu = document.createElement('div');
    this.menu.id = 'rightClickMenu';
    this.menu.style.zIndex = '20';
    this.menu.style.display = 'none';
    parent.appendChild(this.menu);

    this.buttons = new Map();
    for (const item of SUPPORTED_MENU_ITEMS) {
      const button = addButton(this.menu, item);
      button.onclick = (mouseEvent) => {
        if (mouseEvent.button != 0) {
          console.log('Ignoring non-left button click on ' + item);
          return;
        }
        clickListener(item);
      };
      this.buttons.set(item, button);
    }
  }

  bind(model: ContextMenuModel, invalidItems: ContextMenuItem[]): void {
    if (model.isVisible) {
      const point = model.clickPoint;
      this.menu.style.top = point.y + 'px';
      this.menu.style.left = point.x + 'px';
      for (const item of SUPPORTED_MENU_ITEMS) {
        checkDefined(this.buttons.get(item), item).style.display =
            invalidItems.includes(item) ? 'none' : 'initial';
      }
      this.menu.style.display = 'initial';
    } else {
      this.menu.style.display = 'none';
    }
  }
}
