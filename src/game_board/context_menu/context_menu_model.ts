import {Point, copyPoint} from '/src/common/common';

/** Data model for a context menu on the game board. */

export class ContextMenuModel {
  constructor(
    public clickPoint: Point,
    public isVisible: boolean) { }

  deepCopy(): ContextMenuModel {
    return new ContextMenuModel(
        copyPoint(this.clickPoint),
        this.isVisible,
    );
  }
}
