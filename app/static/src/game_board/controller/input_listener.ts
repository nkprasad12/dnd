import { Point } from "../../common/common.js"
import { Maybe } from "../../utils/maybe.js"

/** Handles inputs from the user. */
export class InputListener {
 
  view: HTMLElement;
  mouseStateMachine: MouseStateMachine;

  constructor(view: HTMLElement, dragCallback: DragCallback) {
    this.view = view;
    this.mouseStateMachine = new MouseStateMachine(view, dragCallback);
    view.addEventListener(
      'contextmenu', (event) => { event.preventDefault(); });
  }
}

type DragCallback = (from: Point, to: Point, mouseButton: number) => any;

/** Returns the absolute point of a mouse event. */
function mousePoint(event: MouseEvent): Point {
  return { x: event.clientX, y: event.clientY }
}

class MouseStateMachine {

  element: HTMLElement;
  dragCallback: DragCallback;

  mouseDownPoint: Maybe<Point>;

  constructor(element: HTMLElement, dragCallback: DragCallback) {
    this.element = element;
    this.dragCallback = dragCallback;
    this.mouseDownPoint = Maybe.absent();

    this.element.addEventListener(
      'mousedown',
      (e) => { this.handleMouseDown(e); });

    this.element.addEventListener(
      'mouseup',
      (e) => { this.handleMouseUp(e); });
  }

  handleMouseDown(event: MouseEvent): void {
    this.mouseDownPoint = Maybe.of(mousePoint(event));
  }

  handleMouseUp(event: MouseEvent): void {
    if (!this.mouseDownPoint.present()) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint.get(), mousePoint(event), event.button);
    this.mouseDownPoint = Maybe.absent();
  }
}