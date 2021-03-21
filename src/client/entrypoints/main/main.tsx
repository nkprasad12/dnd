import React from 'react';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {EditingArea} from '_client/entrypoints/main/board_tools';
import {setupEditorPanel} from '_client/entrypoints/main/editor';
import {
  setupActiveBoard,
  setupChatPanel,
} from '_client/entrypoints/main/game_board';
import {NavbarOption, Navbar} from '_client/entrypoints/main/navbar';

export const MAIN_BOARD_STUB = 'mainBoard';

ReactDOM.render(<Panels />, document.querySelector('#contentStub'));
// TODO: Remove this once the chat box is set up as a proper React component
// and toggle the visibility like we're doing for the EditingArea.
const chatPanel = setupChatPanel();

export function Panels(): JSX.Element {
  const [selected, setSelected] = useState(NavbarOption.MAIN);

  useEffect(() => {
    document.title = `DnD ${selected}`;
    if (selected === NavbarOption.MAIN) {
      chatPanel.then((chat) => chat.show());
      setupActiveBoard();
    } else {
      chatPanel.then((chat) => {
        chat.hide();
        // TODO: Remove this once we've set up the editing internals as a proper
        // React component. This method assumes that the elements we're adding
        // are in the actual Document.
        setupEditorPanel();
      });
    }
  });

  return (
    <div>
      <div id="panel1" className="split left">
        <div id={MAIN_BOARD_STUB} style={{position: 'relative'}}></div>
        <div id="rightClickMenuStub"></div>
        <div id="addNewIconFormStub" style={{zIndex: 30, display: 'top'}}></div>
      </div>
      <div id="panel2" className="split right">
        <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
          <Navbar selected={selected} setSelected={setSelected} />
          <div id="sidePanelContent">
            <EditingArea visible={selected === NavbarOption.EDITOR} />
          </div>
        </div>
      </div>
    </div>
  );
}
