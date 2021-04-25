import {BoardClient} from '_client/game_board/remote/board_client';
import {FakeConnection} from '_client/server/__mocks__/fake_connection';
import * as Events from '_common/board/board_events';
import {
  RemoteBoardModel,
  RemoteTokenModel,
} from '_common/board/remote_board_model';
import {remoteBoardModel, remoteTokenModel} from '_common/board/test_constants';
import {checkDefined} from '_common/preconditions';

jest.mock('_client/server/socket_connection');

beforeEach(() => {
  FakeConnection.resetAllSockets();
});

describe('BoardClient.get', () => {
  it('only makes one connection per namespace', () => {
    BoardClient.get();
    BoardClient.get();
    expect(FakeConnection.connectionsOn('board')).toBe(1);
  });

  it('returns the same instance on repeated calls', () => {
    const first = BoardClient.get();
    const second = BoardClient.get();
    expect(first).toBe(second);
  });
});

test('updateBoard sends event to socket', async (done) => {
  const boardUpdate = 'EgbertMovedOver5Spaces';
  (await BoardClient.get()).updateBoard(boardUpdate as any);

  const socket = checkDefined(FakeConnection.getFakeSocket('board'));
  expect(socket.emitMap.size).toBe(1);
  expect(socket.emitMap.get(Events.BOARD_UPDATE)).toBe(boardUpdate);
  done();
});

test('createBoard sends event to socket', async (done) => {
  const newBoard = 'IAmDefinitelyANewBoard';
  (await BoardClient.get()).createBoard(newBoard as any);

  const socket = checkDefined(FakeConnection.getFakeSocket('board'));
  expect(socket.emitMap.size).toBe(1);
  expect(socket.emitMap.get(Events.BOARD_CREATE_REQUEST)).toBe(newBoard);
  done();
});

test('createBoard sends event to socket', async (done) => {
  const newBoard = 'IAmDefinitelyANewBoard';
  (await BoardClient.get()).createBoard(newBoard as any);

  const socket = checkDefined(FakeConnection.getFakeSocket('board'));
  expect(socket.emitMap.size).toBe(1);
  expect(socket.emitMap.get(Events.BOARD_CREATE_REQUEST)).toBe(newBoard);
  done();
});

test('setActiveBoard sends event to socket', async (done) => {
  const activeBoard = '345322';
  (await BoardClient.get()).setActiveBoard(activeBoard as any);

  const socket = checkDefined(FakeConnection.getFakeSocket('board'));
  expect(socket.emitMap.size).toBe(1);
  expect(socket.emitMap.get(Events.BOARD_SET_ACTIVE)).toBe(activeBoard);
  done();
});

describe('getRemoteUpdates', () => {
  it('registers for board updates', async (done) => {
    (await BoardClient.get()).getRemoteUpdates(() => {});

    const socket = checkDefined(FakeConnection.getFakeSocket('board'));
    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(Events.BOARD_UPDATE)).toBeDefined();
    done();
  });

  it('throws on invalid update', async (done) => {
    const listener = jest.fn((diff) => diff);
    (await BoardClient.get()).getRemoteUpdates(listener);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));
    const callback = checkDefined(socket.onMap.get(Events.BOARD_UPDATE));

    expect(() => callback('NotAValidDiff')).toThrow();
    expect(listener).toBeCalledTimes(0);
    done();
  });

  it('pipes valid update to listener', async (done) => {
    const diff = {id: '1234', name: 'newName'};
    const listener = jest.fn((diff) => diff);
    (await BoardClient.get()).getRemoteUpdates(listener);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));
    const callback = checkDefined(socket.onMap.get(Events.BOARD_UPDATE));

    callback(diff);
    expect(listener).toBeCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(diff);
    done();
  });
});

