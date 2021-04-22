import {RemoteBoardDiff} from '_common/board/remote_board_model';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';

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

  constructor(private model: BoardModel) {}

  addListeners(listeners: UpdateListener[]): void {
    listeners.forEach((listener) => {
      this.listeners.push(listener);
      listener.listener(this.model, {});
    });
  }

  clearListeners(): void {
    while (this.listeners.length > 0) {
      this.listeners.pop();
    }
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

  async applyRemoteDiff(remoteDiff: RemoteBoardDiff): Promise<void> {
    const diff = BoardDiff.fromRemoteDiff(remoteDiff);
    console.log('applyRemoteDiff transformed diff:');
    console.log(diff);

    const newModel = await this.model.mergedWith(diff);
    this.model = newModel;
    this.listeners
      .filter((listener) => listener.updateOnRemote === true)
      .forEach((listener) => listener.listener(this.model, diff));
  }
}
