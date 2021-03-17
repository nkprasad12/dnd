import {Point} from '_common/coordinates';
import {modulo} from '_common/util/math/operations';

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

type Grid<T> = ReadonlyArray<ReadonlyArray<T>>;

/** Creates a new grid with each element shallow copied. */
export function copyGrid<T>(input: Grid<T>): Grid<T> {
  return input.map((col) => col.slice());
}

/** Returns the expected grid size for the given inputs. */
export function gridDimensions(
  width: number,
  height: number,
  tileSize: number,
  gridOffset: Point
): {cols: number; rows: number} {
  const offset = {
    x: modulo(gridOffset.x, tileSize),
    y: modulo(gridOffset.y, tileSize),
  };
  if (offset.x === 0 && offset.y === 0) {
    return {
      cols: Math.ceil(width / tileSize),
      rows: Math.ceil(height / tileSize),
    };
  }
  const extraCols = offset.x === 0 ? 0 : 1;
  const extraRows = offset.y === 0 ? 0 : 1;
  const baseCaseResult = gridDimensions(
    width - offset.x,
    height - offset.y,
    tileSize,
    {x: 0, y: 0}
  );
  return {
    cols: baseCaseResult.cols + extraCols,
    rows: baseCaseResult.rows + extraRows,
  };
}
