import {Point} from '/src/common/common';

type DragCallback =
    (from: BaseClickData, to: BaseClickData, mouseButton: number) => any;

/** Extracts click data from a mouse event */
function clickData(event: MouseEvent): BaseClickData {
  return {
    clientPoint: {x: event.clientX, y: event.clientY},
    pagePoint: {x: event.pageX, y: event.pageY},
  };
}

export interface BaseClickData {
  readonly clientPoint: Point;
  readonly pagePoint: Point;
}

/** Handles inputs from the user. */
export class InputListener {
  mouseDownPoint?: BaseClickData = undefined;

  constructor(
    private readonly element: HTMLElement,
    private readonly dragCallback: DragCallback) {
    this.element.addEventListener(
        'mousedown',
        (e) => {
          this.handleMouseDown(e);
          e.preventDefault();
          console.log('Got mousedown');
          console.log(e.button);
        });

    this.element.addEventListener(
        'mouseup',
        (e) => {
          this.handleMouseUp(e);
          e.preventDefault();
          console.log('Got mouseup');
          console.log(e.button);
        });

    this.element.addEventListener(
        'contextmenu', (event) => {
          event.preventDefault();
        });
  }

  private handleMouseDown(event: MouseEvent): void {
    this.mouseDownPoint = clickData(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.mouseDownPoint == undefined) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint, clickData(event), event.button);
    this.mouseDownPoint = undefined;
  }
}
