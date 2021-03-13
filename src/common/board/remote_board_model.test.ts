import {
  DEFAULT_ID,
  DEFAULT_NAME,
  DEFAULT_IMAGE_SOURCE,
  defaultRemoteToken,
  DEFAULT_LOCATION,
  DEFAULT_SIZE,
  DEFAULT_SPEED,
} from '_common/board/test_constants';
import {areLocationsEqual} from '_common/coordinates';
import {
  RemoteBoardDiff,
  RemoteBoardModel,
  RemoteTokenModel,
} from './remote_board_model';

function defaultBoard(): RemoteBoardModel {
  return new RemoteBoardModel(
    DEFAULT_ID,
    DEFAULT_NAME,
    DEFAULT_IMAGE_SOURCE,
    57,
    [defaultRemoteToken()],
    [['0']],
    [['0']],
    {x: 57, y: 57},
    1,
    1
  );
}

function defaultBoardDiff(): RemoteBoardDiff {
  return {
    id: DEFAULT_ID,
    newTokens: [defaultRemoteToken()],
    removedTokens: ['removedId'],
    tokenDiffs: [{id: 'tokenDiffId', speed: 5}],
    publicSelectionDiffs: [],
  };
}

test('RemoteTokenModel equals returns false for different id', () => {
  const differentToken = Object.assign(defaultRemoteToken());
  differentToken.id = 'whateverMadeUpIdBlah';
  expect(RemoteTokenModel.equals(defaultRemoteToken(), differentToken)).toBe(
    false
  );
});

test('RemoteTokenModel equals returns false for different location', () => {
  const differentToken = Object.assign(defaultRemoteToken());
  differentToken.location = {col: 42, row: 42};
  expect(RemoteTokenModel.equals(defaultRemoteToken(), differentToken)).toBe(
    false
  );
});

