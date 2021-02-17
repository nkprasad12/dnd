/** Represents a point in pixels on the page. */
export interface Point {
  x: number;
  y: number;
}

export function arePointsEqual(a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}

export function copyPoint(a: Point) {
  return {x: a.x, y: a.y};
}

/** Represents a location on a grid. */
export interface Location {
  col: number;
  row: number;
}

export function areLocationsEqual(a: Location, b: Location): boolean {
  return a.col == b.col && a.row == b.row;
}

export function copyLocation(a: Location): Location {
  return {row: a.row, col: a.col};
}

export function deepCopyList<T> (list: T[], copyFunction: (a: T) => T) {
  let newList: T[] = [];
  for (let item of list) {
    newList.push(copyFunction(item));
  }
  return newList;
}
