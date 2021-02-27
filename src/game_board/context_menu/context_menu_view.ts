import {ContextMenuModel} from '/src/game_board/context_menu/context_menu_model';
import {addButton} from '/src/game_board/view/board_view';

export class ContextMenu {
  menu: HTMLElement;
  clearFogButton: HTMLElement;
  applyFogButton: HTMLElement;
  addTokenButton: HTMLElement;
  peekFogButton: HTMLElement;
  unpeekFogButton: HTMLElement;
  clearHighlightButton: HTMLElement;
  orangeHighlightButton: HTMLElement;
  blueHighlightButton: HTMLElement;
  editTokenButton: HTMLElement;
  copyTokenButton: HTMLElement;

  constructor(parent: HTMLElement) {
    this.menu = document.createElement('div');
    this.menu.id = 'rightClickMenu';
    this.menu.style.zIndex = '20';
    this.menu.style.display = 'none';
    parent.appendChild(this.menu);

    this.clearFogButton = addButton(this.menu, 'Clear Fog');
    this.applyFogButton = addButton(this.menu, 'Add Fog');
    this.peekFogButton = addButton(this.menu, 'Peek Fog');
    this.unpeekFogButton = addButton(this.menu, 'Un-peek Fog');
    this.clearHighlightButton = addButton(this.menu, 'Clear Highlight');
    this.orangeHighlightButton = addButton(this.menu, 'Highlight Orange');
    this.blueHighlightButton = addButton(this.menu, 'Highlight Blue');
    this.addTokenButton = addButton(this.menu, 'Add Token');
    this.editTokenButton = addButton(this.menu, 'Edit Token');
    this.copyTokenButton = addButton(this.menu, 'Copy Token');
  }

  bind(model: ContextMenuModel): void {
    if (model.isVisible) {
      const point = model.clickPoint;
      this.menu.style.top = point.y + 'px';
      this.menu.style.left = point.x + 'px';
      this.menu.style.display = 'initial';
    } else {
      this.menu.style.display = 'none';
    }
    // TODO: Remove irrelevant menu options.
  }
}
