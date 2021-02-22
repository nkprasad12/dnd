var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getElementById } from '/static/js/common/common.js';
function addDropdown(parent) {
    const item = document.createElement('div');
    item.className = 'dropdown';
    parent.appendChild(item);
    return item;
}
function addDropdownButton(parent, label) {
    const item = document.createElement('button');
    item.className = 'dropbtn';
    item.innerHTML = label;
    parent.appendChild(item);
    return item;
}
function addDropdownContent(parent) {
    const item = document.createElement('div');
    item.className = 'dropdown-content';
    parent.appendChild(item);
    return item;
}
function addButtonItem(parent, className, label) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = className;
    item.innerHTML = label;
    parent.appendChild(item);
    return item;
}
function addSelectorItem(parent, model) {
    const className = model.isSelected ? 'btn btn-primary' : 'btn';
    return addButtonItem(parent, className, model.boardId);
}
class BoardSelectorItem {
    constructor(boardId, isSelected) {
        this.boardId = boardId;
        this.isSelected = isSelected;
    }
}
export class BoardSelectorModel {
    constructor(items) {
        this.items = items;
    }
    static createForActiveSetting(server) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeBoard = yield server.requestActiveBoardId();
            const allBoards = yield server.requestBoardOptions();
            const items = allBoards.map((id) => new BoardSelectorItem(id, id === activeBoard));
            return new BoardSelectorModel(items);
        });
    }
}
export class BoardSelectorView {
    constructor(parent, label, clickListener) {
        this.clickListener = clickListener;
        const root = addDropdown(parent);
        addDropdownButton(root, label);
        this.content = addDropdownContent(root);
    }
    bind(model) {
        while (this.content.firstChild) {
            this.content.removeChild(this.content.firstChild);
        }
        for (const item of model.items) {
            const button = addSelectorItem(this.content, item);
            button.onclick = () => this.clickListener(item.boardId);
        }
    }
}
export function removeChildrenOf(id) {
    const item = getElementById(id);
    while (item.firstChild) {
        item.removeChild(item.firstChild);
    }
}
export class BoardSelector {
    constructor(parent, label, onSelection, initialModel) {
        this.parent = parent;
        this.model = new BoardSelectorModel([]);
        const listener = (id) => {
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
    static createActiveBoardSelector(parentId, server) {
        return new BoardSelector(getElementById(parentId), 'Set Active Board', (id) => server.setActiveBoard(id), BoardSelectorModel.createForActiveSetting(server));
    }
    static createEditBoardSelector(parentId, server, onSelection) {
        const initialModel = server.requestBoardOptions()
            .then((ids) => new BoardSelectorModel(ids.map((id) => new BoardSelectorItem(id, false))));
        return new BoardSelector(getElementById(parentId), 'Edit Existing Board', onSelection, initialModel);
    }
}
