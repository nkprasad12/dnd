import * as Ids from '_client/common/id_generator';
import {TokenModel} from '_client/game_board/model/token_model';
import * as Images from '_client/utils/image_utils';
import {
  defaultRemoteToken,
  DEFAULT_ID,
  DEFAULT_IMAGE_SOURCE,
  DEFAULT_LOCATION,
  DEFAULT_NAME,
  DEFAULT_SIZE,
  DEFAULT_SPEED,
} from '_common/board/test_constants';

beforeEach(() => {
  jest.spyOn(Ids, 'getId').mockReturnValue(DEFAULT_ID);
  jest
    .spyOn(Images, 'loadImage')
    .mockReturnValue(
      Promise.resolve(new Images.LoadedImage(IMAGE, DEFAULT_IMAGE_SOURCE))
    );
});

afterEach(() => {
  jest.clearAllMocks();
});

const IMAGE = {} as any;
const IS_ACTIVE = true;
function createToken(): TokenModel {
  return TokenModel.create(
    DEFAULT_NAME,
    new Images.LoadedImage(IMAGE, DEFAULT_IMAGE_SOURCE),
    DEFAULT_SIZE,
    DEFAULT_LOCATION,
    IS_ACTIVE,
    DEFAULT_SPEED
  );
}

describe('create', () => {
  it('makes a token with the expected inner model', () => {
    expect(createToken().inner).toStrictEqual(defaultRemoteToken());
  });

  it('makes a token with the expected outer fields', () => {
    const created = createToken();
    expect(created.image).toBe(IMAGE);
    expect(created.isActive).toBe(IS_ACTIVE);
  });

  it('creates a new unique id', () => {
    createToken();
    expect(Ids.getId).toBeCalled();
  });
});

describe('duplicate', () => {
  it('makes duplicates the existing token', () => {
    const created = createToken();
    const duplicated = TokenModel.duplicate(created);
    expect(created).toStrictEqual(duplicated);
  });

  it('makes a new unique id', () => {
    const created = createToken();
    jest.clearAllMocks();

    TokenModel.duplicate(created);
    expect(Ids.getId).toHaveBeenCalledTimes(1);
  });
});

describe('fromRemoteAndMap', () => {
  const IMAGE_MAP: Map<string, CanvasImageSource> = new Map([
    [DEFAULT_IMAGE_SOURCE, IMAGE],
  ]);

  it('throws if source is not in the map', () => {
    const remoteToken = defaultRemoteToken() as any;
    remoteToken.imageSource = 'definitely not the default source';
    expect(() => TokenModel.fromRemoteAndMap(remoteToken, IMAGE_MAP)).toThrow();
  });

  it('uses image from the map if the source is present', () => {
    const token = TokenModel.fromRemoteAndMap(defaultRemoteToken(), IMAGE_MAP);
    expect(token.image).toBe(IMAGE);
  });

  it('has the given inner model', () => {
    const remoteModel = defaultRemoteToken();
    const token = TokenModel.fromRemoteAndMap(remoteModel, IMAGE_MAP);
    expect(token.inner).toBe(remoteModel);
  });

  it('sets isActive to false', () => {
    const token = TokenModel.fromRemoteAndMap(defaultRemoteToken(), IMAGE_MAP);
    expect(token.isActive).toBe(false);
  });
});

describe('fromRemote', () => {
  it('constructs token with given inner model', async (done) => {
    const remoteToken = defaultRemoteToken();
    const token = await TokenModel.fromRemote(remoteToken);

    expect(token.inner).toBe(remoteToken);
    done();
  });

  it('constructs token with isActive false', async (done) => {
    const remoteToken = defaultRemoteToken();
    const token = await TokenModel.fromRemote(remoteToken);

    expect(token.isActive).toBe(false);
    done();
  });

  it('loads from the remote token source', async (done) => {
    const remoteToken = defaultRemoteToken();
    await TokenModel.fromRemote(remoteToken);

    expect(Images.loadImage).toHaveBeenCalledWith(remoteToken.imageSource);
    done();
  });
});

describe('equals', () => {
  it('returns true on identical tokens', async (done) => {
    const first = await TokenModel.fromRemote(defaultRemoteToken());
    const second = await TokenModel.fromRemote(defaultRemoteToken());

    expect(first.equals(second)).toBe(true);
    expect(second.equals(first)).toBe(true);
    done();
  });

  it('returns false if isActive is different', async (done) => {
    const first = await TokenModel.fromRemote(defaultRemoteToken());
    const second = await TokenModel.fromRemote(defaultRemoteToken());
    (second as any).isActive = true;

    expect(first.equals(second)).toBe(false);
    expect(second.equals(first)).toBe(false);
    done();
  });

  it('returns false if inner model is different', async (done) => {
    const first = await TokenModel.fromRemote(defaultRemoteToken());
    const second = await TokenModel.fromRemote(defaultRemoteToken());
    (second as any).inner.name = 'Herodetus';

    expect(first.equals(second)).toBe(false);
    expect(second.equals(first)).toBe(false);
    done();
  });
});

describe('merge', () => {
  const newImage = {foo: 'bar'} as any;
  const isActiveDiff = {isActive: false};
  const imageDiff = {image: newImage};

  it('uses old isActive if not in diff', async (done) => {
    const token = await TokenModel.fromRemote(defaultRemoteToken());
    const merged = TokenModel.merge(token, imageDiff);
    expect(merged.isActive).toBe(false);
    done();
  });

  it('uses new isActive if in diff', async (done) => {
    const token = await TokenModel.fromRemote(defaultRemoteToken());
    const merged = TokenModel.merge(token, isActiveDiff);
    expect(merged.isActive).toBe(false);
    done();
  });

  it('uses old image if not in diff', async (done) => {
    const token = await TokenModel.fromRemote(defaultRemoteToken());
    const merged = TokenModel.merge(token, isActiveDiff);
    expect(merged.image).toBe(IMAGE);
    done();
  });

  it('uses new image if in diff', async (done) => {
    const token = await TokenModel.fromRemote(defaultRemoteToken());
    const merged = TokenModel.merge(token, imageDiff);
    expect(merged.image).toBe(newImage);
    done();
  });

  it('uses old inner model if not in diff', async (done) => {
    const remoteToken = defaultRemoteToken();
    const token = await TokenModel.fromRemote(remoteToken);
    const merged = TokenModel.merge(token, isActiveDiff);
    expect(merged.inner).toBe(remoteToken);
    done();
  });

  it('uses new inner model if in diff', async (done) => {
    const token = await TokenModel.fromRemote(defaultRemoteToken());
    const newRemoteModel = defaultRemoteToken();
    (newRemoteModel as any).name = 'Definitely not the default name';

    const merged = TokenModel.merge(token, {inner: newRemoteModel});
    expect(merged.inner).toStrictEqual(newRemoteModel);
    done();
  });
});
