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
  const className = model.isActive ? 'btn btn-primary' : 'btn';
  return addButtonItem(parent, className, model.boardId);
}

class BoardSelectorItem {
  constructor(public readonly boardId: string, public isActive: boolean) {}
}

export class BoardSelectorModel {
  static async create(server: BoardServer): Promise<BoardSelectorModel> {
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
      private readonly clickListener: (id: string) => any) {
    const root = addDropdown(parent);
    addDropdownButton(root, 'Set Active Board');
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

export class BoardSelector {
  static create(parentId: string, server: BoardServer): BoardSelector {
    return new BoardSelector(server, getElementById(parentId));
  }

  private model: BoardSelectorModel = new BoardSelectorModel([]);

  private constructor(
      private readonly server: BoardServer,
      private readonly parent: HTMLElement) {
    const listener = (id: string) => {
      for (const item of this.model.items) {
        item.isActive = id === item.boardId;
      }
      view.bind(this.model);
      server.setActiveBoard(id);
    };
    const view = new BoardSelectorView(this.parent, listener);
    BoardSelectorModel.create(this.server)
        .then((model) => {
          this.model = model;
          view.bind(this.model);
        });
  }
}
