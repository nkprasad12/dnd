import React from 'react';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {NewTokenForm} from '_client/board_tools/new_token_form';
import {ChatBoxView} from '_client/chat_box/chat_box_view';
import {ChatClient} from '_client/chat_box/chat_client';
import {EditingArea} from '_client/entrypoints/main/board_tools';
import {setupEditorPanel} from '_client/entrypoints/main/editor';
import {setupActiveBoard} from '_client/entrypoints/main/game_board';
import {NavbarOption, Navbar} from '_client/entrypoints/main/navbar';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {GameBoard} from '_client/game_board/controller/game_board';
import {connectTo} from '_client/server/socket_connection';

export const MAIN_BOARD_STUB = 'mainBoard';

const INITIAL_LOCATION = {col: 0, row: 0};

const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
ReactDOM.render(<Panels />, document.querySelector('#contentStub'));

export function Panels(): JSX.Element {
  const [selected, setSelected] = useState(NavbarOption.MAIN);
  const [newTokenFormVisible, setNewTokenFormVisible] = useState(false);
  const [newTokenTile, setNewTokenTile] = useState(INITIAL_LOCATION);
  const [board, setBoard] = useState<GameBoard | null>(null);

  console.log('State:');
  console.log('newTokenFormVisible: ' + newTokenFormVisible);
  console.log('newTokenTile: ' + newTokenTile);
  console.log('board: ' + board?.modelHandler.getModel().inner.id);

  useEffect(() => {
    document.title = `DnD ${selected}`;
    if (selected === NavbarOption.MAIN) {
      setupActiveBoard(
        chatClient,
        UiController.create(setNewTokenTile, setNewTokenFormVisible)
      ).then(() => setBoard(GameBoard.existingBoard));
    } else {
      setupEditorPanel(
        chatClient,
        UiController.create(setNewTokenTile, setNewTokenFormVisible)
      );
    }
  }, [selected]);

  return (
    <div>
      <div id="panel1" className="split left">
        <div id={MAIN_BOARD_STUB} style={{position: 'relative'}}></div>
        <div id="rightClickMenuStub"></div>
        {board && (
          <NewTokenForm
            visible={newTokenFormVisible}
            setVisibility={setNewTokenFormVisible}
            modelHandler={board.modelHandler}
            tile={newTokenTile}
          />
        )}
      </div>
      <div id="panel2" className="split right">
        <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
          <Navbar selected={selected} setSelected={setSelected} />
          <div id="sidePanelContent">
            <EditingArea visible={selected === NavbarOption.EDITOR} />
            <ChatBoxView
              visible={selected === NavbarOption.MAIN}
              chatClient={chatClient}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
