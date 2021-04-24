import {BoardModel} from '_client/game_board/model/board_model';
import {BoardView} from '_client/game_board/view/board_view';

import {InputListener} from './click_listener';
import {InteractionStateMachine} from './interaction_state_machine';
import {ModelHandler, UpdateListener} from './model_handler';
import {RemoteBoard} from '_client/game_board/remote/remote_board';
import {BoardClient} from '_client/game_board/remote/board_client';
import {ContextMenuAction} from '_client/game_board/context_menu/context_menu_model';
import {ChatClient} from '_client/chat_box/chat_client';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {BoardUpdateData} from '_client/board_tools/board_update_form';
import {EntityController} from '_client/game_board/controller/entity_controller';

export class GameBoard {
  static existingBoard: GameBoard | null = null;
  static create(
    view: BoardView,
    model: BoardModel,
    server: BoardClient,
    chatClient: ChatClient,
    controller: UiController
  ) {
    if (GameBoard.existingBoard !== null) {
      GameBoard.existingBoard.modelHandler.clearListeners();
      server.removeAllListeners();
    }
    GameBoard.existingBoard = new GameBoard(
      view,
      model,
      server,
      chatClient,
      controller
    );
    return GameBoard.existingBoard;
  }

  readonly modelHandler: ModelHandler;
  readonly canvasListener: InputListener;
  readonly entityController: EntityController;
  private readonly inputHandler: InteractionStateMachine;

  private constructor(
    private readonly view: BoardView,
    model: BoardModel,
    server: BoardClient,
    chatClient: ChatClient,
    controller: UiController
  ) {
    this.modelHandler = new ModelHandler(model);
    this.entityController = EntityController.create(
      this.modelHandler,
      this.view
    );
    const remoteBoard = new RemoteBoard(server, this.modelHandler);
    this.modelHandler.addListeners([
      UpdateListener.forAll((board) => this.view.bind(board)),
      UpdateListener.forLocal((board, diff) =>
        remoteBoard.onLocalUpdate(board, diff)
      ),
    ]);
    this.inputHandler = new InteractionStateMachine({
      modelHandler: this.modelHandler,
      chatClient: chatClient,
      entityController: this.entityController,
      controller: controller,
    });
    this.canvasListener = new InputListener(
      this.view.topCanvas,
      (from, to, button) => this.inputHandler.onDragEvent(from, to, button),
      (hoverPoint) => this.inputHandler.onMouseMove(hoverPoint)
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

  onContextMenuClick(item: ContextMenuAction): void {
    this.inputHandler.onContextMenuClick(item);
  }
}
