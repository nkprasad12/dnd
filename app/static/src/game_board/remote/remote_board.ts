import { RemoteBoardDiff, RemoteBoardModel } from "/src/game_board/model/remote_board_model";
import { Socket_ } from "/src/server/socket_connection";

const UPDATE_EVENT = 'board-update';

/** Represents a remote board state synced with the user's. */
export class RemoteBoard {

  constructor(
    private readonly socket: Socket_,
    private remoteModel: RemoteBoardModel,
    private readonly remoteUpdateListener: (remoteDiff: RemoteBoardDiff) => any) { 
      // TODO: Create a layer wrapping this that checks input / output types for the event.
      this.socket.on(
        UPDATE_EVENT,
        (boardUpdate) => {
          console.log('Got board update');
          console.log(boardUpdate);
          this.onRemoteUpdate(boardUpdate);
        })
    }

  onLocalUpdate(newRemoteModel: RemoteBoardModel): void {
    let diff = RemoteBoardDiff.computeBetween(newRemoteModel, this.remoteModel);
    if (diff === undefined) {
      return;
    }
    this.remoteModel = newRemoteModel;
    this.socket.emit(UPDATE_EVENT, diff);
    console.log('Sent board update');    
    console.log(diff);
  }

  onRemoteUpdate(remoteDiff: RemoteBoardDiff): void {
    this.remoteModel = this.remoteModel.mergedWith(remoteDiff);
    this.remoteUpdateListener(remoteDiff);
  }
}
