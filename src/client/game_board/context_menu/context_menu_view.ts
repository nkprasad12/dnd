import {checkDefined} from '_common/preconditions';
import {ContextMenuModel, ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {addButton} from '_client/game_board/view/board_view';

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
  menu.onclick = (event) => {
    event.preventDefault();
    return false;
  };
  menu.oncontextmenu = (event) => {
    event.preventDefault();
    return false;
  };
  parent.appendChild(menu);
  return menu;
}

export class ContextMenuView {
  private readonly menu: HTMLElement;
  // private readonly submenu: HTMLElement;
  private readonly categories: Map<string, HTMLElement>;
  private readonly buttons: Map<ContextMenuItem, HTMLElement>;

  constructor(
      parent: HTMLElement,
      clickListener: (item: ContextMenuItem) => any) {
    this.menu = addMenu(parent);
    this.categories = new Map();
    this.buttons = new Map();

    CATEGORY_ITEM_MAP.forEach((items, category) => {
      const categoryMenu = addButton(this.menu, category);
      categoryMenu.onclick = (event) => {
        event.preventDefault();
        return false;
      };
      categoryMenu.oncontextmenu = (event) => {
        event.preventDefault();
        return false;
      };
      const submenu = addMenu(categoryMenu);
      categoryMenu.onmouseenter = () => {
        submenu.style.top =
            (categoryMenu.getBoundingClientRect().top -
                this.menu.getBoundingClientRect().top) + 'px';
        submenu.style.left = this.menu.getBoundingClientRect().width + 'px';
        submenu.style.display = 'initial';
      };
      categoryMenu.onmouseleave = () => submenu.style.display = 'none';
      this.categories.set(category, categoryMenu);
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
      this.categories.forEach((button, label) => {
        const items = CATEGORY_ITEM_MAP.get(label);
        if (items === undefined) {
          console.log('Category item map does not have label: ' + label);
          return;
        }
        const itemsToShow =
            items.filter((item) => !invalidItems.includes(item));
        button.style.display = itemsToShow.length > 0 ? 'initial' : 'none';
      });
      this.menu.style.display = 'initial';
    } else {
      this.menu.style.display = 'none';
    }
  }
}
