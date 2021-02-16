import { BoardModel, TokenModel } from "../model/board_model.js";
import { BoardView } from '../view/board_view.js';
import { Location, areLocationsEqual } from "../../common/common.js"

export const INVALID_INDEX: number = -1;

export class ModelHandler {

  view: BoardView;
  model: BoardModel;

  constructor(view: BoardView, model: BoardModel) {
    this.view = view;
    this.model = model;
    this.view.bind(this.model);
  }

  update(newModel: BoardModel): void {
    this.model = newModel;
    this.view.bind(this.copyModel());
  }

  copyModel(): BoardModel {
    return this.model.deepCopy();
  }

  tokens(): Array<TokenModel> {
    return this.model.tokens;
  }

  tileSize(): number {
    return this.model.tileSize;
  }

  activeTokenIndex(): number {
    let tokens = this.tokens();
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token.isActive) {
        return i;
      }
    }
    return INVALID_INDEX;
  }

  tokenIndexOfTile(tile: Location): number {
    let tokens = this.tokens();
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (areLocationsEqual(token.location, tile)) {
        return i;
      }
    }
    return INVALID_INDEX;
  }
}
