/** Represents a point in pixels on the page. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

export function arePointsEqual(a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}

export function copyPoint(a: Point) {
  return {x: a.x, y: a.y};
}

/** Represents a location on a grid. */
export interface Location {
  readonly col: number;
  readonly row: number;
}

export function areLocationsEqual(a: Location, b: Location): boolean {
  return a.col == b.col && a.row == b.row;
}

export function copyLocation(a: Location): Location {
  return {row: a.row, col: a.col};
}

export function tileDistance(a: Location, b: Location): number {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}
