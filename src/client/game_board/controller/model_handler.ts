import {RemoteBoardDiff} from '_common/board/remote_board_model';
import {Location, Point} from '_common/coordinates';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {BoardView} from '_client/game_board/view/board_view';

export const INVALID_INDEX: number = -1;

export type BoardDiffListener = (model: BoardModel, diff: BoardDiff) => any;

export interface UpdateListener {
  listener: BoardDiffListener;
  updateOnLocal: boolean;
  updateOnRemote: boolean;
}

export namespace UpdateListener {
  /**
   * Creates a listener that will be notified on changes triggered by local
   * actions, but not from remote actions.
   */
  export function forLocal(listener: BoardDiffListener) {
    return {
      listener: listener,
      updateOnLocal: true,
      updateOnRemote: false,
    };
  }

  /**
   * Creates a listener that will be notified on changes triggered by local
   * actions and remote actions.
   */
  export function forAll(listener: BoardDiffListener) {
    return {
      listener: listener,
      updateOnLocal: true,
      updateOnRemote: true,
    };
  }
}

export class ModelHandler {
  private readonly listeners: UpdateListener[] = [];

  constructor(
    private model: BoardModel,
    // TODO: Remove this once we figure out where to put tileForPoint.
    private readonly view: BoardView
  ) {}

  addListeners(listeners: UpdateListener[]): void {
    listeners.forEach((listener) => {
      this.listeners.push(listener);
      listener.listener(this.model, {});
    });
  }

  getModel(): BoardModel {
    return this.model;
  }

  async applyLocalDiff(diff: BoardDiff): Promise<void> {
    console.log('applyLocalDiff');
    console.log(diff);
    this.model = await this.model.mergedWith(diff);
    this.listeners
      .filter((listener) => listener.updateOnLocal === true)
      .forEach((listener) => listener.listener(this.model, diff));
  }

  async applyRemoteDiff(diff: RemoteBoardDiff): Promise<void> {
    console.log('applyRemoteDiff');
    console.log(diff);
    const newModel = await this.model.mergedWith({inner: diff});
    this.model = newModel;
    this.listeners
      .filter((listener) => listener.updateOnRemote === true)
      .forEach((listener) => listener.listener(this.model, {inner: diff}));
  }

  /** Returns the tile for the input client point, relative to the canvas. */
  // TODO: Move this somewhere else. Maybe to inputListener?
  tileForPoint(clientPoint: Point): Location {
    const rect = this.view.topCanvas.getBoundingClientRect();
    const relativePoint = {
      x: clientPoint.x - rect.left,
      y: clientPoint.y - rect.top,
    };
    const tileSize = this.model.inner.tileSize;
    let baseX = relativePoint.x / this.model.scale;
    let baseY = relativePoint.y / this.model.scale;
    if (this.model.inner.gridOffset.x > 0) {
      baseX = baseX + tileSize - this.model.inner.gridOffset.x;
    }
    if (this.model.inner.gridOffset.y > 0) {
      baseY = baseY + tileSize - this.model.inner.gridOffset.y;
    }
    return {
      col: Math.floor(baseX / tileSize),
      row: Math.floor(baseY / tileSize),
    };
  }

  activeTokenIndex(): number | undefined {
    const tokens = this.model.tokens;
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
    const results: number[] = [];
    for (let i = 0; i < this.model.tokens.length; i++) {
      const token = this.model.tokens[i];
      const minCol = token.inner.location.col;
      const maxCol = minCol + token.inner.size;
      const minRow = token.inner.location.row;
      const maxRow = minRow + token.inner.size;

      const colsDisjoint = target.col >= maxCol || target.col + size <= minCol;
      const rowsDisjoint = target.row >= maxRow || target.row + size <= minRow;
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
      const minCol = token.inner.location.col;
      const maxCol = minCol + token.inner.size;
      const minRow = token.inner.location.row;
      const maxRow = minRow + token.inner.size;

      const colsDisjoint = target.col >= maxCol || target.col + size <= minCol;
      const rowsDisjoint = target.row >= maxRow || target.row + size <= minRow;
      if (!colsDisjoint && !rowsDisjoint) {
        results.push(token.inner.id);
      }
    }
    return results;
  }
}
