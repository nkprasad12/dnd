import {
  RemoteBoardDiff,
  RemoteBoardModel,
} from '_common/board/remote_board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {RemoteCache} from '_client/game_board/remote/remote_cache';
import {BoardModel} from '_client/game_board/model/board_model';

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {
  constructor(
    private remoteModel: RemoteBoardModel,
    private readonly server: BoardClient,
    private readonly onUpdate: (remoteDiff: RemoteBoardDiff) => any
  ) {
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.server.getRemoteUpdates((diff) => {
      this.onRemoteUpdate(diff);
    });
  }

  /** Updates state for a local update. */
  // TODO: Should this take a RemoteBoardModel instead?
  onLocalUpdate(newModel: BoardModel): void {
    const newRemoteModel = BoardModel.createRemote(newModel);
    console.log('Computing remote model diff, new model: ');
    console.log(newRemoteModel);
    const diff = RemoteBoardDiff.computeBetween(
      newRemoteModel,
      this.remoteModel
    );
    if (diff === undefined) {
      return;
    }
    RemoteCache.get().updateTokens(newRemoteModel.tokens);
    this.remoteModel = newRemoteModel;
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.server.updateBoard(diff);
  }

  onRemoteUpdate(remoteDiff: RemoteBoardDiff): void {
    this.remoteModel = RemoteBoardModel.mergedWith(
      this.remoteModel,
      remoteDiff
    );
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.onUpdate(remoteDiff);
  }

  getRemoteModel(): RemoteBoardModel {
    // TODO: Return a copy instead.
    return this.remoteModel;
  }
}
