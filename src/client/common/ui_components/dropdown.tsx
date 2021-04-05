import React from 'react';

/** Data for an item in a drop down selection. */
export interface SelectorItem<T> {
  readonly id: string;
  readonly displayName: string;
  readonly isSelected: boolean;
  readonly data: T;
}

export namespace SelectorItem {
  export function setSelected(item: SelectorItem<any>, value: boolean) {
    return {
      id: item.id,
      displayName: item.displayName,
      data: item.data,
      isSelected: value,
    };
  }
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

export interface DropdownSelectorProps<T> {
  label: string;
  model: readonly SelectorItem<T>[];
  clickListener: (item: SelectorItem<T>, newModel: SelectorItem<T>[]) => any;
}

export function DropdownSelectorView<T>(props: DropdownSelectorProps<T>) {
  const itemViews = props.model.map((item) => (
    <DropdownItemView
      model={item}
      key={item.id}
      onClick={() => {
        const newModel = props.model.map((v) =>
          SelectorItem.setSelected(v, item.id === v.id)
        );
        props.clickListener(item, newModel);
      }}
    />
  ));

  return (
    <div style={{zIndex: 100}} className="dropdown">
      <button className="dropbtn">{props.label}</button>
      <div className="dropdown-content">{itemViews}</div>
    </div>
  );
}

function DropdownItemView<T>(props: {
  model: SelectorItem<any>;
  onClick: (item: SelectorItem<T>) => any;
}) {
  return (
    <button
      className={props.model.isSelected ? 'btn btn-primary' : 'btn'}
      type="button"
      onClick={() => props.onClick(props.model)}
    >
      {props.model.displayName}
    </button>
  );
}
