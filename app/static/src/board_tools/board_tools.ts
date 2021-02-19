import {NewBoardForm} from '/src/board_tools/board_form';
import {GameController} from '/src/game_board/controller/game_controller';
import {LocalConnection} from '/src/server/local_connection';

const NEW_BOARD_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

const PREVIEW_BOARD_STUB = 'previewBoardStub';

NewBoardForm.createOnClick(
    NEW_BOARD_BUTTON, BOARD_FORM_STUB,
    (model) => {
      new GameController(PREVIEW_BOARD_STUB, model, new LocalConnection());
    });
