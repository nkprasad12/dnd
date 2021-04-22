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
import {Location} from '_common/coordinates';
import {TokenModel} from '_client/game_board/model/token_model';
import {EditTokenForm} from '_client/board_tools/edit_token_form';
import {TEXT_COLOR} from '_client/common/styles';
import {EditingArea} from '_client/entrypoints/main/editing_area';
import {ContextMenuView} from '_client/game_board/context_menu/context_menu_view';
import {BoardModel} from '_client/game_board/model/board_model';
import {UpdateListener} from '_client/game_board/controller/model_handler';
import {ReactBoardView} from '_client/game_board/view/react_board_view';
import {BoardView} from '_client/game_board/view/board_view';

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
  const [boardView, setBoardView] = useState<BoardView | null>(null);
  const [boardModel, setBoardModel] = useState<BoardModel | null>(null);

  useEffect(() => {
    document.title = `DnD ${selected}`;
    if (selected === NavbarOption.MAIN && boardView) {
      setupActiveBoard(
        uiController(
          setNewTokenTile,
          setNewTokenFormVisible,
          setBoard,
          boardView,
          setBoardMessage,
          setEditTokenFormVisible,
          setEditTokenModel
        )
      ).then(() => setBoard(GameBoard.existingBoard));
    }
  }, [selected, boardView]);

  useEffect(() => {
    if (board === null) {
      return;
    }
    board.modelHandler.addListeners([
      UpdateListener.forLocal((newBoardModel) => setBoardModel(newBoardModel)),
    ]);
  }, [board]);

  const boardMessageView =
    board === null && boardMessage !== null ? (
      <label style={{color: TEXT_COLOR}}>{boardMessage}</label>
    ) : null;

  return (
    <div>
      <div id="panel1" className="split left">
        <ReactBoardView onBoardView={setBoardView} />
        {boardMessageView}
        {board && boardModel && (
          <ContextMenuView
            clickListener={(item) => board.onContextMenuClick(item)}
            boardModel={boardModel}
          />
        )}
        {board && (
          <NewTokenForm
            visible={newTokenFormVisible}
            setVisibility={setNewTokenFormVisible}
            modelHandler={board.modelHandler}
            entityController={board.entityController}
            tile={newTokenTile}
          />
        )}
        {board && editTokenModel && (
          <EditTokenForm
            visible={editTokenFormVisible}
            setVisibility={setEditTokenFormVisible}
            modelHandler={board.modelHandler}
            entityController={board.entityController}
            token={editTokenModel}
          />
        )}
      </div>
      <div id="panel2" className="split right">
        <div style={{backgroundColor: 'rgb(69, 69, 69)'}}>
          <Navbar selected={selected} setSelected={setSelected} />
          <div id="sidePanelContent">
            {boardView && (
              <EditingArea
                visible={selected === NavbarOption.EDITOR}
                board={board}
                controller={uiController(
                  setNewTokenTile,
                  setNewTokenFormVisible,
                  setBoard,
                  boardView,
                  setBoardMessage,
                  setEditTokenFormVisible,
                  setEditTokenModel
                )}
              />
            )}
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
  boardView: BoardView,
  setBoardMessage: (message: string) => any,
  setEditTokenVisibility: (visible: boolean) => any,
  setEditTokenFormModel: (token: TokenModel) => any
): UiController {
  const controller = UiController.create(
    setNewTokenTile,
    setNewTokenFormVisible,
    async (model) => {
      const board = GameBoard.create(
        boardView,
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
