import {createGrid} from '_common/util/grid';
import {isGrid} from '_common/verification';

test('createGrid makes expected grid', () => {
  const rows = 57;
  const cols = 42;
  const grid = createGrid(rows, cols, 57);

  expect(isGrid(grid, cols, rows)).toBe(true);
  expect(grid[0][0]).toBe(57);
});
