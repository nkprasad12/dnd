import {ModelHandler} from '_client/game_board/controller/model_handler';
import {BoardModel} from '_client/game_board/model/board_model';
import {TokenModel} from '_client/game_board/model/token_model';
import {BoardView} from '_client/game_board/view/board_view';
import {Location, Point} from '_common/coordinates';

export class EntityController {
  static create(modelHandler: ModelHandler, view: BoardView): EntityController {
    return new EntityController(modelHandler, view);
  }

  private constructor(
    private readonly modelHandler: ModelHandler,
    private readonly view: BoardView
  ) {}

  private model(): BoardModel {
    return this.modelHandler.getModel();
  }

  /** Adds a new token to the board. */
  async addNewToken(token: TokenModel): Promise<void> {
    console.log('addNewToken: ' + token.inner.id);
    const model = this.model();
    for (let i = 0; i < model.tokens.length; i++) {
      if (model.tokens[i].inner.id !== token.inner.id) {
        continue;
      }
      return this.modelHandler.applyLocalDiff({tokenDiffs: [token]});
    }
    return this.modelHandler.applyLocalDiff({
      inner: {
        newTokens: [token.inner],
        id: model.inner.id,
      },
    });
  }

  /** Returns the tile for the input client point, relative to the canvas. */
  tileForPoint(clientPoint: Point): Location {
    const model = this.model();
    const rect = this.view.topCanvas.getBoundingClientRect();
    const relativePoint = {
      x: clientPoint.x - rect.left,
      y: clientPoint.y - rect.top,
    };
    const tileSize = model.inner.tileSize;
    let baseX = relativePoint.x / model.scale;
    let baseY = relativePoint.y / model.scale;
    if (model.inner.gridOffset.x > 0) {
      baseX = baseX + tileSize - model.inner.gridOffset.x;
    }
    if (model.inner.gridOffset.y > 0) {
      baseY = baseY + tileSize - model.inner.gridOffset.y;
    }
    return {
      col: Math.floor(baseX / tileSize),
      row: Math.floor(baseY / tileSize),
    };
  }

  /** Returns the index of the active token if present, or undefined. */
  activeTokenIndex(): number | undefined {
    const tokens = this.model().tokens;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.isActive) {
        return i;
      }
    }
    return undefined;
  }

  /**
   * If an item of given size placed on the target tile would
   * collide with an existing token, returns the indices of the
   * tokens that would collide with the item.
   */
  wouldCollide(target: Location, size: number): number[] {
    const result = this.findCollisionsWith(target, size);
    return result.map((collisions) => collisions[0]);
  }

  /**
   * If an item of given size placed on the target tile would
   * collide with an existing token, returns the ids of the
   * tokens that would collide with the item.
   */
  collisionIds(target: Location, size: number): string[] {
    const result = this.findCollisionsWith(target, size);
    return result.map((collisions) => collisions[1].inner.id);
  }

  private findCollisionsWith(
    target: Location,
    size: number
  ): Array<[number, TokenModel]> {
    const model = this.model();
    const results: Array<[number, TokenModel]> = [];
    for (let i = 0; i < model.tokens.length; i++) {
      const token = model.tokens[i];
      const minCol = token.inner.location.col;
      const maxCol = minCol + token.inner.size;
      const minRow = token.inner.location.row;
      const maxRow = minRow + token.inner.size;

      const colsDisjoint = target.col >= maxCol || target.col + size <= minCol;
      const rowsDisjoint = target.row >= maxRow || target.row + size <= minRow;
      if (!colsDisjoint && !rowsDisjoint) {
        results.push([i, token]);
      }
    }
    return results;
  }
}
