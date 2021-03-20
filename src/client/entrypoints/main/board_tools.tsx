import React from 'react';

export const NEW_BOARD_BUTTON = 'createNewBoard';
export const BOARD_FORM_STUB = 'createNewBoardFormStub';

export const ACTIVE_SELECTOR_STUB = 'activeSelectorStub';
export const EDIT_SELECTOR_STUB = 'editSelectorStub';
export const EDITING_AREA_STUB = 'editingAreaStub';

const boardEditRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
};

export function EditingArea(): JSX.Element {
  return (
    <div>
      <div style={boardEditRow}>
        <div id={ACTIVE_SELECTOR_STUB}></div>
        <div className="divider"></div>
        <div id={EDIT_SELECTOR_STUB}></div>
        <div className="divider"></div>
      </div>
      <br />
      <div style={boardEditRow}>
        <button id={NEW_BOARD_BUTTON} type="button" className="btn btn-primary">
          Create New
        </button>
      </div>

      <div id={BOARD_FORM_STUB} style={{zIndex: 30}}></div>

      <br />
      <br />

      <div id={EDITING_AREA_STUB}></div>
    </div>
  );
}
