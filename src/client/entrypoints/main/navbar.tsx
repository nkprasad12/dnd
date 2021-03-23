import React from 'react';

export enum NavbarOption {
  MAIN = 'Game Board',
  EDITOR = 'Board Tools',
}

export interface NavbarProps {
  // Which Navbar option should be displayed as selected.
  selected: NavbarOption;
  // A callback to invoke when a new option is selected.
  setSelected: React.Dispatch<React.SetStateAction<NavbarOption>>;
}

export function Navbar(props: NavbarProps): JSX.Element {
  return (
    <div className="topnav">
      <NavbarOptionView
        selected={props.selected}
        setSelected={props.setSelected}
        optionName={NavbarOption.MAIN}
      />
      <NavbarOptionView
        selected={props.selected}
        setSelected={props.setSelected}
        optionName={NavbarOption.EDITOR}
      />
    </div>
  );
}

interface NavbarOptionViewProps extends NavbarProps {
  optionName: NavbarOption;
}

function NavbarOptionView(props: NavbarOptionViewProps) {
  return (
    <div
      className={props.selected === props.optionName ? 'active' : 'inactive'}
      onClick={() => props.setSelected(props.optionName)}
    >
      {props.optionName}
    </div>
  );
}
