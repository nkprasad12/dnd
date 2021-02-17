import { RemoteBoardDiff, RemoteBoardModel } from "/src/game_board/model/remote_board_model";

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {

  constructor(
    private remoteModel: RemoteBoardModel,
    private readonly remoteUpdateListener: (remoteDiff: RemoteBoardDiff) => any) { }

  onLocalUpdate(newRemoteModel: RemoteBoardModel): void {
    let diff = RemoteBoardDiff.computeBetween(newRemoteModel, this.remoteModel);
    if (diff === undefined) {
      return;
    }
    this.remoteModel = newRemoteModel;
    console.log('TODO: Send this diff to the server');
    console.log(diff);
  }

  onRemoteUpdate(remoteDiff: RemoteBoardDiff): void {
    this.remoteModel = this.remoteModel.mergedWith(remoteDiff);
    this.remoteUpdateListener(remoteDiff);
  }
}