describe('requestBoard (full board)', () => {
  const BOARD_ID = '12345';

  it('emits board request with given id', async (done) => {
    (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(Events.BOARD_GET_REQUEST)).toBe(BOARD_ID);
    done();
  });

  it('registers board response callback', async (done) => {
    (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.onMap.size).toBe(2);
    expect(socket.onMap.get(Events.BOARD_GET_RESPONSE)).toBeDefined();
    expect(socket.onMap.get(Events.BOARD_GET_ERROR)).toBeDefined();
    done();
  });

  it('rejects on invalid input', async () => {
    const board = (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(socket.onMap.get(Events.BOARD_GET_RESPONSE));
    callback('NotAValidBoard');
    return expect(board).rejects.toThrow('invalid board');
  });

  it('rejects almost salvagable input', async () => {
    const input = remoteBoardModel();
    (input as any).name = undefined;
    const board = (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(socket.onMap.get(Events.BOARD_GET_RESPONSE));
    callback(input);
    return expect(board).rejects.toThrow('invalid board');
  });

  it('repairs salvagable input', async () => {
    const input = remoteBoardModel();
    (input as any).tokens = undefined;
    const board = (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(socket.onMap.get(Events.BOARD_GET_RESPONSE));
    callback(input);
    return expect(board).resolves.toStrictEqual(
      RemoteBoardModel.fillDefaults(input)
    );
  });

  it('resolves valid input', async () => {
    const input = remoteBoardModel();
    const board = (await BoardClient.get()).requestBoard(BOARD_ID);
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(socket.onMap.get(Events.BOARD_GET_RESPONSE));
    callback(input);
    return expect(board).resolves.toBe(input);
  });
});

describe('requestBoardOptions', () => {
  it('emits board get all request', async (done) => {
    (await BoardClient.get()).requestBoardOptions();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(Events.BOARD_GET_ALL_REQUEST)).toBeDefined();
    done();
  });

  it('registers board get all response callback', async (done) => {
    (await BoardClient.get()).requestBoardOptions();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(Events.BOARD_GET_ALL_RESPONSE)).toBeDefined();
    done();
  });

  it('rejects on invalid input', async () => {
    const boards = (await BoardClient.get()).requestBoardOptions();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.BOARD_GET_ALL_RESPONSE)
    );
    callback('NotAStringArray');
    return expect(boards).rejects.toThrow('invalid response');
  });

  it('resolves valid response', async () => {
    const response = ['57', '420'];
    const boards = (await BoardClient.get()).requestBoardOptions();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.BOARD_GET_ALL_RESPONSE)
    );
    callback(response);
    return expect(boards).resolves.toStrictEqual(response);
  });
});

describe('requestAllTokens', () => {
  it('emits tokens request', async (done) => {
    (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(Events.TOKENS_GET_ALL_REQUEST)).toBeDefined();
    done();
  });

  it('registers token response callback', async (done) => {
    (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(Events.TOKENS_GET_ALL_RESPONSE)).toBeDefined();
    done();
  });

  it('rejects on invalid input', async () => {
    const tokens = (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.TOKENS_GET_ALL_RESPONSE)
    );
    callback('NotAValidArray');
    return expect(tokens).rejects.toThrow('non-array');
  });

  it('repairs salvagable input', async () => {
    const input = remoteTokenModel();
    (input as any).speed = undefined;
    const tokens = (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.TOKENS_GET_ALL_RESPONSE)
    );
    callback([input]);
    return expect(tokens).resolves.toStrictEqual([
      RemoteTokenModel.fillDefaults(input),
    ]);
  });

  it('skips unsalvagable elements', async () => {
    const input = remoteTokenModel();
    (input as any).id = undefined;
    const tokens = (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.TOKENS_GET_ALL_RESPONSE)
    );
    callback([input]);
    return expect(tokens).resolves.toStrictEqual([]);
  });

  it('resolves to valid tokens', async () => {
    const input = remoteTokenModel();
    const tokens = (await BoardClient.get()).requestAllTokens();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.TOKENS_GET_ALL_RESPONSE)
    );
    callback([input]);
    return expect(tokens).resolves.toStrictEqual([input]);
  });
});

describe('requestActiveBoardId', () => {
  it('emits get active request', async (done) => {
    (await BoardClient.get()).requestActiveBoardId();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.emitMap.size).toBe(1);
    expect(socket.emitMap.get(Events.BOARD_GET_ACTIVE_REQUEST)).toBeDefined();
    done();
  });

  it('registers get active response response callback', async (done) => {
    (await BoardClient.get()).requestActiveBoardId();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    expect(socket.onMap.size).toBe(1);
    expect(socket.onMap.get(Events.BOARD_GET_ACTIVE_RESPONSE)).toBeDefined();
    done();
  });

  it('resolves undefined on error', async () => {
    const boardId = (await BoardClient.get()).requestActiveBoardId();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.BOARD_GET_ACTIVE_RESPONSE)
    );
    callback('ERROR');
    return expect(boardId).resolves.toBeUndefined();
  });

  it('resolves to id on other input', async () => {
    const result = 'Beware the IDs of March';
    const boardId = (await BoardClient.get()).requestActiveBoardId();
    const socket = checkDefined(FakeConnection.getFakeSocket('board'));

    const callback = checkDefined(
      socket.onMap.get(Events.BOARD_GET_ACTIVE_RESPONSE)
    );
    callback(result);
    return expect(boardId).resolves.toBe(result);
  });
});
