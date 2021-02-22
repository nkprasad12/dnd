var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NewBoardForm } from '/static/js/board_tools/board_form.js';
import { BoardSelector, removeChildrenOf } from '/static/js/board_tools/board_selector.js';
import { getElementById } from '/static/js/common/common.js';
import { GameBoard } from '/static/js/game_board/controller/game_board.js';
import { BoardModel } from '/static/js/game_board/model/board_model.js';
import { BoardServer } from '/static/js/game_board/remote/board_server.js';
import { connectTo } from '/static/js/server/socket_connection.js';
const NEW_BOARD_BUTTON = 'createNewBoard';
const SAVE_BOARD_BUTTON = 'saveNewBoard';
const BOARD_FORM_STUB = 'createNewBoardFormStub';
const PREVIEW_BOARD_STUB = 'previewBoardStub';
const ACTIVE_SELECTOR_STUB = 'activeSelectorStub';
const EDIT_SELECTOR_STUB = 'editSelectorStub';
const serverPromise = connectTo('board').then((socket) => new BoardServer(socket));
NewBoardForm.createOnClick(NEW_BOARD_BUTTON, BOARD_FORM_STUB, (model) => {
    const board = GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
    const saveButton = getElementById(SAVE_BOARD_BUTTON);
    saveButton.style.display = 'initial';
    saveButton.onclick = () => saveBoard(board.getRemoteModel());
});
function saveBoard(model) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield serverPromise;
        server.createBoard(model);
    });
}
function loadBoard(boardId) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield serverPromise;
        const remoteModel = yield server.requestBoard(boardId);
        const model = yield BoardModel.createFromRemote(remoteModel);
        const board = GameBoard.createLocal(PREVIEW_BOARD_STUB, model);
        const saveButton = getElementById(SAVE_BOARD_BUTTON);
        saveButton.style.display = 'initial';
        saveButton.onclick = () => saveBoard(board.getRemoteModel());
    });
}
function setupSelectors() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield serverPromise;
        BoardSelector.createActiveBoardSelector(ACTIVE_SELECTOR_STUB, server);
        BoardSelector.createEditBoardSelector(EDIT_SELECTOR_STUB, server, (selectedId) => {
            removeChildrenOf(PREVIEW_BOARD_STUB);
            loadBoard(selectedId);
        });
    });
}
setupSelectors();
