import {
  TEST_TOKEN_ID,
  TEST_TOKEN_NAME,
  TEST_TOKEN_SOURCE,
  remoteTokenModel,
  DEFAULT_LOCATION,
  DEFAULT_SIZE,
  DEFAULT_SPEED,
  remoteBoardModel,
  remoteBoardDiff,
} from '_common/board/test_constants';
import {areLocationsEqual} from '_common/coordinates';
import {copyGrid, createGrid} from '_common/util/grid';
import {
  FOG_OFF,
  FOG_ON,
  RemoteBoardDiff,
  RemoteBoardModel,
  RemoteTokenModel,
} from './remote_board_model';

test('RemoteTokenModel equals returns false for different id', () => {
  const differentToken = Object.assign(remoteTokenModel());
  differentToken.id = 'whateverMadeUpIdBlah';
  expect(RemoteTokenModel.equals(remoteTokenModel(), differentToken)).toBe(
    false
  );
});

test('RemoteTokenModel equals returns false for different location', () => {
  const differentToken = Object.assign(remoteTokenModel());
  differentToken.location = {col: 42, row: 42};
  expect(RemoteTokenModel.equals(remoteTokenModel(), differentToken)).toBe(
    false
  );
});

test('RemoteTokenModel equals returns true for same inputs', () => {
  const copy = Object.assign(remoteTokenModel());
  expect(RemoteTokenModel.equals(remoteTokenModel(), copy)).toBe(true);
});

test('RemoteTokenModel fillDefaults adds speed', () => {
  const almostModel = {id: '1234', name: 'Aethelrad'};
  RemoteTokenModel.fillDefaults(almostModel);
  // @ts-ignore
  expect(almostModel.speed !== undefined).toBe(true);
});

test('RemoteTokenModel isValid with valid returns true', () => {
  const validModel: RemoteTokenModel = {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
    sheetData: null,
  };
  expect(RemoteTokenModel.isValid(validModel)).toBe(true);
  expect(RemoteTokenModel.isValid(remoteTokenModel())).toBe(true);
});

