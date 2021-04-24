import {Point} from '_common/coordinates';

export type DragCallback = (
  from: BaseClickData,
  to: BaseClickData,
  mouseButton: number
) => any;

const MOUSE_MOVE_DISTANCE = 5;

/** Extracts click data from a mouse event */
function clickData(event: MouseEvent): BaseClickData {
  return {
    clientPoint: {x: event.clientX, y: event.clientY},
    pagePoint: {x: event.offsetX, y: event.offsetY},
  };
}

export interface BaseClickData {
  readonly clientPoint: Point;
  readonly pagePoint: Point;
}

/** Handles inputs from the user. */
export class InputListener {
  mouseDownPoint?: BaseClickData = undefined;
  lastMouseMovePoint: Point = {x: 0, y: 0};

  constructor(
    private readonly element: HTMLElement,
    private readonly dragCallback: DragCallback,
    private readonly onMouseMove: (clientPoint: Point) => any
  ) {
    this.element.onmousedown = (event) => {
      this.handleMouseDown(event);
      event.preventDefault();
      return false;
    };

    this.element.onmouseup = (event) => {
      this.handleMouseUp(event);
      event.preventDefault();
      return false;
    };

    this.element.onmousemove = (event) => {
      const xChanged =
        Math.abs(this.lastMouseMovePoint.x - event.clientX) >
        MOUSE_MOVE_DISTANCE;
      const yChanged =
        Math.abs(this.lastMouseMovePoint.y - event.clientY) >
        MOUSE_MOVE_DISTANCE;
      if (xChanged || yChanged) {
        this.lastMouseMovePoint = {x: event.clientX, y: event.clientY};
        this.onMouseMove(this.lastMouseMovePoint);
      }
    };

    this.element.oncontextmenu = (event) => {
      event.preventDefault();
      return false;
    };
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
