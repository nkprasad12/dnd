import {BoardForm} from '/src/board_tools/board_form';

const CREATE_BUTTON = 'createNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';

BoardForm.createOnClick(
    CREATE_BUTTON, BOARD_FORM_STUB,
    (model) => {
      console.log(model);
    });

