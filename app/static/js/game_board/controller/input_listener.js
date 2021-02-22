/** Returns the absolute point of a mouse event. */
function mousePoint(event) {
    return { x: event.clientX, y: event.clientY };
}
/** Handles inputs from the user. */
export class InputListener {
    constructor(element, dragCallback) {
        this.element = element;
        this.dragCallback = dragCallback;
        this.mouseDownPoint = undefined;
        this.element.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });
        this.element.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });
        this.element.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    handleMouseDown(event) {
        this.mouseDownPoint = mousePoint(event);
    }
    handleMouseUp(event) {
        if (this.mouseDownPoint == undefined) {
            console.log('Got mouseup event without mousedown - ignoring.');
            return;
        }
        this.dragCallback(this.mouseDownPoint, mousePoint(event), event.button);
        this.mouseDownPoint = undefined;
    }
}
