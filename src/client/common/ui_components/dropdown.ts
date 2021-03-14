/** Data for an item in a drop down selection. */
export interface SelectorItem<T> {
  readonly id: string;
  readonly displayName: string;
  isSelected: boolean;
  data: T;
}

export namespace SelectorItem {
  /**
   * Convenience method to create a selectorItem in a one line
   * arrow function.
   */
  export function create<T>(
    id: string,
    displayName: string,
    isSelected: boolean,
    data: T
  ): SelectorItem<T> {
    return {
      id: id,
      displayName: displayName,
      isSelected: isSelected,
      data: data,
    };
  }
}

export class SelectorView<T> {
  private readonly content;

  constructor(
    parent: HTMLElement,
    label: string,
    private readonly clickListener: (item: SelectorItem<T>) => any
  ) {
    parent.style.zIndex = '100';
    const root = addDropdown(parent);
    addDropdownButton(root, label);
    this.content = addDropdownContent(root);
  }

  bind(model: SelectorItem<T>[]) {
    while (this.content.firstChild) {
      this.content.removeChild(this.content.firstChild);
    }
    for (const item of model) {
      const button = addSelectorItem(this.content, item);
      button.onclick = () => this.clickListener(item);
    }
  }
}

export class DropdownSelector<T> {
  private model: SelectorItem<T>[] = [];
  private view: SelectorView<T>;

  constructor(
    private readonly parent: HTMLElement,
    label: string,
    onSelection: (data: T) => any,
    initialModel: Promise<SelectorItem<T>[]>
  ) {
    const listener = (selected: SelectorItem<T>) => {
      for (const item of this.model) {
        item.isSelected = item.id === selected.id;
      }
      view.bind(this.model);
      onSelection(selected.data);
    };
    const view = new SelectorView(this.parent, label, listener);
    initialModel.then((model) => {
      this.model = model;
      view.bind(this.model);
    });
    this.view = view;
  }

  add(newItem: SelectorItem<T>): void {
    for (const item of this.model) {
      if (item.id === newItem.id) {
        return;
      }
    }
    this.model.push(newItem);
    // TODO: this allows multiple selected items. Add option to disallow this.
    this.view.bind(this.model);
  }
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
  model: SelectorItem<any>
): HTMLElement {
  const className = model.isSelected ? 'btn btn-primary' : 'btn';
  return addButtonItem(parent, className, model.displayName);
}

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
