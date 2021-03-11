import {BoardModel} from '_client/game_board/model/board_model';
import {BoardView} from '_client/game_board/view/board_view';

import {InputListener} from './input_listener';
import {InteractionStateMachine} from './interaction_state_machine';
import {ModelHandler} from './model_handler';
import {RemoteBoard} from '_client/game_board/remote/remote_board';
import {RemoteBoardModel} from '_common/board/remote_board_model';
import {getElementById} from '_client/common/ui_util';
import {BoardClient} from '_client/game_board/remote/board_client';
import {BoardUpdateData} from '_client/board_tools/board_form';
import {ContextMenu} from '_client/game_board/context_menu/context_menu';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';

export class GameBoard {
  private readonly view: BoardView;
  private readonly modelHandler: ModelHandler;
  readonly canvasListener: InputListener;
  private readonly inputHandler: InteractionStateMachine;
  private readonly remoteBoard: RemoteBoard;

  constructor(parentId: string, model: BoardModel, server: BoardClient) {
    this.view = new BoardView(getElementById(parentId));
    const menu = ContextMenu.create(
      getElementById('rightClickMenuStub'),
      (item) => this.onContextMenuClick(item)
    );
    this.remoteBoard = new RemoteBoard(
      BoardModel.createRemote(model),
      server,
      (remoteDiff) => {
        this.modelHandler.applyRemoteDiff(remoteDiff);
      }
    );
    this.modelHandler = new ModelHandler(
      this.view,
      model,
      this.remoteBoard,
      menu
    );
    this.inputHandler = new InteractionStateMachine(this.modelHandler);
    this.canvasListener = new InputListener(
      this.view.topCanvas,
      (from, to, button) => this.inputHandler.onDragEvent(from, to, button)
    );
  }

  updateGridParameters(options: BoardUpdateData): void {
    const model = this.modelHandler.copyModel();
    model.tileSize = options.tileSize;
    model.gridOffset = options.offset;
    this.modelHandler.update(model);
  }

  private onContextMenuClick(item: ContextMenuItem): void {
    this.inputHandler.onContextMenuClick(item);
  }

  getRemoteModel(): RemoteBoardModel {
    return BoardModel.createRemote(this.modelHandler.copyModel());
  }
}
