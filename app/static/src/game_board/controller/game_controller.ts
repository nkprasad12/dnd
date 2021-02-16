import { BoardModel } from "/src/game_board/model/board_model";
import { BoardView } from '/src/game_board/view/board_view'

import { InputListener } from './input_listener'
import { InteractionStateMachine } from "./interaction_state_machine";
import { ModelHandler } from "./model_handler";

export class GameController {

  view: BoardView;
  modelHandler: ModelHandler;
  canvasListener: InputListener;
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
    this.listenForContextMenuClicks();
  }

  // TODO: Refactor how this is done.
  listenForContextMenuClicks() {
    // @ts-ignore
    let clearFogListener = new InputListener(
      this.view.menu.clearFogButton,
      (_from, _to, button) => {
        if (button != 0) {
          console.log('Ignoring non-left click on clearFog');
        }
        this.inputHandler.onContextMenuClick(1);
      });
    // @ts-ignore
    let addFogListener = new InputListener(
      this.view.menu.applyFogButton,
      (_from, _to, button) => {
        if (button != 0) {
          console.log('Ignoring non-left click on addFog');
        }
        this.inputHandler.onContextMenuClick(2);
      });
  }
}
