/** Initializes a grid of the input size with the given item. */
export function createGrid<T>(
  rows: number,
  cols: number,
  t: T
): readonly T[][] {
  return Array(cols)
    .fill(0)
    .map(() => Array(rows).fill(t));
}

/** Creates a new grid with each element shallow copied. */
export function copyGrid<T>(input: readonly T[][]): T[][] {
  return input.map((col) => col.slice());
}

/** Returns the expected grid size for the given inputs. */
export function gridDimensions(
  width: number,
  height: number,
  tileSize: number
): {cols: number; rows: number} {
  return {
    cols: Math.ceil(width / tileSize),
    rows: Math.ceil(height / tileSize),
  };
}
