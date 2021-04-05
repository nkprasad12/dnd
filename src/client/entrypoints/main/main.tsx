import React from 'react';
import {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {NewTokenForm} from '_client/board_tools/new_token_form';
import {ChatBoxView} from '_client/chat_box/chat_box_view';
import {ChatClient} from '_client/chat_box/chat_client';
import {setupActiveBoard} from '_client/entrypoints/main/board_setup';
import {NavbarOption, Navbar} from '_client/entrypoints/main/navbar';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardClient} from '_client/game_board/remote/board_client';
import {connectTo} from '_client/server/socket_connection';
import * as UiUtil from '_client/common/ui_util';
import {Location} from '_common/coordinates';
import {TokenModel} from '_client/game_board/model/token_model';
import {EditTokenForm} from '_client/board_tools/edit_token_form';
import {TEXT_COLOR} from '_client/common/styles';
import {EditingArea} from '_client/entrypoints/main/editing_area';

const MAIN_BOARD_STUB = 'mainBoard';

const INITIAL_LOCATION = {col: 0, row: 0};

const chatClient = connectTo('chat').then((socket) => new ChatClient(socket));
ReactDOM.render(<Panels />, document.querySelector('#contentStub'));

export function Panels(): JSX.Element {
  const [selected, setSelected] = useState(NavbarOption.MAIN);
  const [newTokenFormVisible, setNewTokenFormVisible] = useState(false);
  const [newTokenTile, setNewTokenTile] = useState(INITIAL_LOCATION);
  const [editTokenFormVisible, setEditTokenFormVisible] = useState(false);
  const [editTokenModel, setEditTokenModel] = useState<TokenModel | null>(null);
  const [board, setBoard] = useState<GameBoard | null>(null);
  const [boardMessage, setBoardMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `DnD ${selected}`;
    if (selected === NavbarOption.MAIN) {
      setupActiveBoard(
        uiController(
          setNewTokenTile,
          setNewTokenFormVisible,
          setBoard,
          setBoardMessage,
          setEditTokenFormVisible,
          setEditTokenModel
        )
      ).then(() => setBoard(GameBoard.existingBoard));
    }
  }, [selected]);

  const boardMessageView =
    board === null && boardMessage !== null ? (
      <label color={TEXT_COLOR}>{boardMessage}</label>
    ) : null;

  return (
    <div>
      <div id="panel1" className="split left">
        <div id={MAIN_BOARD_STUB} style={{position: 'relative'}}></div>
        {boardMessageView}
        <div id="rightClickMenuStub"></div>
        {board && (
          <NewTokenForm
            visible={newTokenFormVisible}
            setVisibility={setNewTokenFormVisible}
            modelHandler={board.modelHandler}
            tile={newTokenTile}
          />
        )}
        {board && editTokenModel && (
          <EditTokenForm
            visible={editTokenFormVisible}
            setVisibility={setEditTokenFormVisible}
            modelHandler={board.modelHandler}
            token={editTokenModel}
          />
        )}
      </div>
      <div id="panel2" className="split right">
        <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
          <Navbar selected={selected} setSelected={setSelected} />
          <div id="sidePanelContent">
            <EditingArea
              visible={selected === NavbarOption.EDITOR}
              board={board}
              controller={uiController(
                setNewTokenTile,
                setNewTokenFormVisible,
                setBoard,
                setBoardMessage,
                setEditTokenFormVisible,
                setEditTokenModel
              )}
            />
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

function uiController(
  setNewTokenTile: (tile: Location) => any,
  setNewTokenFormVisible: (visible: boolean) => any,
  setBoard: (board: GameBoard) => any,
  setBoardMessage: (message: string) => any,
  setEditTokenVisibility: (visible: boolean) => any,
  setEditTokenFormModel: (token: TokenModel) => any
): UiController {
  const controller = UiController.create(
    setNewTokenTile,
    setNewTokenFormVisible,
    async (model) => {
      UiUtil.removeChildrenOf(MAIN_BOARD_STUB);
      const board = GameBoard.create(
        MAIN_BOARD_STUB,
        model,
        await BoardClient.get(),
        await chatClient,
        controller
      );
      setBoard(board);
    },
    setBoardMessage,
    setEditTokenVisibility,
    setEditTokenFormModel
  );
  return controller;
}
