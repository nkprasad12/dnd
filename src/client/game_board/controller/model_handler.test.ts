import {
  ModelHandler,
  UpdateListener,
} from '_client/game_board/controller/model_handler';

class FakeModel {
  constructor(private readonly data: string) {}

  deepCopy(): FakeModel {
    return new FakeModel(this.data);
  }

  mergedFrom(data: string): Promise<FakeModel> {
    return Promise.resolve(new FakeModel(data));
  }
}

class FakeLocalListener {
  updatedModel: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forLocal((update) => {
      this.updatedModel = update;
    });
  }
}

class FakeAllListener {
  updatedModel: any = undefined;
  readonly listener: UpdateListener;
  constructor() {
    this.listener = UpdateListener.forAll((update) => {
      this.updatedModel = update;
    });
  }
}

test('ModelHandler updates listeners on initial', () => {
  const allListener = new FakeAllListener();
  const localListener = new FakeLocalListener();
  const initialModel = new FakeModel('Tacitus');

  new ModelHandler(
    initialModel as any,
    [allListener.listener, localListener.listener],
    {} as any
  );

  expect(allListener.updatedModel === initialModel).toBe(false);
  expect(allListener.updatedModel).toEqual(initialModel);
  expect(localListener.updatedModel === initialModel).toBe(false);
  expect(localListener.updatedModel).toEqual(initialModel);
});

test('ModelHandler updates all listener on update', () => {
  const allListener = new FakeAllListener();
  const localListener = new FakeLocalListener();
  const initialModel = new FakeModel('Tacitus');
  const newModel = new FakeModel('Cassius Dio');

  const handler = new ModelHandler(
    initialModel as any,
    [allListener.listener, localListener.listener],
    {} as any
  );
  handler.update(newModel as any);

  expect(allListener.updatedModel === newModel).toBe(false);
  expect(allListener.updatedModel).toEqual(newModel);
  expect(localListener.updatedModel === newModel).toBe(false);
  expect(localListener.updatedModel).toEqual(newModel);
});

test('ModelHandler updates only remote on remote update', async (done) => {
  const allListener = new FakeAllListener();
  const localListener = new FakeLocalListener();
  const initialModel = new FakeModel('Tacitus');
  const remoteDiff = 'Cassius Dio';

  const handler = new ModelHandler(
    initialModel as any,
    [allListener.listener, localListener.listener],
    {} as any
  );
  await handler.applyRemoteDiff(remoteDiff as any);

  expect(allListener.updatedModel.data).toEqual(remoteDiff);
  expect(localListener.updatedModel).toEqual(initialModel);
  done();
});
