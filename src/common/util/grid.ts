import {Location, Point} from '_common/coordinates';
import {modulo} from '_common/util/math/operations';
import {inRange} from '_common/verification';

export type Grid<T> = ReadonlyArray<ReadonlyArray<T>>;
/** A simple grid mutation that changes a rectangle section to the new value. */

/** Initializes a grid of the input size with the given item. */
export function createGrid<T>(rows: number, cols: number, t: T): Grid<T> {
  return Array(cols)
    .fill(0)
    .map(() => Array(rows).fill(t));
}

/** Creates a new grid with each element shallow copied. */
export function copyGrid<T>(input: Grid<T>): Grid<T> {
  return input.map((col) => col.slice());
}

// TODO: move other functions into this namespace
export namespace Grid {
  /** A rectangular area of a grid. */
  export interface SimpleArea {
    /** The top left corner of the rectangle. */
    readonly start: Location;
    /** The bottom left corner of the rectangle. */
    readonly end: Location;
  }
  export namespace SimpleArea {
    /** Returns a list of tiles in the input area, start from `start` */
    export function toTiles(area: SimpleArea): readonly Location[] {
      const tiles = [];
      for (let i = area.start.col; i <= area.end.col; i++) {
        for (let j = area.start.row; j <= area.end.row; j++) {
          tiles.push({col: i, row: j});
        }
      }
      return tiles;
    }
  }

  export interface SimpleDiff<T> {
    /** The area to change. */
    area: SimpleArea;
    /** The value to set on the rectangle. */
    value: T;
  }

  /**
   * Applies a {@link SimpleGridDiff} to a grid.
   *
   * Any unchanged columns are reused.
   */
  export function applySimpleDiff<T>(
    grid: Grid<T>,
    diff: SimpleDiff<T>
  ): Grid<T> {
    const colTest = inRange(diff.area.start.col, diff.area.end.col);
    const rowTest = inRange(diff.area.start.row, diff.area.end.row);
    return grid.map((col, i) =>
      colTest(i)
        ? col.map((oldValue, j) => (rowTest(j) ? diff.value : oldValue))
        : col
    );
  }
}

/** Returns the expected grid size for the given inputs. */
export function gridDimensions(
  width: number,
  height: number,
  tileSize: number,
  gridOffset: Point
): {cols: number; rows: number; offset: Point} {
  const offset = {
    x: modulo(gridOffset.x, tileSize),
    y: modulo(gridOffset.y, tileSize),
  };
  if (offset.x === 0 && offset.y === 0) {
    return {
      cols: Math.ceil(width / tileSize),
      rows: Math.ceil(height / tileSize),
      offset: offset,
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
    offset: offset,
  };
}
