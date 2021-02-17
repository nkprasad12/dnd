import { Point } from "/src/common/common"

type DragCallback = (from: Point, to: Point, mouseButton: number) => any;

/** Returns the absolute point of a mouse event. */
function mousePoint(event: MouseEvent): Point {
  return { x: event.clientX, y: event.clientY }
}

/** Handles inputs from the user. */
export class InputListener {

  mouseDownPoint?: Point = undefined;

  constructor(
    private readonly element: HTMLElement,
    private readonly dragCallback: DragCallback) {

    this.element.addEventListener(
      'mousedown',
      (e) => { this.handleMouseDown(e); });

    this.element.addEventListener(
      'mouseup',
      (e) => { this.handleMouseUp(e); });

    this.element.addEventListener(
      'contextmenu', (event) => { event.preventDefault(); });
  }

  private handleMouseDown(event: MouseEvent): void {
    this.mouseDownPoint = mousePoint(event);
  }

  private handleMouseUp(event: MouseEvent): void {
    if (this.mouseDownPoint == undefined) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint, mousePoint(event), event.button);
    this.mouseDownPoint = undefined;
  }
}
