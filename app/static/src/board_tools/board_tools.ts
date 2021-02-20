import {NewBoardForm} from '/src/board_tools/board_form';
import {GameBoard} from '/src/game_board/controller/game_board';

const NEW_BOARD_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const PREVIEW_BOARD_STUB = 'previewBoardStub';

NewBoardForm.createOnClick(
    NEW_BOARD_BUTTON, BOARD_FORM_STUB,
    (model) => {
      GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
    });
