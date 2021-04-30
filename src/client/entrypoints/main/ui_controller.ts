import {BoardModel} from '_client/game_board/model/board_model';
import {TokenModel} from '_client/game_board/model/token_model';
import {Location} from '_common/coordinates';

export interface UiController {
  createNewTokenForm: (tile: Location) => any;
  editTokenForm: (token: TokenModel) => any;
  setBoard: (board: BoardModel) => any;
}

export namespace UiController {
  export function create(
    setNewTokenTile: (tile: Location) => any,
    setNewTokenVisibility: (visible: boolean) => any,
    setBoard: (model: BoardModel) => any,
    setEditTokenVisibility: (visible: boolean) => any,
    setEditTokenFormModel: (token: TokenModel) => any
  ): UiController {
    return {
      createNewTokenForm: (tile: Location) => {
        setNewTokenTile(tile);
        setNewTokenVisibility(true);
      },
      setBoard: setBoard,
      editTokenForm: (token) => {
        setEditTokenFormModel(token);
        setEditTokenVisibility(true);
      },
    };
  }
}
