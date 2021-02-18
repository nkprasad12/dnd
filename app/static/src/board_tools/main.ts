import {BoardForm} from '/src/board_tools/board_form';
import {GameController} from '/src/game_board/controller/game_controller';
import {LocalConnection} from '/src/server/local_connection';

const CREATE_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';
const PREVIEW_BOARD_STUB = 'previewBoardStub';

BoardForm.createOnClick(
    CREATE_BUTTON, BOARD_FORM_STUB,
    (model) => {
      new GameController(PREVIEW_BOARD_STUB, model, new LocalConnection());
    });

