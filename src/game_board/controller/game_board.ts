import {BoardModel} from '/src/game_board/model/board_model';
import {BoardView} from '/src/game_board/view/board_view';

import {InputListener} from './input_listener';
import {InteractionStateMachine} from './interaction_state_machine';
import {ModelHandler} from './model_handler';
import {RemoteBoard} from '/src/game_board/remote/remote_board';
import {RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {getElementById} from '/src/common/common';
import {BoardServer} from '/src/game_board/remote/board_server';
import {LocalConnection} from '/src/server/local_connection';
import {BoardUpdateData} from '/src/board_tools/board_form';

export class GameBoard {
  static createLocal(parentId: string, model: BoardModel): GameBoard {
    return new GameBoard(
        parentId, model, new BoardServer(new LocalConnection()), true);
  }

  private readonly view: BoardView;
  private readonly modelHandler: ModelHandler;
  readonly canvasListener: InputListener;
  private readonly inputHandler: InteractionStateMachine;
  private readonly remoteBoard: RemoteBoard

  constructor(
      parentId: string,
      model: BoardModel,
      server: BoardServer,
      private readonly local: boolean = false) {
    this.view = new BoardView(getElementById(parentId));
    this.remoteBoard =
      new RemoteBoard(
          RemoteBoardModel.create(model),
          server,
          (remoteDiff) => {
            this.modelHandler.applyRemoteDiff(remoteDiff);
          });
    this.modelHandler =
        new ModelHandler(this.view, model, this.remoteBoard, this.local);
    this.inputHandler = new InteractionStateMachine(this.modelHandler);
    this.canvasListener = new InputListener(
        this.view.topCanvas,
        (from, to, button) => this.inputHandler.onDragEvent(from, to, button));
    this.listenForContextMenuClicks();
  }

  updateForEditor(options: BoardUpdateData): void {
    if (!this.local) {
      console.log('Attempting updateForEditor in non-local board, ignoring');
    }
    const model = this.modelHandler.copyModel();
    model.tileSize = options.tileSize;
    model.gridOffset = options.offset;
    this.modelHandler.update(model);
  }

  // TODO: Refactor how this is done.
  private listenForContextMenuClicks(): void {
    new InputListener(
        this.view.menu.clearFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on clearFog');
          }
          this.inputHandler.onContextMenuClick(1);
        });

    new InputListener(
        this.view.menu.applyFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addFog');
          }
          this.inputHandler.onContextMenuClick(2);
        });

    new InputListener(
        this.view.menu.addTokenButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(3);
        });

    new InputListener(
        this.view.menu.peekFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(4);
        });

    new InputListener(
        this.view.menu.unpeekFogButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(5);
        });

    new InputListener(
        this.view.menu.clearHighlightButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(6);
        });

    new InputListener(
        this.view.menu.blueHighlightButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(7);
        });
    new InputListener(
        this.view.menu.orangeHighlightButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(8);
        });
    new InputListener(
        this.view.menu.editTokenButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(9);
        });
    new InputListener(
        this.view.menu.copyTokenButton,
        (_from, _to, button) => {
          if (button != 0) {
            console.log('Ignoring non-left click on addToken');
          }
          this.inputHandler.onContextMenuClick(10);
        });
  }

  getRemoteModel(): RemoteBoardModel {
    return RemoteBoardModel.create(this.modelHandler.copyModel());
  }
}
