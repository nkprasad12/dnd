import {
  ModelHandler,
  UpdateListener,
} from '_client/game_board/controller/model_handler';

class FakeModel {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  mergedWith(diff: {inner: {name: string}}): Promise<FakeModel> {
    return Promise.resolve(new FakeModel(diff.inner.name));
  }
}

class FakeLocalListener {
  updatedModel: any = undefined;
  lastDiff: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forLocal((update, diff) => {
      this.updatedModel = update;
      this.lastDiff = diff;
    });
  }
}

class FakeAllListener {
  updatedModel: any = undefined;
  lastDiff: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forAll((update, diff) => {
      this.updatedModel = update;
      this.lastDiff = diff;
    });
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

test('ModelHandler updates all listener on update', async (done) => {
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

test('ModelHandler updates only remote on remote update', async (done) => {
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
