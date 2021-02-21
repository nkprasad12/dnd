import {getElementById} from '/src/common/common';
import {BoardServer} from '/src/game_board/remote/board_server';

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
    parent: HTMLElement, className: string, label: string): HTMLElement {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = className;
  item.innerHTML = label;
  parent.appendChild(item);
  return item;
}

function addSelectorItem(
    parent: HTMLElement, model: BoardSelectorItem): HTMLElement {
  const className = model.isSelected ? 'btn btn-primary' : 'btn';
  return addButtonItem(parent, className, model.boardId);
}

class BoardSelectorItem {
  constructor(public readonly boardId: string, public isSelected: boolean) {}
}

export class BoardSelectorModel {
  static async createForActiveSetting(
      server: BoardServer): Promise<BoardSelectorModel> {
    const activeBoard = await server.requestActiveBoardId();
    const allBoards = await server.requestBoardOptions();
    const items: BoardSelectorItem[] =
        allBoards.map((id) => new BoardSelectorItem(id, id === activeBoard));
    return new BoardSelectorModel(items);
  }

  constructor(readonly items: BoardSelectorItem[]) {}
}

export class BoardSelectorView {
  private readonly content;

  constructor(
      parent: HTMLElement,
      label: string,
      private readonly clickListener: (id: string) => any) {
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
      parentId: string, server: BoardServer): BoardSelector {
    return new BoardSelector(
        getElementById(parentId),
        'Set Active Board',
        (id) => server.setActiveBoard(id),
        BoardSelectorModel.createForActiveSetting(server));
  }

  static createEditBoardSelector(
      parentId: string,
      server: BoardServer,
      onSelection: (id: string) => any): BoardSelector {
    const initialModel =
        server.requestBoardOptions()
            .then((ids) =>
              new BoardSelectorModel(
                  ids.map((id) => new BoardSelectorItem(id, false))));
    return new BoardSelector(
        getElementById(parentId),
        'Edit Existing Board',
        onSelection,
        initialModel);
  }

  private model: BoardSelectorModel = new BoardSelectorModel([]);

  private constructor(
      private readonly parent: HTMLElement,
      label: string,
      onSelection: (id: string) => any,
      initialModel: Promise<BoardSelectorModel>) {
    const listener = (id: string) => {
      for (const item of this.model.items) {
        item.isSelected = id === item.boardId;
      }
      view.bind(this.model);
      onSelection(id);
    };
    const view = new BoardSelectorView(this.parent, label, listener);
    initialModel
        .then((model) => {
          this.model = model;
          view.bind(this.model);
        });
  }
}
