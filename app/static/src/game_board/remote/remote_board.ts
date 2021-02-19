import {RemoteBoardDiff, RemoteBoardModel} from '/src/game_board/model/remote_board_model';
import {Socket_} from '/src/server/socket_connection';

const UPDATE_EVENT = 'board-update';

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {
  constructor(
    private readonly socket: Socket_,
    private remoteModel: RemoteBoardModel,
    private readonly remoteUpdateListener:
        (remoteDiff: RemoteBoardDiff) => any) {
    // TODO: Create a layer wrapping this that checks
    // input / output types for the event.
    this.socket.on(
        UPDATE_EVENT,
        (boardUpdate) => {
          this.onRemoteUpdate(boardUpdate);
        });
    console.log('Updated remote model');
    console.log(this.remoteModel);
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
    this.socket.emit(UPDATE_EVENT, diff);
  }

  onRemoteUpdate(remoteDiff: RemoteBoardDiff): void {
    this.remoteModel =
        RemoteBoardModel.mergedWith(this.remoteModel, remoteDiff);
    console.log('Updated remote model');
    console.log(this.remoteModel);
    this.remoteUpdateListener(remoteDiff);
  }
}
