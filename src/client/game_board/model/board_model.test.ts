import {BoardModel} from '_client/game_board/model/board_model';
import {FakeImage} from '_client/utils/fake_image';
import {getBackgroundData, LoadedImage} from '_client/utils/image_utils';
import {
  remoteBoardModel,
  TEST_BOARD_NAME,
  TEST_TOKEN_NAME,
} from '_common/board/test_constants';
import {isGrid} from '_common/verification';

beforeAll(() => {
  FakeImage.invokeBeforeAll(true);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

const IMAGE: any = new FakeImage.FakeImage();
const LOADED_IMAGE = new LoadedImage(IMAGE, TEST_BOARD_NAME);
const TILE_SIZE = 17;

describe('BoardModel.fromRemoteModel', () => {
  const remote = remoteBoardModel();

  it('uses input remote model as inner', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.inner).toBe(remote);
    done();
  });

  it('has the expected background source', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.backgroundImage.source).toBe(remote.imageSource);
    done();
  });

  it('starts with context menu not visible', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.contextMenuState.isVisible).toBe(false);
    done();
  });

  it('has expected isPeeked array', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(isGrid(model.peekedTiles, remote.cols, remote.rows)).toBe(true);
    expect(model.peekedTiles[0][0]).toBe(false);
    done();
  });

  it('has expected tokens', async (done) => {
    const model = await BoardModel.createFromRemote(remote);
    expect(model.tokens.length).toBe(remote.tokens.length);
    expect(model.tokens[0].inner).toBe(remote.tokens[0]);
    expect(model.tokens[0].isActive).toBe(false);
    done();
  });
});

describe('BoardModel.createNew', () => {
  const model = BoardModel.createNew(TEST_TOKEN_NAME, LOADED_IMAGE, TILE_SIZE);
  const backgroundData = getBackgroundData(LOADED_IMAGE, TILE_SIZE);

  it('makes an inner model with the expected dimensions', () => {
    expect(model.inner.cols).toBe(backgroundData.cols);
    expect(model.inner.rows).toBe(backgroundData.rows);
    expect(model.inner.width).toBe(backgroundData.width);
    expect(model.inner.height).toBe(backgroundData.height);
  });

  it('has the expected other background parameters', () => {
    expect(model.backgroundImage.image).toBe(IMAGE);
    expect(model.inner.gridOffset).toStrictEqual({x: 0, y: 0});
    expect(model.inner.tileSize).toBe(TILE_SIZE);
  });

  it('initialized context menu invisible', () => {
    expect(model.contextMenuState.isVisible).toBe(false);
  });

  it('has correctly initialized peekedTiles', () => {
    expect(
      isGrid(model.peekedTiles, backgroundData.cols, backgroundData.rows)
    ).toBe(true);
    expect(model.peekedTiles[0][0]).toBe(false);
  });

  it('has correctly initialized publicSelection', () => {
    expect(
      isGrid(
        model.inner.publicSelection,
        backgroundData.cols,
        backgroundData.rows
      )
    ).toBe(true);
    expect(model.inner.publicSelection[0][0]).toBe('0');
  });

  it('has correctly initialized fogOfWar', () => {
    expect(
      isGrid(model.inner.fogOfWar, backgroundData.cols, backgroundData.rows)
    ).toBe(true);
    expect(model.inner.fogOfWar[0][0]).toBe('0');
  });
});
