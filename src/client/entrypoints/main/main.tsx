import React from 'react';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Hideable} from '_client/common/ui_components/hideable';

import {setupEditorPanel} from '_client/entrypoints/main/editor';
import {
  setupActiveBoard,
  setupChatPanel,
} from '_client/entrypoints/main/game_board';
import {checkDefined} from '_common/preconditions';

export const MAIN_BOARD_STUB = 'mainBoard';

export enum NavbarOption {
  MAIN = 'Game Board',
  EDITOR = 'Board Tools',
}

ReactDOM.render(<Panels />, document.querySelector('#contentStub'));
setupActiveBoard();
const optionBoxMap: Map<NavbarOption, Promise<Hideable>> = new Map([
  [NavbarOption.MAIN, setupChatPanel()],
  [NavbarOption.EDITOR, Promise.resolve(setupEditorPanel())],
]);
showBoxFor(NavbarOption.MAIN);

async function showBoxFor(option: NavbarOption): Promise<void> {
  const boxes = Array(...optionBoxMap.values());
  for (const box of boxes) {
    try {
      (await box).hide();
    } catch {
      // No-op - usually this just means the box was already hidden.
    }
  }
  (await checkDefined(optionBoxMap.get(option))).show();
}

function Navbar(): JSX.Element {
  const [selected, setSelected] = useState(NavbarOption.MAIN);

  useEffect(() => {
    document.title = `DnD ${selected}`;
  });

  return (
    <div className="topnav">
      <div
        className={selected === NavbarOption.MAIN ? 'active' : 'inactive'}
        onClick={() => {
          setSelected(NavbarOption.MAIN);
          showBoxFor(NavbarOption.MAIN);
          setupActiveBoard();
        }}
      >
        Game Board
      </div>
      <div
        className={selected === NavbarOption.EDITOR ? 'active' : 'inactive'}
        onClick={() => {
          setSelected(NavbarOption.EDITOR);
          showBoxFor(NavbarOption.EDITOR);
        }}
      >
        Board Tools
      </div>
    </div>
  );
}

export function Panels(): JSX.Element {
  return (
    <div>
      <div id="panel1" className="split left">
        <div id={MAIN_BOARD_STUB} style={{position: 'relative'}}></div>
        <div id="rightClickMenuStub"></div>
        <div id="addNewIconFormStub" style={{zIndex: 30, display: 'top'}}></div>
      </div>
      <div id="panel2" className="split right">
        <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
          <Navbar />
          <div id="sidePanelContent"></div>
        </div>
      </div>
    </div>
  );
}
