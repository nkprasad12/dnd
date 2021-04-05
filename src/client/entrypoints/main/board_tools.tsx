import React, {useEffect, useState} from 'react';
import {BoardSelector} from '_client/board_tools/board_selector';
import {BoardUpdateFormView} from '_client/board_tools/board_update_form';
import {NewBoardForm} from '_client/board_tools/new_board_form';
import {SelectorItem} from '_client/common/ui_components/dropdown';
import {loadBoard} from '_client/entrypoints/main/game_board';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardClient} from '_client/game_board/remote/board_client';

const boardEditRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};

export interface EditingAreaProps {
  visible: boolean;
  board: GameBoard | null;
  controller: UiController;
}

export function EditingArea(props: EditingAreaProps): JSX.Element | null {
  const [newBoardFormVisible, setNewBoardFormVisible] = useState(false);
  const [activeModel, setActiveModel] = useState<SelectorItem<string>[]>([]);
  const [editModel, setEditModel] = useState<SelectorItem<string>[]>([]);

  useEffect(() => {
    const boardOptions = BoardClient.get().then((client) =>
      client.requestBoardOptions()
    );
    const selectorModel = BoardSelectorModel.create(boardOptions);
    selectorModel.then((model) => {
      setActiveModel(model.items.slice());
      setEditModel(model.items.slice());
    });
  }, []);

  if (!props.visible) {
    return null;
  }
  return (
    <div>
      <div style={boardEditRow}>
        <BoardSelector.View
          onEditBoard={(id) =>
            loadBoard(id, props.controller).then((model) =>
              props.controller.setBoard(model)
            )
          }
          activeModel={activeModel}
          setActiveModel={setActiveModel}
          editModel={editModel}
          setEditModel={setEditModel}
        />
      </div>
      <br />
      <div style={boardEditRow}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setNewBoardFormVisible(true);
          }}
        >
          Create New
        </button>
      </div>

      <NewBoardForm
        visible={newBoardFormVisible}
        setVisibility={setNewBoardFormVisible}
        onNewBoard={async (model) => {
          props.controller.setBoard(model);
          (await BoardClient.get()).createBoard(model.inner);
          setActiveModel(activeModel.concat(idSelector(model.inner.id, false)));
          const newEditModel = editModel
            .map((item) => SelectorItem.setSelected(item, false))
            .concat(idSelector(model.inner.id, true));
          setEditModel(newEditModel);
        }}
      />

      <br />
      <br />

      {props.board && <BoardUpdateFormView board={props.board} />}
    </div>
  );
}

function idSelector(id: string, isSelected: boolean): SelectorItem<string> {
  return SelectorItem.create(id, id, isSelected, id);
}

class BoardSelectorModel {
  static async create(boards: Promise<string[]>): Promise<BoardSelectorModel> {
    const allBoards = await boards;
    const activeBoard = await (await BoardClient.get()).requestActiveBoardId();
    const items: SelectorItem<string>[] = allBoards.map((id) =>
      idSelector(id, id === activeBoard)
    );
    return new BoardSelectorModel(items);
  }

  constructor(readonly items: SelectorItem<string>[]) {}
}
