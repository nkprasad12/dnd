import {getOrigin} from '_client/common/get_origin';
import {
  getBackgroundData,
  LoadedImage,
  loadImage,
  loadImages,
} from '_client/utils/image_utils';
import {FakeImage} from '_client/utils/fake_image';

beforeAll(() => {
  FakeImage.invokeBeforeAll(false);
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterAll(() => {
  FakeImage.invokeAfterAll();
});

test('loadImage produces expected result on success', () => {
  const source = 'server@5757';
  const canvasImageSource: any = {};
  const event: any = {currentTarget: canvasImageSource};

  const imagePromise = loadImage(source);

  expect(FakeImage.instances.length).toBe(1);
  FakeImage.instances[0].onload(event);
  return expect(imagePromise).resolves.toEqual({
    source: source,
    image: canvasImageSource,
  });
});

test('loadImage has expected source', () => {
  const prefix = 'server@';
  const sourceSuffix = '5757';

  loadImage(prefix + sourceSuffix);

  expect(FakeImage.instances.length).toBe(1);
  expect(FakeImage.instances[0].src).toBe(getOrigin() + sourceSuffix);
});

test('loadImage throws on bad source', () => {
  expect(() => loadImage('invalidSource')).toThrow();
});

test('loadImage produces expected result on failure', () => {
  const source = 'server@5757';

  const imagePromise = loadImage(source);

  expect(FakeImage.instances.length).toBe(1);
  FakeImage.instances[0].onerror();
  return expect(imagePromise).rejects.toBeInstanceOf(Error);
});

test('loadImages produces expected result', () => {
  const firstSource = 'server@first';
  const secondSource = 'server@first';
  const firstCanvasImage: any = {firstSource: true};
  const secondCanvasImage: any = {secondSource: true};

  const imageMapPromise = loadImages([firstSource, secondSource]);

  expect(FakeImage.instances.length).toBe(2);
  FakeImage.instances[0].onload({currentTarget: firstCanvasImage} as any);
  FakeImage.instances[1].onload({currentTarget: secondCanvasImage} as any);
  return expect(imageMapPromise).resolves.toEqual(
    new Map([
      [firstSource, firstCanvasImage],
      [secondSource, secondCanvasImage],
    ])
  );
});

describe('getBackgroundData', () => {
  const image: any = new FakeImage.FakeImage();
  const loadedImage = new LoadedImage(image, 'whatever');
  const data = getBackgroundData(loadedImage, 10);

  it('reads from the input loadedImage', () => {
    expect(data.backgroundImage).toBe(loadedImage);
    expect(data.width).toBe(image.width);
    expect(data.height).toBe(image.height);
  });

  it('computes rows and columns correctly', () => {
    // Rounding up from 57 / 10
    expect(data.cols).toBe(6);
    expect(data.rows).toBe(42);
  });
});
