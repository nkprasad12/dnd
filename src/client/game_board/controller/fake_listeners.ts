/* istanbul ignore file */

import {UpdateListener} from '_client/game_board/controller/model_handler';

// TODO: Replace these with jest.fn mocks

/** Fake listener that updates on local state changes. */
export class FakeLocalListener {
  updatedModel: any = undefined;
  lastDiff: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forLocal((update, diff) => {
      this.updatedModel = update;
      this.lastDiff = diff;
    });
  }
}

/** Fake listener that updates on all state changes. */
export class FakeAllListener {
  updatedModel: any = undefined;
  lastDiff: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forAll((update, diff) => {
      this.updatedModel = update;
      this.lastDiff = diff;
    });
  }
}
