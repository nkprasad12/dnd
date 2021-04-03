import {BoardModel} from '_client/game_board/model/board_model';
import {BoardView} from '_client/game_board/view/board_view';

import {InputListener} from './input_listener';
import {InteractionStateMachine} from './interaction_state_machine';
import {ModelHandler, UpdateListener} from './model_handler';
import {RemoteBoard} from '_client/game_board/remote/remote_board';
import {getElementById, removeChildrenOf} from '_client/common/ui_util';
import {BoardClient} from '_client/game_board/remote/board_client';
import {BoardUpdateData} from '_client/board_tools/board_form';
import {ContextMenu} from '_client/game_board/context_menu/context_menu';
import {ContextMenuItem} from '_client/game_board/context_menu/context_menu_model';
import {ChatClient} from '_client/chat_box/chat_client';
import {UiController} from '_client/entrypoints/main/ui_controller';

export const RIGHT_CLICK_MENU_STUB = 'rightClickMenuStub';

export class GameBoard {
  static existingBoard: GameBoard | null = null;
  static create(
    parentId: string,
    model: BoardModel,
    server: BoardClient,
    chatClient: ChatClient,
    controller: UiController
  ) {
    if (GameBoard.existingBoard !== null) {
      removeChildrenOf(parentId);
      removeChildrenOf(RIGHT_CLICK_MENU_STUB);
      server.removeAllListeners();
    }
    GameBoard.existingBoard = new GameBoard(
      parentId,
      model,
      server,
      chatClient,
      controller
    );
    return GameBoard.existingBoard;
  }

  private readonly view: BoardView;
  readonly modelHandler: ModelHandler;
  readonly canvasListener: InputListener;
  private readonly inputHandler: InteractionStateMachine;

  private constructor(
    parentId: string,
    model: BoardModel,
    server: BoardClient,
    chatClient: ChatClient,
    controller: UiController
  ) {
    this.view = new BoardView(getElementById(parentId));
    const menu = ContextMenu.create(
      getElementById(RIGHT_CLICK_MENU_STUB),
      (item) => this.onContextMenuClick(item)
    );
    this.modelHandler = new ModelHandler(model, this.view);
    const remoteBoard = new RemoteBoard(server, this.modelHandler);
    this.modelHandler.addListeners([
      UpdateListener.forAll((board) => this.view.bind(board)),
      UpdateListener.forLocal((board) => menu.onNewModel(board)),
      UpdateListener.forLocal((board, diff) =>
        remoteBoard.onLocalUpdate(board, diff)
      ),
    ]);
    this.inputHandler = new InteractionStateMachine({
      modelHandler: this.modelHandler,
      chatClient: chatClient,
      controller: controller,
    });
    this.canvasListener = new InputListener(
      this.view.topCanvas,
      (from, to, button) => this.inputHandler.onDragEvent(from, to, button)
    );
  }

  updateGridParameters(options: BoardUpdateData): void {
    const model = this.modelHandler.getModel().inner;
    this.modelHandler.applyLocalDiff({
      inner: {
        tileSize: options.tileSize,
        gridOffset: options.offset,
        rows: options.rows,
        cols: options.cols,
        id: model.id,
      },
    });
  }

  private onContextMenuClick(item: ContextMenuItem): void {
    this.inputHandler.onContextMenuClick(item);
  }
}
