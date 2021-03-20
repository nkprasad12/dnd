import {BoardUpdateForm, NewBoardForm} from '_client/board_tools/board_form';
import {BoardSelector, idSelector} from '_client/board_tools/board_selector';
import * as UiUtil from '_client/common/ui_util';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardModel} from '_client/game_board/model/board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {DropdownSelector} from '_client/common/ui_components/dropdown';

import React from 'react';
import {loadBoard} from '_client/entrypoints/main/game_board';
import ReactDOM from 'react-dom';
import {Hideable} from '_client/common/ui_components/hideable';

const NEW_BOARD_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const MAIN_BOARD_STUB = 'mainBoard';

const ACTIVE_SELECTOR_STUB = 'activeSelectorStub';
const EDIT_SELECTOR_STUB = 'editSelectorStub';
const EDITING_AREA_STUB = 'editingAreaStub';

const SIDE_PANEL = 'sidePanelContent';

const boardEditRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};

export class EditingArea extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <div style={boardEditRow}>
          <div id="activeSelectorStub"></div>
          <div className="divider"></div>
          <div id="editSelectorStub"></div>
          <div className="divider"></div>
        </div>
        <br />
        <div style={boardEditRow}>
          <button id="createNewBoard" type="button" className="btn btn-primary">
            Create New
          </button>
        </div>

        <div id="createNewBoardFormStub" style={{zIndex: 30}}></div>

        <br />
        <br />

        <div id="editingAreaStub"></div>
      </div>
    );
  }
}

class BoardSelectors {
  constructor(
    private readonly activeSelector: DropdownSelector<string>,
    private readonly editSelector: DropdownSelector<string>
  ) {}

  add(id: string): void {
    this.activeSelector.add(idSelector(id, false));
    this.editSelector.add(idSelector(id, true));
  }
}

export function setupEditorPanel(): Hideable {
  const root = document.createElement('div');
  ReactDOM.render(<EditingArea />, root);

  async function setupSelectors(): Promise<BoardSelectors> {
    const server = await BoardClient.get();
    const boards = server.requestBoardOptions();
    const activeSelector = BoardSelector.createActiveBoardSelector(
      UiUtil.getElementById(ACTIVE_SELECTOR_STUB, root),
      server,
      boards
    );
    const editSelector = BoardSelector.createEditBoardSelector(
      UiUtil.getElementById(EDIT_SELECTOR_STUB, root),
      (selectedId) => {
        loadBoard(selectedId).then((board) => setupEditing(board));
      },
      boards
    );
    return new BoardSelectors(activeSelector, editSelector);
  }

  async function setupEditing(model: BoardModel): Promise<void> {
    UiUtil.removeChildrenOf(MAIN_BOARD_STUB);
    const board = new GameBoard(
      MAIN_BOARD_STUB,
      model,
      await BoardClient.get()
    );
    (await BoardClient.get()).createBoard(model.inner);
    selectors.then((selectors) => selectors.add(model.inner.id));
    UiUtil.removeChildrenOf(EDITING_AREA_STUB, root);
    BoardUpdateForm.create(
      UiUtil.getElementById(EDITING_AREA_STUB, root),
      board.modelHandler,
      (data) => {
        board.updateGridParameters(data);
      }
    );
  }

  const selectors = setupSelectors();
  NewBoardForm.createOnClick(
    UiUtil.getElementById(NEW_BOARD_BUTTON, root),
    UiUtil.getElementById(BOARD_FORM_STUB, root),
    (model) => {
      setupEditing(model);
    }
  );

  const parent = UiUtil.getElementById(SIDE_PANEL);
  return {
    show: () => parent.appendChild(root),
    hide: () => parent.removeChild(root),
  };
}
