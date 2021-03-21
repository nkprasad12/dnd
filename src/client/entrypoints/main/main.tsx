import React from 'react';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {ChatBoxView} from '_client/chat_box/chat_box_view';
import {ChatClient} from '_client/chat_box/chat_client';
import {EditingArea} from '_client/entrypoints/main/board_tools';
import {setupEditorPanel} from '_client/entrypoints/main/editor';
import {setupActiveBoard} from '_client/entrypoints/main/game_board';
import {NavbarOption, Navbar} from '_client/entrypoints/main/navbar';
import {connectTo} from '_client/server/socket_connection';

export const MAIN_BOARD_STUB = 'mainBoard';

ReactDOM.render(<Panels />, document.querySelector('#contentStub'));

export function Panels(): JSX.Element {
  const [selected, setSelected] = useState(NavbarOption.MAIN);

  useEffect(() => {
    document.title = `DnD ${selected}`;
    if (selected === NavbarOption.MAIN) {
      setupActiveBoard();
    } else {
      setupEditorPanel();
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
            <ChatBoxView
              visible={selected === NavbarOption.MAIN}
              chatClient={connectTo('chat').then(
                (socket) => new ChatClient(socket)
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