test('RemoteTokenModel equals returns true for same inputs', () => {
  const copy = Object.assign(defaultRemoteToken());
  expect(RemoteTokenModel.equals(defaultRemoteToken(), copy)).toBe(true);
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
  expect(RemoteTokenModel.isValid(defaultRemoteToken())).toBe(true);
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

test('RemoteTokenModel mergeWith different IDs throws', () => {
  const diff = {id: '56970'};
  const token = defaultRemoteToken();

  expect(() => RemoteTokenModel.mergedWith(token, diff)).toThrow();
});

test('RemoteTokenModel mergeWith overwrites name', () => {
  const newName = 'Marcus Aurelius';
  const diff = {id: DEFAULT_ID, name: newName};
  const mergeResult = RemoteTokenModel.mergedWith(defaultRemoteToken(), diff);

  expect(mergeResult.name).toStrictEqual(newName);
  expect(mergeResult === defaultRemoteToken()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newLocation = {col: 99, row: 199};
  const diff = {id: DEFAULT_ID, location: newLocation};
  const mergeResult = RemoteTokenModel.mergedWith(defaultRemoteToken(), diff);

  expect(mergeResult.location).toStrictEqual(newLocation);
  expect(mergeResult === defaultRemoteToken()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newSource = 'source@/Imperator Caesar Divi Filius Augustus';
  const diff = {id: DEFAULT_ID, imageSource: newSource};
  const mergeResult = RemoteTokenModel.mergedWith(defaultRemoteToken(), diff);

  expect(mergeResult.imageSource).toStrictEqual(newSource);
  expect(mergeResult === defaultRemoteToken()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites size', () => {
  const newSize = 55555;
  const diff = {id: DEFAULT_ID, size: newSize};
  const mergeResult = RemoteTokenModel.mergedWith(defaultRemoteToken(), diff);

  expect(mergeResult.size).toStrictEqual(newSize);
  expect(mergeResult === defaultRemoteToken()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites speed', () => {
  const newSpeed = 55555;
  const diff = {id: DEFAULT_ID, speed: newSpeed};
  const mergeResult = RemoteTokenModel.mergedWith(defaultRemoteToken(), diff);

  expect(mergeResult.speed).toStrictEqual(newSpeed);
  expect(mergeResult === defaultRemoteToken()).toBe(false);
});

test('RemoteTokenModel computeDiff different ids throws', () => {
  const differentId = Object.assign(defaultRemoteToken());
  differentId.id = 'definitelyNotTheSameId';

  expect(() =>
    RemoteTokenModel.computeDiff(defaultRemoteToken(), differentId)
  ).toThrow();
});

test('RemoteTokenModel computeDiff different locations', () => {
  const differentLocation = Object.assign(defaultRemoteToken());
  differentLocation.location = {col: 57, row: 57575757};

  const diff = RemoteTokenModel.computeDiff(
    defaultRemoteToken(),
    differentLocation
  );
  expect(diff).toEqual({id: DEFAULT_ID, location: DEFAULT_LOCATION});
});

test('RemoteTokenModel createFrom uses location from boardData', () => {
  const newLocation = {col: 4242, row: 5757};
  const result = RemoteTokenModel.createFrom(defaultRemoteToken(), {
    id: DEFAULT_ID,
    location: newLocation,
    size: DEFAULT_SIZE,
  });

  expect(areLocationsEqual(newLocation, result.location)).toBe(true);
});

test('RemoteTokenModel createFrom invalid result throws', () => {
  const baseToken = Object.assign(defaultRemoteToken());
  baseToken.location = undefined;
  const boardData = {id: 'whateverNewId'};

  expect(() =>
    RemoteTokenModel.createFrom(defaultRemoteToken(), boardData as any)
  ).toThrow();
});

test('RemoteTokenModel createFrom different ids throws', () => {
  const newLocation = {col: 4242, row: 5757};
  const boardData = {
    id: 'whateverNewId',
    location: newLocation,
    size: DEFAULT_SIZE,
  };

  expect(() =>
    RemoteTokenModel.createFrom(defaultRemoteToken(), boardData)
  ).toThrow();
});

test('RemoteBoardModel isValid true on valid model', () => {
  expect(RemoteBoardModel.isValid(defaultBoard())).toBe(true);
});

test('RemoteBoardModel isValid true on copied model', () => {
  const copy = Object.assign(defaultBoard());
  expect(RemoteBoardModel.isValid(copy)).toBe(true);
});

test('RemoteBoardModel isValid false without id', () => {
  const copy = Object.assign(defaultBoard());
  copy.id = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without name', () => {
  const copy = Object.assign(defaultBoard());
  copy.name = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without source', () => {
  const copy = Object.assign(defaultBoard());
  copy.imageSource = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without tileSize', () => {
  const copy = Object.assign(defaultBoard());
  copy.tileSize = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without tokens', () => {
  const copy = Object.assign(defaultBoard());
  copy.tokens = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without publicSelection', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without cols', () => {
  const copy = Object.assign(defaultBoard());
  copy.cols = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without gridOffset', () => {
  const copy = Object.assign(defaultBoard());
  copy.gridOffset = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false without rows', () => {
  const copy = Object.assign(defaultBoard());
  copy.rows = undefined;
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false invalid fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = [[0]];
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false on not array fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = 'blahblah';
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false on not 2Darray fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = ['blahblah'];
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false on not array publicSelection', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = 'blahblah';
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false on not 2Darray publicSelection', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = ['blahblah'];
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel isValid false invalid fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.tokens = [{not: 'aTokenModel'}];
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults adds empty token', () => {
  const copy = Object.assign(defaultBoard());
  copy.tokens = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(Array.isArray(copy.tokens)).toBe(true);
});

test('RemoteBoardModel fillDefaults corrects tokens', () => {
  const copy = Object.assign(defaultBoard());
  const token = Object.assign(defaultRemoteToken());
  token.speed = undefined;

  expect(RemoteTokenModel.isValid(token)).toBe(false);
  copy.tokens = [token];
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteTokenModel.isValid(copy.tokens[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults no row fails', () => {
  const copy = Object.assign(defaultBoard());
  copy.rows = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults no col fails', () => {
  const copy = Object.assign(defaultBoard());
  copy.cols = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults adds gridOffset', () => {
  const copy = Object.assign(defaultBoard());
  copy.gridOffset = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(copy.gridOffset).toBeDefined();
});

test('RemoteBoardModel fillDefaults no col fails', () => {
  const copy = Object.assign(defaultBoard());
  copy.cols = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults adds fogOfWar with correct cols', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = undefined;
  copy.cols = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar.length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds fogOfWar with correct rows', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = undefined;
  copy.rows = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0].length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds fogOfWar corrects True', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = [['True']];
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0][0]).toBe('1');
});

test('RemoteBoardModel fillDefaults adds fogOfWar corrects others', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = [['17']];
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0][0]).toBe('0');
});

test('RemoteBoardModel fillDefaults corrects invalid fogOfWar', () => {
  const copy = Object.assign(defaultBoard());
  copy.fogOfWar = '2DArray';
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults corrects invalid publicSelection', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = '2DArray';
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults adds publicSelection cols', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = undefined;
  copy.cols = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
  expect(copy.publicSelection.length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds publicSelection rows', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = undefined;
  copy.rows = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
  expect(copy.publicSelection[0].length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds publicSelection value', () => {
  const copy = Object.assign(defaultBoard());
  copy.publicSelection = undefined;
  RemoteBoardModel.fillDefaults(copy);

  expect(copy.publicSelection[0][0]).toBe('0');
});

test('RemoteBoardModel mergedWith throws on bad id', () => {
  const board = defaultBoard();
  const diff = {id: 'whateverId'};

  expect(() => RemoteBoardModel.mergedWith(board, diff as any)).toThrow();
});

test('RemoteBoardDiff isValid returns true on valid', () => {
  const copy = Object.assign(defaultBoardDiff());
  expect(RemoteBoardDiff.isValid(copy)).toBe(true);
});

test('RemoteBoardDiff isValid requires id', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.id = undefined;

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires newTokens', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.newTokens = undefined;

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires removedTokens', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.removedTokens = undefined;

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires tokenDiffs', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.tokenDiffs = undefined;

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires tokenDiffs with ids', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.tokenDiffs = [{whatever: 'whatever'}];

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires valid newTokens', () => {
  const copy = Object.assign(defaultBoardDiff());
  copy.newTokens = [{whatever: 'whatever'}];

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});
