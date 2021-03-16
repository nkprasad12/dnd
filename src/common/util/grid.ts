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
