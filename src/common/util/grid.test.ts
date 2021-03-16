import {copyGrid, createGrid, gridDimensions} from '_common/util/grid';
import {isGrid} from '_common/verification';

test('createGrid makes expected grid', () => {
  const rows = 57;
  const cols = 42;
  const grid = createGrid(rows, cols, 57);

  expect(isGrid(grid, cols, rows)).toBe(true);
  expect(grid[0][0]).toBe(57);
});

describe('copyGrid', () => {
  it('returns result with equal values', () => {
    const grid = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    const copy = copyGrid(grid);
    expect(copy).toStrictEqual(grid);
  });

  it('returns new array', () => {
    const grid = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    const copy = copyGrid(grid);

    expect(copy === grid).toBe(false);
    expect(copy[0] === grid[0]).toBe(false);
    expect(copy[1] === grid[1]).toBe(false);
  });
});

describe('gridDimensions', () => {
  it('returns the expected in the happy case', () => {
    const dimensions = gridDimensions(57, 42, 10);
    expect(dimensions.cols).toBe(6);
    expect(dimensions.rows).toBe(5);
  });

  it('does not round up on boundary values', () => {
    const dimensions = gridDimensions(50, 40, 10);
    expect(dimensions.cols).toBe(5);
    expect(dimensions.rows).toBe(4);
  });
});