test('RemoteTokenModel isValid with missing id returns false', () => {
  const almostModel = {
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing location returns false', () => {
  const almostModel = {
    id: TEST_TOKEN_ID,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing name returns false', () => {
  const almostModel = {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing imageSource returns false', () => {
  const almostModel = {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing size returns false', () => {
  const almostModel = {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    speed: DEFAULT_SPEED,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel isValid with missing speed returns false', () => {
  const almostModel = {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
  };
  expect(RemoteTokenModel.isValid(almostModel)).toBe(false);
});

test('RemoteTokenModel mergeWith different IDs throws', () => {
  const diff = {id: '56970'};
  const token = remoteTokenModel();

  expect(() => RemoteTokenModel.mergedWith(token, diff)).toThrow();
});

test('RemoteTokenModel mergeWith overwrites name', () => {
  const newName = 'Marcus Aurelius';
  const diff = {id: TEST_TOKEN_ID, name: newName};
  const mergeResult = RemoteTokenModel.mergedWith(remoteTokenModel(), diff);

  expect(mergeResult.name).toStrictEqual(newName);
  expect(mergeResult === remoteTokenModel()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newLocation = {col: 99, row: 199};
  const diff = {id: TEST_TOKEN_ID, location: newLocation};
  const mergeResult = RemoteTokenModel.mergedWith(remoteTokenModel(), diff);

  expect(mergeResult.location).toStrictEqual(newLocation);
  expect(mergeResult === remoteTokenModel()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites location', () => {
  const newSource = 'source@/Imperator Caesar Divi Filius Augustus';
  const diff = {id: TEST_TOKEN_ID, imageSource: newSource};
  const mergeResult = RemoteTokenModel.mergedWith(remoteTokenModel(), diff);

  expect(mergeResult.imageSource).toStrictEqual(newSource);
  expect(mergeResult === remoteTokenModel()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites size', () => {
  const newSize = 55555;
  const diff = {id: TEST_TOKEN_ID, size: newSize};
  const mergeResult = RemoteTokenModel.mergedWith(remoteTokenModel(), diff);

  expect(mergeResult.size).toStrictEqual(newSize);
  expect(mergeResult === remoteTokenModel()).toBe(false);
});

test('RemoteTokenModel mergeWith overwrites speed', () => {
  const newSpeed = 55555;
  const diff = {id: TEST_TOKEN_ID, speed: newSpeed};
  const mergeResult = RemoteTokenModel.mergedWith(remoteTokenModel(), diff);

  expect(mergeResult.speed).toStrictEqual(newSpeed);
  expect(mergeResult === remoteTokenModel()).toBe(false);
});

describe('RemoteTokenModel.createFrom', () => {
  it('uses location from boardData', () => {
    const newLocation = {col: 4242, row: 5757};
    const result = RemoteTokenModel.createFrom(remoteTokenModel(), {
      id: TEST_TOKEN_ID,
      location: newLocation,
      size: DEFAULT_SIZE,
    });

    expect(areLocationsEqual(newLocation, result.location)).toBe(true);
  });

  it('on invalid merged token throws', () => {
    const baseToken = Object.assign(remoteTokenModel());
    baseToken.location = undefined;
    const boardData = {id: baseToken.id};

    expect(() =>
      RemoteTokenModel.createFrom(baseToken, boardData as any)
    ).toThrowError('Invalid token');
  });

  it('RemoteTokenModel createFrom different ids throws', () => {
    const newLocation = {col: 4242, row: 5757};
    const boardData = {
      id: 'whateverNewId',
      location: newLocation,
      size: DEFAULT_SIZE,
    };

    expect(() =>
      RemoteTokenModel.createFrom(remoteTokenModel(), boardData)
    ).toThrowError('different ids');
  });
});

describe('RemoteBoardModel.isValid', () => {
  it('returns true on valid model', () => {
    expect(RemoteBoardModel.isValid(remoteBoardModel())).toBe(true);
  });

  it('returns true on copied model', () => {
    const copy = Object.assign(remoteBoardModel());
    expect(RemoteBoardModel.isValid(copy)).toBe(true);
  });

  it('returns false without id', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.id = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without name', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.name = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without source', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.imageSource = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without tileSize', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.tileSize = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without tokens', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.tokens = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without fogOfWar', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.fogOfWar = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without publicSelection', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.publicSelection = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without cols', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.cols = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without gridOffset', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.gridOffset = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false without rows', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.rows = undefined;
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false invalid fogOfWar', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.fogOfWar = [[0]];
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on not array fogOfWar', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.fogOfWar = 'blahblah';
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on not 2Darray fogOfWar', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.fogOfWar = ['blahblah'];
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on not array publicSelection', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.publicSelection = 'blahblah';
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on not 2Darray publicSelection', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.publicSelection = ['blahblah'];
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on invalid fogOfWar', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.fogOfWar[0][0] = '57';
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });

  it('returns false on invalid tokens', () => {
    const copy = Object.assign(remoteBoardModel());
    copy.tokens = [{not: 'a token model'}];
    expect(RemoteBoardModel.isValid(copy)).toBe(false);
  });
});

test('RemoteBoardModel fillDefaults adds empty token', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.tokens = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(Array.isArray(copy.tokens)).toBe(true);
});

test('RemoteBoardModel fillDefaults corrects tokens', () => {
  const copy = Object.assign(remoteBoardModel());
  const token = Object.assign(remoteTokenModel());
  token.speed = undefined;

  expect(RemoteTokenModel.isValid(token)).toBe(false);
  copy.tokens = [token];
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteTokenModel.isValid(copy.tokens[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults no row fails', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.rows = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults no col fails', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.cols = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults adds gridOffset', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.gridOffset = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(copy.gridOffset).toBeDefined();
});

test('RemoteBoardModel fillDefaults no col fails', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.cols = undefined;
  RemoteBoardModel.fillDefaults(copy);
  expect(RemoteBoardModel.isValid(copy)).toBe(false);
});

test('RemoteBoardModel fillDefaults adds fogOfWar with correct cols', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = undefined;
  copy.cols = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar.length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds fogOfWar with correct rows', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = undefined;
  copy.rows = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0].length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds fogOfWar corrects True', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = [
    ['True', '0', '0'],
    ['0', '0', '0'],
  ];
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0][0]).toBe('1');
});

test('RemoteBoardModel fillDefaults adds fogOfWar corrects True', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = [
    ['False', '0', '0'],
    ['0', '0', '0'],
  ];
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0][0]).toBe('0');
});

test('RemoteBoardModel fillDefaults adds fogOfWar corrects others', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = [['17']];
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
  expect(copy.fogOfWar[0][0]).toBe('0');
});

