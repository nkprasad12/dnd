import {BoardClient} from '_client/game_board/remote/board_client';
import {FakeConnection} from '_client/server/__mocks__/fake_connection';
import * as Events from '_common/board/board_events';
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
