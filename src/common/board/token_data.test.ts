import {
  TEST_TOKEN_ID,
  TEST_TOKEN_NAME,
  TEST_TOKEN_SOURCE,
  DEFAULT_SPEED,
  DEFAULT_SIZE,
} from '_common/board/test_constants';
import {BoardOnlyTokenData, TokenData} from '_common/board/token_data';

function defaultTokenData(): TokenData {
  return {
    id: TEST_TOKEN_ID,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    speed: DEFAULT_SPEED,
    sheetData: null,
  };
}

function defaultBoardOnlyData(): BoardOnlyTokenData {
  return {
    id: TEST_TOKEN_ID,
    location: {row: 1, col: 1},
    size: DEFAULT_SIZE,
  };
}

test('TokenData isValid returns true on copy', () => {
  const copy = Object.assign(defaultTokenData());
  expect(TokenData.isValid(copy)).toBe(true);
});

test('TokenData isValid returns false without id', () => {
  const modified = Object.assign(defaultTokenData());
  modified.id = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without name', () => {
  const modified = Object.assign(defaultTokenData());
  modified.name = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without imageSource', () => {
  const modified = Object.assign(defaultTokenData());
  modified.imageSource = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without speed', () => {
  const modified = Object.assign(defaultTokenData());
  modified.speed = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData fillDefaults adds speed', () => {
  const filled = TokenData.fillDefaults({});
  expect(filled.speed).toBeDefined();
});

test('BoardOnlyTokenData isValid returns true on copy', () => {
  const copy = Object.assign(defaultBoardOnlyData());
  expect(BoardOnlyTokenData.isValid(copy)).toBe(true);
});

test('BoardOnlyTokenData isValid returns false without id', () => {
  const modified = Object.assign(defaultBoardOnlyData());
  modified.id = undefined;
  expect(BoardOnlyTokenData.isValid(modified)).toBe(false);
});

test('BoardOnlyTokenData isValid returns false without location', () => {
  const modified = Object.assign(defaultBoardOnlyData());
  modified.location = undefined;
  expect(BoardOnlyTokenData.isValid(modified)).toBe(false);
});

test('BoardOnlyTokenData isValid returns false without size', () => {
  const modified = Object.assign(defaultBoardOnlyData());
  modified.size = undefined;
  expect(BoardOnlyTokenData.isValid(modified)).toBe(false);
});
