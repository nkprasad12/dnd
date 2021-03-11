import {getElementById} from '_client/common/ui_util';
import {BoardClient} from '_client/game_board/remote/board_client';

function addDropdown(parent: HTMLElement): HTMLElement {
  const item = document.createElement('div');
  item.className = 'dropdown';
  parent.appendChild(item);
  return item;
}

function addDropdownButton(parent: HTMLElement, label: string): HTMLElement {
  const item = document.createElement('button');
  item.className = 'dropbtn';
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

function addDropdownContent(parent: HTMLElement): HTMLElement {
  const item = document.createElement('div');
  item.className = 'dropdown-content';
  parent.appendChild(item);
  return item;
}

function addButtonItem(
  parent: HTMLElement,
  className: string,
  label: string
): HTMLElement {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = className;
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

function addSelectorItem(
  parent: HTMLElement,
  model: BoardSelectorItem
): HTMLElement {
  const className = model.isSelected ? 'btn btn-primary' : 'btn';
  return addButtonItem(parent, className, model.boardId);
}

class BoardSelectorItem {
  constructor(public readonly boardId: string, public isSelected: boolean) {}
}

export class BoardSelectorModel {
  static async createForActiveSetting(
    server: BoardClient,
    boards: Promise<string[]>
  ): Promise<BoardSelectorModel> {
    const allBoards = await boards;
    const activeBoard = await server.requestActiveBoardId();
    const items: BoardSelectorItem[] = allBoards.map(
      (id) => new BoardSelectorItem(id, id === activeBoard)
    );
    return new BoardSelectorModel(items);
  }

  constructor(readonly items: BoardSelectorItem[]) {}
}

export class BoardSelectorView {
  private readonly content;

  constructor(
    parent: HTMLElement,
    label: string,
    private readonly clickListener: (id: string) => any
  ) {
    parent.style.zIndex = '100';
    const root = addDropdown(parent);
    addDropdownButton(root, label);
    this.content = addDropdownContent(root);
  }

  bind(model: BoardSelectorModel) {
    while (this.content.firstChild) {
      this.content.removeChild(this.content.firstChild);
    }
    for (const item of model.items) {
      const button = addSelectorItem(this.content, item);
      button.onclick = () => this.clickListener(item.boardId);
    }
  }
}

export function removeChildrenOf(id: string) {
  const item = getElementById(id);
  while (item.firstChild) {
    item.removeChild(item.firstChild);
  }
}

export class BoardSelector {
  static createActiveBoardSelector(
    parentId: string,
    server: BoardClient,
    boards: Promise<string[]>
  ): BoardSelector {
    return new BoardSelector(
      getElementById(parentId),
      'Set Active',
      (id) => server.setActiveBoard(id),
      BoardSelectorModel.createForActiveSetting(server, boards)
    );
  }

  static createEditBoardSelector(
    parentId: string,
    onSelection: (id: string) => any,
    boards: Promise<string[]>
  ): BoardSelector {
    const initialModel = boards.then(
      (ids) =>
        new BoardSelectorModel(
          ids.map((id) => new BoardSelectorItem(id, false))
        )
    );
    return new BoardSelector(
      getElementById(parentId),
      'Edit Existing',
      onSelection,
      initialModel
    );
  }

  private model: BoardSelectorModel = new BoardSelectorModel([]);
  private view: BoardSelectorView;

  private constructor(
    private readonly parent: HTMLElement,
    label: string,
    onSelection: (id: string) => any,
    initialModel: Promise<BoardSelectorModel>
  ) {
    const listener = (id: string) => {
      for (const item of this.model.items) {
        item.isSelected = id === item.boardId;
      }
      view.bind(this.model);
      onSelection(id);
    };
    const view = new BoardSelectorView(this.parent, label, listener);
    initialModel.then((model) => {
      this.model = model;
      view.bind(this.model);
    });
    this.view = view;
  }

  add(id: string, isSelected: boolean): void {
    for (const items of this.model.items) {
      if (items.boardId === id) {
        return;
      }
    }
    this.model.items.push(new BoardSelectorItem(id, isSelected));
    this.view.bind(this.model);
  }
}
