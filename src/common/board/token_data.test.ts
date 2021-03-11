import {BoardOnlyTokenData, TokenData} from '_common/board/token_data';

const DEFAULT_ID = '12345678';
const DEFAULT_NAME = 'Ozymandias';
const DEFAULT_IMAGE_SOURCE = 'source@kingOfKings';
const DEFAULT_SIZE = 2;
const DEFAULT_SPEED = 6;

function defaultToken(): TokenData {
  return {
    id: DEFAULT_ID,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    speed: DEFAULT_SPEED,
  };
}

function defaultBoardOnlyData(): BoardOnlyTokenData {
  return {
    id: DEFAULT_ID,
    location: {row: 1, col: 1},
    size: DEFAULT_SIZE,
  };
}

test('TokenData isValid returns true on copy', () => {
  const copy = Object.assign(defaultToken());
  expect(TokenData.isValid(copy)).toBe(true);
});

test('TokenData isValid returns false without id', () => {
  const modified = Object.assign(defaultToken());
  modified.id = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without name', () => {
  const modified = Object.assign(defaultToken());
  modified.name = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without imageSource', () => {
  const modified = Object.assign(defaultToken());
  modified.imageSource = undefined;
  expect(TokenData.isValid(modified)).toBe(false);
});

test('TokenData isValid returns false without speed', () => {
  const modified = Object.assign(defaultToken());
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
