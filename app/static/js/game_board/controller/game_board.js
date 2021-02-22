import { BoardView } from '/static/js/game_board/view/board_view.js';
import { InputListener } from './input_listener.js';
import { InteractionStateMachine } from './interaction_state_machine.js';
import { ModelHandler } from './model_handler.js';
import { RemoteBoard } from '/static/js/game_board/remote/remote_board.js';
import { RemoteBoardModel } from '/static/js/game_board/model/remote_board_model.js';
import { getElementById } from '/static/js/common/common.js';
import { BoardServer } from '/static/js/game_board/remote/board_server.js';
import { LocalConnection } from '/static/js/server/local_connection.js';
export class GameBoard {
    constructor(parentId, model, server) {
        this.view = new BoardView(getElementById(parentId));
        this.remoteBoard =
            new RemoteBoard(RemoteBoardModel.create(model), server, (remoteDiff) => {
                this.modelHandler.applyRemoteDiff(remoteDiff);
            });
        this.modelHandler = new ModelHandler(this.view, model, this.remoteBoard);
        this.inputHandler = new InteractionStateMachine(this.modelHandler);
        this.canvasListener = new InputListener(this.view.topCanvas, (from, to, button) => this.inputHandler.onDragEvent(from, to, button));
        this.listenForContextMenuClicks();
    }
    static createLocal(parentId, model) {
        return new GameBoard(parentId, model, new BoardServer(new LocalConnection()));
    }
    // TODO: Refactor how this is done.
    listenForContextMenuClicks() {
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        const clearFogListener = new InputListener(this.view.menu.clearFogButton, (_from, _to, button) => {
            if (button != 0) {
                console.log('Ignoring non-left click on clearFog');
            }
            this.inputHandler.onContextMenuClick(1);
        });
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        const addFogListener = new InputListener(this.view.menu.applyFogButton, (_from, _to, button) => {
            if (button != 0) {
                console.log('Ignoring non-left click on addFog');
            }
            this.inputHandler.onContextMenuClick(2);
        });
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        const addTokenListener = new InputListener(this.view.menu.addTokenButton, (_from, _to, button) => {
            if (button != 0) {
                console.log('Ignoring non-left click on addToken');
            }
            this.inputHandler.onContextMenuClick(3);
        });
    }
    getRemoteModel() {
        return this.remoteBoard.getRemoteModel();
    }
}
