export function arePointsEqual(a, b) {
    return a.x == b.x && a.y == b.y;
}
export function copyPoint(a) {
    return { x: a.x, y: a.y };
}
export function areLocationsEqual(a, b) {
    return a.col == b.col && a.row == b.row;
}
export function copyLocation(a) {
    return { row: a.row, col: a.col };
}
export function tileDistance(a, b) {
    return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}
export function deepCopyList(list, copyFunction) {
    const newList = [];
    for (const item of list) {
        newList.push(copyFunction(item));
    }
    return newList;
}
export function checkDefined(t, varName) {
    if (t === undefined) {
        throw new Error(varName + ' was unexpectedly undefined!');
    }
    return t;
}
export function getElementById(id) {
    const element = document.getElementById(id);
    if (element == null) {
        throw new Error('getElementById on invalid id: ' + id);
    }
    return element;
}
export function getOrigin() {
    return location.origin;
}
