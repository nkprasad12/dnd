import { RemoteBoardDiff, RemoteBoardModel } from '/static/js/game_board/model/remote_board_model.js';
/** Represents a remote board state synced with the user's. */
export class RemoteBoard {
    constructor(remoteModel, server, onUpdate) {
        this.remoteModel = remoteModel;
        this.server = server;
        this.onUpdate = onUpdate;
        console.log('Updated remote model');
        console.log(this.remoteModel);
        this.server.getRemoteUpdates((diff) => {
            this.onRemoteUpdate(diff);
        });
    }
    onLocalUpdate(newRemoteModel) {
        console.log('Computing remote model diff, new model: ');
        console.log(newRemoteModel);
        const diff = RemoteBoardDiff.computeBetween(newRemoteModel, this.remoteModel);
        if (diff === undefined) {
            return;
        }
        this.remoteModel = newRemoteModel;
        console.log('Updated remote model');
        console.log(this.remoteModel);
        this.server.updateBoard(diff);
    }
    onRemoteUpdate(remoteDiff) {
        this.remoteModel =
            RemoteBoardModel.mergedWith(this.remoteModel, remoteDiff);
        console.log('Updated remote model');
        console.log(this.remoteModel);
        this.onUpdate(remoteDiff);
    }
    getRemoteModel() {
        // TODO: Return a copy instead.
        return this.remoteModel;
    }
}
