import {BoardClient} from '_client/game_board/remote/board_client';
import {RemoteCache} from '_client/game_board/remote/remote_cache';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {ModelHandler} from '_client/game_board/controller/model_handler';

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {
  constructor(
    private readonly server: BoardClient,
    private readonly modelHandler: ModelHandler
  ) {
    this.server.getRemoteUpdates((diff) => {
      this.modelHandler.applyRemoteDiff(diff);
    });
  }

  /** Updates state for a local update. */
  onLocalUpdate(board: BoardModel, diff: BoardDiff): void {
    const update = BoardDiff.extractRemoteDiff(board.inner.id, diff);
    if (update === undefined) {
      return;
    }
    RemoteCache.get().updateTokens(board.inner.tokens);
    this.server.updateBoard(update);
  }
}
