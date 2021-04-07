import {
  FakeAllListener,
  FakeLocalListener,
} from '_client/game_board/controller/fake_listeners';
import {
  ModelHandler,
  UpdateListener,
} from '_client/game_board/controller/model_handler';
import {BoardDiff, BoardModel} from '_client/game_board/model/board_model';
import {createBoardModel} from '_client/game_board/model/test_constants';
import {TokenModel} from '_client/game_board/model/token_model';
import {FakeImage} from '_client/utils/fake_image';
import {RemoteTokenDiff} from '_common/board/remote_board_model';
import {remoteTokenModel, TEST_TOKEN_ID} from '_common/board/test_constants';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

class FakeModel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  mergedWith(diff: {inner: {name: string}}): Promise<FakeModel> {
    return Promise.resolve(new FakeModel(diff.inner.name));
  }
}

describe('addListeners', () => {
  const allListener = new FakeAllListener();
  const localListener = new FakeLocalListener();
  const initialModel = new FakeModel('Tacitus');

  const handler = new ModelHandler(initialModel as any, {} as any);
  handler.addListeners([allListener.listener, localListener.listener]);
  it('updates listener model on initial add', () => {
    expect(allListener.updatedModel).toEqual(initialModel);
    expect(localListener.updatedModel).toEqual(initialModel);
  });

  it('updates listener diff with empty diff', () => {
    expect(allListener.lastDiff).toEqual({});
    expect(localListener.lastDiff).toEqual({});
  });
});

describe('clearListeners', () => {
  it('removes listener from callback list', async (done) => {
    const allListener = new FakeAllListener();
    const initialModel = new FakeModel('Tacitus');
    const newName = 'Cassius Dio';

    const handler = new ModelHandler(initialModel as any, {} as any);
    handler.addListeners([allListener.listener]);
    handler.clearListeners();
    await handler.applyLocalDiff({inner: {name: newName}} as any);

    expect(allListener.updatedModel).toBe(initialModel);
    done();
  });
});

test('applyLocalDiff updates all listener on update', async (done) => {
  const allListener = new FakeAllListener();
  const localListener = new FakeLocalListener();
  const initialModel = new FakeModel('Tacitus');
  const newName = 'Cassius Dio';

  const handler = new ModelHandler(initialModel as any, {} as any);
  handler.addListeners([allListener.listener, localListener.listener]);
  await handler.applyLocalDiff({inner: {name: newName}} as any);

  expect(allListener.updatedModel.name).toBe(newName);
  expect(localListener.updatedModel.name).toBe(newName);
  expect(allListener.lastDiff).toStrictEqual({inner: {name: newName}});
  expect(localListener.lastDiff).toStrictEqual({inner: {name: newName}});
  done();
});

describe('applyRemoteDiff', () => {
  it('updates only remote', async (done) => {
    const allListener = new FakeAllListener();
    const localListener = new FakeLocalListener();
    const initialModel = new FakeModel('Tacitus');
    const newName = 'Cassius Dio';

    const handler = new ModelHandler(initialModel as any, {} as any);
    handler.addListeners([allListener.listener, localListener.listener]);
    await handler.applyRemoteDiff({name: newName} as any);

    expect(allListener.updatedModel.name).toBe(newName);
    expect(localListener.updatedModel).toStrictEqual(initialModel);
    expect(allListener.lastDiff).toStrictEqual({inner: {name: newName}});
    expect(localListener.lastDiff).toStrictEqual({});
    done();
  });

  it('extracts tokenDiffs to outer diff', async (done) => {
    const allListener = new FakeAllListener();
    const initialModel = new FakeModel('Tacitus');
    const tokenDiffs: RemoteTokenDiff[] = [];
    const newName = 'Cassius Dio';

    const handler = new ModelHandler(initialModel as any, {} as any);
    handler.addListeners([allListener.listener]);
    await handler.applyRemoteDiff({
      name: newName,
      tokenDiffs: tokenDiffs,
    } as any);

    expect(allListener.lastDiff).toStrictEqual({
      inner: {name: newName},
      tokenDiffs: tokenDiffs,
    });
    done();
  });
});

test('getModel returns current model', async (done) => {
  const initialModel = new FakeModel('Tacitus');
  const handler = new ModelHandler(initialModel as any, {} as any);

  expect(handler.getModel()).toBe(initialModel);
  done();
});

describe('addNewToken', () => {
  const JUSTINIAN = 'Justinian';

  it('adds a new token if id is not yet in the board', async (done) => {
    const listener = jest.fn((_model: BoardModel, diff: BoardDiff) => diff);
    const boardModel = await createBoardModel();
    const handler = new ModelHandler(boardModel, {} as any);
    handler.addListeners([UpdateListener.forAll(listener)]);
    listener.mockClear();

    const tokenModel = await TokenModel.fromRemote(remoteTokenModel());
    (tokenModel.inner as any).id = JUSTINIAN;
    await handler.addNewToken(tokenModel);

    const tokens = listener.mock.calls[0][0].tokens;
    expect(tokens.length).toBe(2);
    expect(tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(tokens[1].inner.id).toBe(JUSTINIAN);
    expect(listener.mock.calls[0][1].inner?.newTokens).toBeDefined();
    done();
  });

  it('modifies existing token if id is in the board', async (done) => {
    const listener = jest.fn((_model: BoardModel, diff: BoardDiff) => diff);
    const boardModel = await createBoardModel();
    const handler = new ModelHandler(boardModel, {} as any);
    handler.addListeners([UpdateListener.forAll(listener)]);
    listener.mockClear();

    const tokenModel = await TokenModel.fromRemote(remoteTokenModel());
    (tokenModel.inner as any).name = JUSTINIAN;
    await handler.addNewToken(tokenModel);

    const tokens = listener.mock.calls[0][0].tokens;
    expect(tokens.length).toBe(1);
    expect(tokens[0].inner.id).toBe(TEST_TOKEN_ID);
    expect(tokens[0].inner.name).toBe(JUSTINIAN);
    expect(listener.mock.calls[0][1].tokenDiffs).toBeDefined();
    done();
  });
});
