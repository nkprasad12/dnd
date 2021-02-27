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
import {ContextMenu} from '/src/game_board/context_menu/context_menu';
import {ContextMenuItem} from '/src/game_board/context_menu/context_menu_model';

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
    const menu = new ContextMenu(
        getElementById('rightClickMenuStub'),
        (item) => this.onContextMenuClick(item));
    this.remoteBoard =
      new RemoteBoard(
          RemoteBoardModel.create(model),
          server,
          (remoteDiff) => {
            this.modelHandler.applyRemoteDiff(remoteDiff);
          });
    this.modelHandler =
        new ModelHandler(this.view, model, this.remoteBoard, menu, this.local);
    this.inputHandler = new InteractionStateMachine(this.modelHandler);
    this.canvasListener = new InputListener(
        this.view.topCanvas,
        (from, to, button) => this.inputHandler.onDragEvent(from, to, button));
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

  private onContextMenuClick(item: ContextMenuItem): void {
    this.inputHandler.onContextMenuClick(item);
  }

  getRemoteModel(): RemoteBoardModel {
    return RemoteBoardModel.create(this.modelHandler.copyModel());
  }
}
