import {RemoteTokenModel} from './remote_board_model';

const DEFAULT_ID = '12345678';
const DEFAULT_LOCATION = {row: 1, col: 7};
const DEFAULT_NAME = 'Ozymandias';
const DEFAULT_IMAGE_SOURCE = 'source@kingOfKings';
const DEFAULT_SIZE = 2;
const DEFAULT_SPEED = 6;

const DEFAULT_TOKEN =
    new RemoteTokenModel(
        DEFAULT_ID,
        DEFAULT_LOCATION,
        DEFAULT_NAME,
        DEFAULT_IMAGE_SOURCE,
        DEFAULT_SIZE,
        DEFAULT_SPEED);

const ID_TOKEN =
    new RemoteTokenModel(
        '23456',
        DEFAULT_LOCATION,
        DEFAULT_NAME,
        DEFAULT_IMAGE_SOURCE,
        DEFAULT_SIZE,
        DEFAULT_SPEED);

const LOCATION_TOKEN =
    new RemoteTokenModel(
        DEFAULT_ID,
        {row: 1, col: 6},
        DEFAULT_NAME,
        DEFAULT_IMAGE_SOURCE,
        DEFAULT_SIZE,
        DEFAULT_SPEED);

test('RemoteTokenModel equals returns false for different inputs', () => {
  expect(RemoteTokenModel.equals(DEFAULT_TOKEN, ID_TOKEN)).toBe(false);
  expect(RemoteTokenModel.equals(DEFAULT_TOKEN, LOCATION_TOKEN)).toBe(false);
});

test('RemoteTokenModel equals returns true for same inputs', () => {
  const copy =
      new RemoteTokenModel(
          DEFAULT_ID,
          {row: 1, col: 7},
          DEFAULT_NAME,
          DEFAULT_IMAGE_SOURCE,
          DEFAULT_SIZE,
          DEFAULT_SPEED);
  expect(RemoteTokenModel.equals(DEFAULT_TOKEN, copy)).toBe(true);
});

test('RemoteTokenModel fillDefaults adds speed', () => {
  const almostModel = {id: '1234', name: 'Aethelrad'};
  RemoteTokenModel.fillDefaults(almostModel);
  // @ts-ignore
  expect(almostModel.speed !== undefined).toBe(true);
});

test('RemoteTokenModel isValid with valid returns true', () => {
  const validModel = {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(validModel)).toBe(true);
  expect(RemoteTokenModel.isValid(DEFAULT_TOKEN)).toBe(true);
});

test('RemoteTokenModel isValid with missing id returns false', () => {
  const almostModel = {
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing location returns false', () => {
  const almostModel = {
    id: DEFAULT_ID,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing name returns false', () => {
  const almostModel = {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing imageSource returns false', () => {
  const almostModel = {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing size returns false', () => {
  const almostModel = {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing speed returns false', () => {
  const almostModel = {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel mergeWith different IDs ignores', () => {
  const diff = {id: '56970'};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.id).toStrictEqual(DEFAULT_TOKEN.id);
  expect(mergeResult === DEFAULT_TOKEN).toBe(true);
});

test('RemoteTokenModel mergeWith overwrites name', () => {
  const newName = 'Marcus Aurelius';
  const diff = {id: DEFAULT_ID, name: newName};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.name).toStrictEqual(newName);
  expect(mergeResult === DEFAULT_TOKEN).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newLocation = {col: 99, row: 199};
  const diff = {id: DEFAULT_ID, location: newLocation};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.location).toStrictEqual(newLocation);
  expect(mergeResult === DEFAULT_TOKEN).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newSource = 'source@/Imperator Caesar Divi Filius Augustus';
  const diff = {id: DEFAULT_ID, imageSource: newSource};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.imageSource).toStrictEqual(newSource);
  expect(mergeResult === DEFAULT_TOKEN).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites size', () => {
  const newSize = 55555;
  const diff = {id: DEFAULT_ID, size: newSize};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.size).toStrictEqual(newSize);
  expect(mergeResult === DEFAULT_TOKEN).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites speed', () => {
  const newSpeed = 55555;
  const diff = {id: DEFAULT_ID, speed: newSpeed};
  const mergeResult = RemoteTokenModel.mergedWith(DEFAULT_TOKEN, diff);

  expect(mergeResult.speed).toStrictEqual(newSpeed);
  expect(mergeResult === DEFAULT_TOKEN).toBe(false);
});

test('RemoteTokenModel computeDiff different ids throws', () => {
  expect(() => RemoteTokenModel.computeDiff(DEFAULT_TOKEN, ID_TOKEN)).toThrow();
});

test('RemoteTokenModel computeDiff different locations', () => {
  const diff = RemoteTokenModel.computeDiff(DEFAULT_TOKEN, LOCATION_TOKEN);
  expect(diff).toEqual({id: DEFAULT_ID, location: DEFAULT_LOCATION});
});
