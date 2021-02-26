import {RemoteBoardDiff, RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {RemoteBoard} from '/src/game_board/remote/remote_board';
import {Location, areLocationsEqual, Point} from '/src/common/common';
import {BoardModel, TokenModel} from '/src/game_board/model/board_model';
import {BoardView} from '/src/game_board/view/board_view';

export const INVALID_INDEX: number = -1;

export class ModelHandler {
  constructor(
    readonly view: BoardView,
    private model: BoardModel,
    private readonly remoteBoard: RemoteBoard,
    private readonly local: boolean) {
    this.view.bind(this.model);
  }

  update(newModel: BoardModel): void {
    this.model = newModel;
    this.view.bind(this.copyModel());
    if (!this.local) {
      this.remoteBoard.onLocalUpdate(RemoteBoardModel.create(this.model));
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
    let baseX = relativePoint.x;
    let baseY = relativePoint.y;
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

  tokenIndexOfTile(tile: Location): number {
    const tokens = this.tokens();
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (areLocationsEqual(token.location, tile)) {
        return i;
      }
    }
    return INVALID_INDEX;
  }
}
