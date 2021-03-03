import {Point} from '_common/coordinates';

export enum ContextMenuItem {
  ClearFog = 'Clear Fog',
  AddFog = 'Add Fog',
  PeekFog = 'Peek Fog',
  UnpeekFog = 'Un-peek Fog',
  ClearHighlight = 'Clear Highlight',
  OrangeHighlight = 'Highlight Orange',
  BlueHighlight = 'Highlight Blue',
  AddToken = 'Add Token',
  EditToken = 'Edit Token',
  CopyToken = 'Copy Token',
  ZoomIn = 'Zoom In',
  ZoomOut = 'Zoom Out'
}

/** Data model for a context menu on the game board. */
export class ContextMenuModel {
  constructor(
    public clickPoint: Point,
    public isVisible: boolean) { }

  deepCopy(): ContextMenuModel {
    return new ContextMenuModel(this.clickPoint, this.isVisible);
  }
}
