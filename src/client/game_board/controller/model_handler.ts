import {RemoteBoardDiff} from '_client/game_board/model/remote_board_model';
import {RemoteBoard} from '_client/game_board/remote/remote_board';
import {Location, Point} from '_common/coordinates';
import {BoardModel, TokenModel} from '_client/game_board/model/board_model';
import {BoardView} from '_client/game_board/view/board_view';
import {ContextMenu} from '_client/game_board/context_menu/context_menu';

export const INVALID_INDEX: number = -1;

export class ModelHandler {
  constructor(
    readonly view: BoardView,
    private model: BoardModel,
    private readonly remoteBoard: RemoteBoard,
    private readonly menu: ContextMenu,
    private readonly local: boolean) {
    this.view.bind(this.model);
  }

  update(newModel: BoardModel): void {
    this.model = newModel;
    const modelCopy = this.copyModel();
    this.view.bind(modelCopy);
    this.menu.onNewModel(modelCopy);
    if (!this.local) {
      this.remoteBoard.onLocalUpdate(BoardModel.createRemote(this.model));
    }
  }

  async applyRemoteDiff(diff: RemoteBoardDiff): Promise<void> {
    const newModel = await this.model.mergedFrom(diff);
    this.model = newModel;
    console.log('New merged model from remote diff');
    console.log(this.model);
    this.view.bind(this.copyModel());
  }

  copyModel(): BoardModel {
    return this.model.deepCopy();
  }

  tokens(): Array<TokenModel> {
    return this.model.tokens;
  }

  /** Returns the tile for the input client point, relative to the canvas. */
  tileForPoint(clientPoint: Point): Location {
    const rect = this.view.topCanvas.getBoundingClientRect();
    const relativePoint =
      {x: clientPoint.x - rect.left, y: clientPoint.y - rect.top};
    const tileSize = this.model.tileSize;
    let baseX = relativePoint.x / this.model.scale;
    let baseY = relativePoint.y / this.model.scale;
    if (this.model.gridOffset.x > 0) {
      baseX = baseX + tileSize - this.model.gridOffset.x;
    }
    if (this.model.gridOffset.y > 0) {
      baseY = baseY + tileSize - this.model.gridOffset.y;
    }
    return {
      col: Math.floor(baseX / tileSize), row: Math.floor(baseY / tileSize)};
  }

  activeTokenIndex(): number {
    const tokens = this.tokens();
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.isActive) {
        return i;
      }
    }
    return INVALID_INDEX;
  }

  /**
   * If an item of given size placed on the target tile would
   * collide with an existing token, returns the indices of the
   * tokens that would collide with the item.
   */
  wouldCollide(target: Location, size: number): number[] {
    const results: number[] = [];
    for (let i = 0; i < this.model.tokens.length; i++) {
      const token = this.model.tokens[i];
      const minCol = token.location.col;
      const maxCol = minCol + token.size;
      const minRow = token.location.row;
      const maxRow = minRow + token.size;

      const colsDisjoint =
          (target.col >= maxCol) || (target.col + size <= minCol);
      const rowsDisjoint =
          (target.row >= maxRow) || (target.row + size <= minRow);
      if (!colsDisjoint && !rowsDisjoint) {
        results.push(i);
      }
    }
    return results;
  }

  /**
   * If an item of given size placed on the target tile would
   * collide with an existing token, returns the ids of the
   * tokens that would collide with the item.
   */
  collisionIds(target: Location, size: number): string[] {
    const results: string[] = [];
    for (let i = 0; i < this.model.tokens.length; i++) {
      const token = this.model.tokens[i];
      const minCol = token.location.col;
      const maxCol = minCol + token.size;
      const minRow = token.location.row;
      const maxRow = minRow + token.size;

      const colsDisjoint =
          (target.col >= maxCol) || (target.col + size <= minCol);
      const rowsDisjoint =
          (target.row >= maxRow) || (target.row + size <= minRow);
      if (!colsDisjoint && !rowsDisjoint) {
        results.push(token.id);
      }
    }
    return results;
  }
}
