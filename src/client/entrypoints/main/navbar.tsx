import React from 'react';

export enum NavbarOption {
  MAIN = 'Game Board',
  EDITOR = 'Board Tools',
}

export interface NavbarProps {
  selected: NavbarOption;
  setSelected: React.Dispatch<React.SetStateAction<NavbarOption>>;
}

export function Navbar(props: NavbarProps): JSX.Element {
  return (
    <div className="topnav">
      <div
        className={props.selected === NavbarOption.MAIN ? 'active' : 'inactive'}
        onClick={() => props.setSelected(NavbarOption.MAIN)}
      >
        Game Board
      </div>
      <div
        className={
          props.selected === NavbarOption.EDITOR ? 'active' : 'inactive'
        }
        onClick={() => props.setSelected(NavbarOption.EDITOR)}
      >
        Board Tools
      </div>
    </div>
  );
}
