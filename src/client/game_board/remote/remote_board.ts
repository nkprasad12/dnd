import {RemoteBoardDiff, RemoteBoardModel} from '_client/game_board/model/remote_board_model';
import {BoardServer} from '_client/game_board/remote/board_server';

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {
  constructor(
    private remoteModel: RemoteBoardModel,
    private readonly server: BoardServer,
    private readonly onUpdate: (remoteDiff: RemoteBoardDiff) => any) {
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.server.getRemoteUpdates((diff) => {
      this.onRemoteUpdate(diff);
    });
  }

  onLocalUpdate(newRemoteModel: RemoteBoardModel): void {
    console.log('Computing remote model diff, new model: ');
    console.log(newRemoteModel);
    const diff =
        RemoteBoardDiff.computeBetween(newRemoteModel, this.remoteModel);
    if (diff === undefined) {
      return;
    }
    this.remoteModel = newRemoteModel;
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.server.updateBoard(diff);
  }

  onRemoteUpdate(remoteDiff: RemoteBoardDiff): void {
    this.remoteModel =
        RemoteBoardModel.mergedWith(this.remoteModel, remoteDiff);
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.onUpdate(remoteDiff);
  }

  getRemoteModel(): RemoteBoardModel {
    // TODO: Return a copy instead.
    return this.remoteModel;
  }
}
