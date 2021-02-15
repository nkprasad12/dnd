/** Represents a point in pixels on the page. */
export interface Point {
  x: number;
  y: number;
}

export function arePointsEqual(a: Point, b: Point) {
  return a.x == b.x && a.y == b.y;
}

/** Represents a location on a grid. */
export interface Location {
  col: number;
  row: number;
}

export function areLocationsEqual(a: Location, b: Location) {
  return a.col == b.col && a.row == b.row;
}
