import { BoardModel } from "../model/board_model.js";
import { BoardView } from '../view/board_view.js'
import { InputListener } from './input_listener.js'
import { ModelHandler } from "./model_handler.js";
import { InteractionStateMachine } from "./interaction_state_machine.js";

export class GameController {

  view: BoardView;
  modelHandler: ModelHandler;
  canvasListener: InputListener;
  contextMenuListener: InputListener;
  inputHandler: InteractionStateMachine;

  constructor(model: BoardModel) {
    let canvasHolder = document.getElementById('canvasHolder');
    if (canvasHolder == null) {
      throw 'canvasHolder is null! Can not display board';
    }
    this.view = new BoardView(canvasHolder);
    this.modelHandler = new ModelHandler(this.view, model);
    this.inputHandler = new InteractionStateMachine(this.modelHandler);
    this.canvasListener = new InputListener(
      this.view.topCanvas, 
      (from, to, button) => this.inputHandler.onDragEvent(from, to, button));
    this.contextMenuListener = new InputListener(
      this.view.menu.menu,
      (_from, _to, _button) => this.inputHandler.onContextMenuClick(5));
  }
}
