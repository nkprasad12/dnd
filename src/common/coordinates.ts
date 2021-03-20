/** Represents a point in pixels on the page. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

export function arePointsEqual(a: Point, b: Point): boolean {
  return a.x == b.x && a.y == b.y;
}

/** Represents a location on a grid. */
export interface Location {
  readonly col: number;
  readonly row: number;
}

export function areLocationsEqual(a: Location, b: Location): boolean {
  return a.col === b.col && a.row === b.row;
}

/** Distance by the DnD metric. */
export function tileDistance(a: Location, b: Location): number {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}
