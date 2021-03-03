import {areLocationsEqual, arePointsEqual, tileDistance} from './coordinates';

test('areLocationsEqual returns true for equal', () => {
  const first = {row: 5, col: 6};
  const second = {row: 5, col: 6};
  expect(areLocationsEqual(first, second)).toBe(true);
});

test('areLocationsEqual returns false for different row', () => {
  const first = {row: 4, col: 6};
  const second = {row: 5, col: 6};
  expect(areLocationsEqual(first, second)).toBe(false);
});

test('areLocationsEqual returns false for different col', () => {
  const first = {row: 5, col: 6};
  const second = {row: 5, col: 7};
  expect(areLocationsEqual(first, second)).toBe(false);
});

test('arePointsEqual returns true for equal', () => {
  const first = {x: 5, y: 6};
  const second = {x: 5, y: 6};
  expect(arePointsEqual(first, second)).toBe(true);
});

test('arePointsEqual returns false for different x', () => {
  const first = {x: 4, y: 6};
  const second = {x: 5, y: 6};
  expect(arePointsEqual(first, second)).toBe(false);
});

test('arePointsEqual returns false for different y', () => {
  const first = {x: 5, y: 6};
  const second = {x: 5, y: 7};
  expect(arePointsEqual(first, second)).toBe(false);
});

test('tileDistance for same tile is 0', () => {
  const first = {row: 5, col: 6};
  const second = {row: 5, col: 6};
  expect(tileDistance(first, second)).toBe(0);
});

test('tileDistance for same row is col diff', () => {
  const first = {row: 5, col: 6};
  const second = {row: 5, col: 8};
  expect(tileDistance(first, second)).toBe(2);
});

test('tileDistance for same col is row diff', () => {
  const first = {row: 5, col: 6};
  const second = {row: 8, col: 6};
  expect(tileDistance(first, second)).toBe(3);
});

test('tileDistance returns max diff', () => {
  const first = {row: 5, col: 3};
  const second = {row: 8, col: 7};
  expect(tileDistance(first, second)).toBe(4);
});
