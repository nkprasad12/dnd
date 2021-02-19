import {BoardModel} from '/src/game_board/model/board_model';
import {BoardView} from '/src/game_board/view/board_view';

import {InputListener} from './input_listener';
import {InteractionStateMachine} from './interaction_state_machine';
import {ModelHandler} from './model_handler';
import {RemoteBoard} from '/src/game_board/remote/remote_board';
import {RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {Socket_} from '/src/server/socket_connection';
import {getElementById} from '/src/common/common';

export class GameController {
  private readonly view: BoardView;
  private readonly modelHandler: ModelHandler;
  readonly canvasListener: InputListener;
  private readonly inputHandler: InteractionStateMachine;
  private readonly remoteBoard: RemoteBoard

  constructor(parentId: string, model: BoardModel, socket: Socket_) {
    this.view = new BoardView(getElementById(parentId));
    this.remoteBoard =
      new RemoteBoard(
          socket,
          RemoteBoardModel.create(model),
          (remoteDiff) => {
            this.modelHandler.applyRemoteDiff(remoteDiff);
          });
    this.modelHandler = new ModelHandler(this.view, model, this.remoteBoard);
    this.inputHandler = new InteractionStateMachine(this.modelHandler);
    this.canvasListener = new InputListener(
        this.view.topCanvas,
        (from, to, button) => this.inputHandler.onDragEvent(from, to, button));
    this.listenForContextMenuClicks();
  }

  // TODO: Refactor how this is done.
  private listenForContextMenuClicks() {
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    const clearFogListener = new InputListener(
        this.view.menu.clearFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on clearFog');
          }
          this.inputHandler.onContextMenuClick(1);
        });
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    const addFogListener = new InputListener(
        this.view.menu.applyFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addFog');
          }
          this.inputHandler.onContextMenuClick(2);
        });

    // @ts-ignore
    // eslint-disable-next-line no-unused-vars
    const addTokenListener = new InputListener(
        this.view.menu.addTokenButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(3);
        });
  }
}
