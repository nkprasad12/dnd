import {Point} from '_common/coordinates';

export enum ContextMenuItem {
  ClearFog = 'Clear Fog',
  AddFog = 'Add Fog',
  PeekFog = 'Peek Fog',
  UnpeekFog = 'Un-peek Fog',
  ClearHighlight = 'Clear Highlight',
  OrangeHighlight = 'Highlight Orange',
  BlueHighlight = 'Highlight Blue',
  GreenHighlight = 'Highlight Green',
  AddToken = 'Add Token',
  EditToken = 'Edit Token',
  CopyToken = 'Copy Token',
  ZoomIn = 'Zoom In',
  ZoomOut = 'Zoom Out',
}

/** Data model for a context menu on the game board. */
export interface ContextMenuModel {
  readonly clickPoint: Point;
  readonly isVisible: boolean;
}
