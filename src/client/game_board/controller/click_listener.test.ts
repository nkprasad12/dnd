import {
  BaseClickData,
  DragCallback,
  InputListener,
} from '_client/game_board/controller/click_listener';
import {Point} from '_common/coordinates';

class FakeCallback {
  from?: BaseClickData;
  to?: BaseClickData;
  mouseButton?: number;

  dragCallback(): DragCallback {
    return (from, to, mouseButton) => {
      this.from = from;
      this.to = to;
      this.mouseButton = mouseButton;
    };
  }
}

function mouseEvent(clientPoint: Point, offsetPoint: Point): any {
  return {
    clientX: clientPoint.x,
    clientY: clientPoint.y,
    offsetX: offsetPoint.x,
    offsetY: offsetPoint.y,
    preventDefault: () => {},
  };
}

const FIRST_CLIENT_POINT: Point = {x: 57, y: 5757};
const FIRST_OFFSET_POINT: Point = {x: 157, y: 5857};
const SECOND_CLIENT_POINT: Point = {x: 42, y: 4242};
const SECOND_OFFSET_POINT: Point = {x: 142, y: 4342};

test('InputListener on mousedown only does not fire callback', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);

  element.onmousedown(event);

  expect(callback.from).toBeUndefined();
  expect(callback.to).toBeUndefined();
  expect(callback.mouseButton).toBeUndefined();
});

test('InputListener on mousedown suppresses default', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);

  expect(element.onmousedown(event)).toBe(false);
});

test('InputListener on mouseup only does not fire callback', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const event = mouseEvent(SECOND_CLIENT_POINT, SECOND_OFFSET_POINT);

  element.onmouseup(event);

  expect(callback.from).toBeUndefined();
  expect(callback.to).toBeUndefined();
  expect(callback.mouseButton).toBeUndefined();
});

test('InputListener on mouseup suppresses default', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);

  expect(element.onmouseup(event)).toBe(false);
});

test('InputListener on click fires callback', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const downEvent = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);
  downEvent.button = 1;
  const upEvent = mouseEvent(SECOND_CLIENT_POINT, SECOND_OFFSET_POINT);
  upEvent.button = 2;

  element.onmousedown(downEvent);
  element.onmouseup(upEvent);

  expect(callback.from?.clientPoint).toEqual(FIRST_CLIENT_POINT);
  expect(callback.from?.pagePoint).toEqual(FIRST_OFFSET_POINT);
  expect(callback.to?.clientPoint).toEqual(SECOND_CLIENT_POINT);
  expect(callback.to?.pagePoint).toEqual(SECOND_OFFSET_POINT);
  expect(callback.mouseButton).toBe(2);
});

test('InputListener on contextmenu suppresses default', () => {
  const element: any = {};
  const callback = new FakeCallback();
  new InputListener(element, callback.dragCallback(), () => {});
  const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);

  expect(element.oncontextmenu(event)).toBe(false);
});

describe('InputListener onMouseMove', () => {
  it('notifies on far moves', () => {
    const element: any = {};
    const onMouseMove = jest.fn();
    new InputListener(element, jest.fn(), onMouseMove);
    const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);
    onMouseMove.mockClear();

    element.onmousemove(event);

    expect(onMouseMove).toHaveBeenCalledTimes(1);
    expect(onMouseMove).toHaveBeenCalledWith(FIRST_CLIENT_POINT);
  });

  it('does not notify on close X moves', () => {
    const element: any = {};
    const onMouseMove = jest.fn();
    new InputListener(element, jest.fn(), onMouseMove);
    const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);
    const secondEvent = mouseEvent(
      {x: FIRST_CLIENT_POINT.x + 1, y: FIRST_CLIENT_POINT.y},
      FIRST_OFFSET_POINT
    );
    onMouseMove.mockClear();

    element.onmousemove(event);
    onMouseMove.mockClear();
    element.onmousemove(secondEvent);

    expect(onMouseMove).not.toHaveBeenCalled();
  });

  it('does not notify on close Y moves', () => {
    const element: any = {};
    const onMouseMove = jest.fn();
    new InputListener(element, jest.fn(), onMouseMove);
    const event = mouseEvent(FIRST_CLIENT_POINT, FIRST_OFFSET_POINT);
    const secondEvent = mouseEvent(
      {x: FIRST_CLIENT_POINT.x, y: FIRST_CLIENT_POINT.y + 1},
      FIRST_OFFSET_POINT
    );
    onMouseMove.mockClear();

    element.onmousemove(event);
    onMouseMove.mockClear();
    element.onmousemove(secondEvent);

    expect(onMouseMove).not.toHaveBeenCalled();
  });
});
