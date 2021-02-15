import { BoardView } from '../view/board_view.js'
import { Point } from "../../common/common.js"
import { Maybe } from "../../utils/maybe.js"

/** Handles inputs from the user. */
export class InputListener {
 
  view: BoardView;
  mouseStateMachine: MouseStateMachine;

  constructor(view: BoardView, dragCallback: DragCallback, contextCallback: ContextCallback) {
    this.view = view;
    this.mouseStateMachine = new MouseStateMachine(view.topCanvas, dragCallback);
    view.topCanvas.addEventListener(
      'contextmenu',
      (event) => {
        event.preventDefault();
        const clickPoint = mousePoint(event);
        contextCallback(clickPoint);
      }
    );
  }
}

type ContextCallback = (clickPoint: Point) => any;

type DragCallback = (from: Point, to: Point) => any;

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
    if (event.button != 0) {
      return;
    }
    this.mouseDownPoint = Maybe.of(mousePoint(event));
  }

  handleMouseUp(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }
    if (!this.mouseDownPoint.present()) {
      console.log('Got mouseup event without mousedown - ignoring.');
      return;
    }
    this.dragCallback(this.mouseDownPoint.get(), mousePoint(event));
    this.mouseDownPoint = Maybe.absent();
  }
}