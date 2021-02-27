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

const CATEGORY_TOKENS = 'Tokens';
const CATEGORY_FOG = 'Fog';
const CATEGORY_HIGHLIGHTS = 'Highlights';
const CATEGORY_ZOOM = 'Zoom';

const CATEGORY_ITEM_MAP = new Map([
  [
    CATEGORY_TOKENS,
    [
      ContextMenuItem.AddToken,
      ContextMenuItem.EditToken,
      ContextMenuItem.CopyToken,
    ],
  ],
  [
    CATEGORY_FOG,
    [
      ContextMenuItem.AddFog,
      ContextMenuItem.ClearFog,
      ContextMenuItem.PeekFog,
      ContextMenuItem.UnpeekFog,
    ],
  ],
  [
    CATEGORY_HIGHLIGHTS,
    [
      ContextMenuItem.ClearHighlight,
      ContextMenuItem.BlueHighlight,
      ContextMenuItem.OrangeHighlight,
    ],
  ],
  [
    CATEGORY_ZOOM,
    [
      ContextMenuItem.ZoomIn,
      ContextMenuItem.ZoomOut,
    ],
  ],
]);

function addMenu(parent: HTMLElement): HTMLElement {
  const menu = document.createElement('div');
  menu.id = 'rightClickMenu';
  menu.style.zIndex = '20';
  menu.style.display = 'none';
  parent.appendChild(menu);
  return menu;
}

export class ContextMenuView {
  private readonly menu: HTMLElement;
  // private readonly submenu: HTMLElement;
  private readonly categories: Map<String, HTMLElement>;
  private readonly buttons: Map<ContextMenuItem, HTMLElement>;

  constructor(
      parent: HTMLElement,
      clickListener: (item: ContextMenuItem) => any) {
    this.menu = addMenu(parent);
    this.categories = new Map();
    this.buttons = new Map();

    CATEGORY_ITEM_MAP.forEach((items, category) => {
      const categoryMenu = addButton(this.menu, category);
      const submenu = addMenu(categoryMenu);
      categoryMenu.onmouseenter = () => {
        submenu.style.top =
            (categoryMenu.getBoundingClientRect().top -
                this.menu.getBoundingClientRect().top) + 'px';
        submenu.style.left = this.menu.getBoundingClientRect().width + 'px';
        submenu.style.display = 'initial';
      };
      categoryMenu.onmouseleave = () => submenu.style.display = 'none';
      this.categories.set(category, submenu);
      for (const item of items) {
        const button = addButton(submenu, item);
        button.onclick = (mouseEvent) => {
          if (mouseEvent.button != 0) {
            console.log('Ignoring non-left button click on ' + item);
            return;
          }
          clickListener(item);
        };
        this.buttons.set(item, button);
      }
    });


    // for (const item of SUPPORTED_MENU_ITEMS) {
    //   const button = addButton(this.menu, item);
    //   button.onclick = (mouseEvent) => {
    //     if (mouseEvent.button != 0) {
    //       console.log('Ignoring non-left button click on ' + item);
    //       return;
    //     }
    //     clickListener(item);
    //   };
    //   const submenu = addMenu(button);
    //   addButton(submenu, item);
    //   button.onmouseenter = () => {
    //     submenu.style.top =
    //         (button.getBoundingClientRect().top - this.menu.getBoundingClientRect().top) + 'px';
    //     submenu.style.left = this.menu.getBoundingClientRect().width + 'px';
    //     submenu.style.display = 'initial';
    //   };
    //   button.onmouseleave = () => submenu.style.display = 'none';
    // }
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