test('RemoteBoardModel fillDefaults corrects invalid fogOfWar', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.fogOfWar = '2DArray';
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.fogOfWar)).toBe(true);
  expect(Array.isArray(copy.fogOfWar[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults corrects invalid publicSelection', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.publicSelection = '2DArray';
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
});

test('RemoteBoardModel fillDefaults adds publicSelection cols', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.publicSelection = undefined;
  copy.cols = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
  expect(copy.publicSelection.length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds publicSelection rows', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.publicSelection = undefined;
  copy.rows = 17;
  RemoteBoardModel.fillDefaults(copy);

  expect(Array.isArray(copy.publicSelection)).toBe(true);
  expect(Array.isArray(copy.publicSelection[0])).toBe(true);
  expect(copy.publicSelection[0].length).toBe(17);
});

test('RemoteBoardModel fillDefaults adds publicSelection value', () => {
  const copy = Object.assign(remoteBoardModel());
  copy.publicSelection = undefined;
  RemoteBoardModel.fillDefaults(copy);

  expect(copy.publicSelection[0][0]).toBe('0');
});

test('RemoteBoardDiff isValid returns true on valid', () => {
  const copy = Object.assign(remoteBoardDiff());
  expect(RemoteBoardDiff.isValid(copy)).toBe(true);
});

test('RemoteBoardDiff isValid requires id', () => {
  const copy = Object.assign(remoteBoardDiff());
  copy.id = undefined;

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires tokenDiffs with ids', () => {
  const copy = Object.assign(remoteBoardDiff());
  copy.tokenDiffs = [{whatever: 'whatever'}];

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

test('RemoteBoardDiff isValid requires valid newTokens', () => {
  const copy = Object.assign(remoteBoardDiff());
  copy.newTokens = [{whatever: 'whatever'}];

  expect(RemoteBoardDiff.isValid(copy)).toBe(false);
});

describe('RemoteBoardModel.mergedWith', () => {
  const board = remoteBoardModel();

  it('throws on bad id', () => {
    const diff: RemoteBoardDiff = {id: 'whateverId'};
    expect(() => RemoteBoardModel.mergedWith(board, diff)).toThrow();
  });

  it('returns a new instance', () => {
    const diff: RemoteBoardDiff = {id: board.id};
    const merged = RemoteBoardModel.mergedWith(board, diff);
    expect(board === merged).toBe(false);
    expect(board).toStrictEqual(merged);
  });

  it('produces expected publicSelection', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      publicSelectionDiffs: {
        area: {
          start: {col: 1, row: 2},
          end: {col: 1, row: 2},
        },
        value: '57',
      },
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    for (let i = 0; i < board.cols; i++) {
      for (let j = 0; j < board.rows; j++) {
        const expected = i === 1 && j === 2 ? '57' : '0';
        expect(merged.publicSelection[i][j]).toBe(expected);
      }
    }
  });

  it('does not mutate original public selection', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      publicSelectionDiffs: {
        area: {
          start: {col: 1, row: 2},
          end: {col: 1, row: 2},
        },
        value: '57',
      },
    };
    const selectionCopy = copyGrid(board.publicSelection);
    RemoteBoardModel.mergedWith(board, diff);

    expect(selectionCopy).toStrictEqual(board.publicSelection);
  });

  it('produces expected fogOfWar', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      fogOfWarDiffs: {
        area: {
          start: {col: 1, row: 2},
          end: {col: 1, row: 2},
        },
        value: FOG_ON,
      },
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    for (let i = 0; i < board.cols; i++) {
      for (let j = 0; j < board.rows; j++) {
        const expected = i === 1 && j === 2 ? '1' : '0';
        expect(merged.fogOfWar[i][j]).toBe(expected);
      }
    }
  });

  it('produces expected fogOfWar with fog off diff', () => {
    const fogOnBoard = remoteBoardModel() as any;
    fogOnBoard.fogOfWar = createGrid(3, 2, '1');
    const diff: RemoteBoardDiff = {
      id: board.id,
      fogOfWarDiffs: {
        area: {
          start: {col: 1, row: 2},
          end: {col: 1, row: 2},
        },
        value: FOG_OFF,
      },
    };
    const merged = RemoteBoardModel.mergedWith(fogOnBoard, diff);

    for (let i = 0; i < fogOnBoard.cols; i++) {
      for (let j = 0; j < fogOnBoard.rows; j++) {
        const expected = i === 1 && j === 2 ? '0' : '1';
        expect(merged.fogOfWar[i][j]).toBe(expected);
      }
    }
  });

  it('does not mutate original fogOfWar', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      fogOfWarDiffs: {
        area: {
          start: {col: 1, row: 2},
          end: {col: 1, row: 2},
        },
        value: FOG_OFF,
      },
    };
    const copy = copyGrid(board.fogOfWar);
    RemoteBoardModel.mergedWith(board, diff);

    expect(copy).toStrictEqual(board.fogOfWar);
  });

  it('uses diff name if present', () => {
    const newName = 'Egbert';
    const diff: RemoteBoardDiff = {
      id: board.id,
      name: newName,
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);
    expect(merged.name).toBe(newName);
  });

  it('uses diff offset if present', () => {
    const newOffset = {x: 2311, y: 56756};
    const diff: RemoteBoardDiff = {
      id: board.id,
      gridOffset: newOffset,
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);
    expect(merged.gridOffset).toBe(newOffset);
  });

  it('throws on invalid tile size update', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      tileSize: 5,
    };
    expect(() => RemoteBoardModel.mergedWith(board, diff)).toThrowError(
      'Invalid board dimensions'
    );
  });

  it('throws on invalid tile size update', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      tileSize: 5,
    };
    expect(() => RemoteBoardModel.mergedWith(board, diff)).toThrowError(
      'Invalid board dimensions'
    );
  });

  it('throws on invalid rows update', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      rows: 2,
    };
    expect(() => RemoteBoardModel.mergedWith(board, diff)).toThrowError(
      'Invalid board dimensions'
    );
  });

  it('throws on invalid cols update', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      rows: 200,
    };
    expect(() => RemoteBoardModel.mergedWith(board, diff)).toThrowError(
      'Invalid board dimensions'
    );
  });

  it('resizes grids on tile resize', () => {
    const expected = createGrid(5, 2, '0');
    const diff: RemoteBoardDiff = {
      id: board.id,
      rows: 5,
      cols: 2,
      tileSize: 30,
      gridOffset: {x: 0, y: 0},
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    expect(merged.fogOfWar).toStrictEqual(expected);
    expect(merged.publicSelection).toStrictEqual(expected);
  });

  it('resizes grids on col resize only', () => {
    const expected = createGrid(3, 1, '0');
    const diff: RemoteBoardDiff = {
      id: board.id,
      rows: 3,
      cols: 1,
      tileSize: 60,
      gridOffset: {x: 0, y: 0},
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    expect(merged.fogOfWar).toStrictEqual(expected);
    expect(merged.publicSelection).toStrictEqual(expected);
  });

  it('adds new token in diff', () => {
    const newToken = remoteTokenModel() as any;
    newToken.id = '345345';
    const diff: RemoteBoardDiff = {
      id: board.id,
      newTokens: [newToken],
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);
    const expectedTokenIds = merged.tokens.map((token) => token.id);

    expect(expectedTokenIds.length).toBe(2);
    expect(expectedTokenIds).toContain(newToken.id);
    expect(expectedTokenIds).toContain(TEST_TOKEN_ID);
  });

  it('filters tokens removed in diff', () => {
    const diff: RemoteBoardDiff = {
      id: board.id,
      removedTokens: [TEST_TOKEN_ID],
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);
    expect(merged.tokens.length).toBe(0);
  });

  it('modifies tokens changed in diff', () => {
    const newSpeed = 5678769867;
    const diff: RemoteBoardDiff = {
      id: board.id,
      tokenDiffs: [{id: TEST_TOKEN_ID, speed: newSpeed}],
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    expect(merged.tokens.length).toBe(1);
    expect(merged.tokens[0].speed).toBe(newSpeed);
    expect(board.tokens[0].speed).toBe(DEFAULT_SPEED);
  });

  it('does not modify tokens changed in diff with invalid ids', () => {
    const newSpeed = 5678769867;
    const diff: RemoteBoardDiff = {
      id: board.id,
      tokenDiffs: [{id: '2312221212122', speed: newSpeed}],
    };
    const merged = RemoteBoardModel.mergedWith(board, diff);

    expect(merged.tokens.length).toBe(1);
    expect(merged.tokens[0].speed).toBe(DEFAULT_SPEED);
  });
});
