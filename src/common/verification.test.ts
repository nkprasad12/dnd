import {isGrid, isStringArray} from '_common/verification';


test('isStringArray on empty array returns true', () => {
  expect(isStringArray([])).toBe(true);
});

test('isStringArray on not array returns false', () => {
  expect(isStringArray('notAnArray')).toBe(false);
});

test('isStringArray on string array returns true', () => {
  expect(isStringArray(['43', '32'])).toBe(true);
});

test('isStringArray on partial array returns false', () => {
  expect(isStringArray([43, '32'])).toBe(false);
});

test('isStringArray on not strings returns false', () => {
  expect(isStringArray([['32'], ['43']])).toBe(false);
});


test('isStringArray isGrid with expected returns true', () => {
  const grid = [[0, 0], [0, 0], [0, 0]];
  expect(isGrid(grid, 3, 2)).toBe(true);
});

test('isStringArray isGrid with incorrect rows returns false', () => {
  const grid = [[0, 0], [0, 0], [0, 0]];
  expect(isGrid(grid, 3, 4)).toBe(false);
});

test('isStringArray isGrid with incorrect cols returns false', () => {
  const grid = [[0, 0], [0, 0], [0, 0]];
  expect(isGrid(grid, 4, 2)).toBe(false);
});

test('isStringArray isGrid with variable cols returns false', () => {
  const grid = [[0, 0], [0, 0, 0], [0, 0]];
  expect(isGrid(grid, 3, 2)).toBe(false);
});

test('isStringArray isGrid cols 0 handles correctly', () => {
  const grid: number[] = [];
  expect(isGrid(grid, 0, 2)).toBe(true);
});

test('isStringArray isGrid with not array returns false', () => {
  const grid = '[[0, 0], [0, 0], [0, 0]]';
  expect(isGrid(grid, 3, 2)).toBe(false);
});

test('isStringArray isGrid with not array column returns false', () => {
  const grid = [[0, 0], '[0, 0]', [0, 0]];
  expect(isGrid(grid, 3, 2)).toBe(false);
});
