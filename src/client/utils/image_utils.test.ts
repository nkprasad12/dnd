import {getOrigin} from '_client/common/get_origin';
import {LoadedImage, loadImage, loadImages} from '_client/utils/image_utils';

const RealImage = Image;

let imageInstances: FakeImage[] = [];

class FakeImage {
  public src: string | undefined = undefined;
  constructor() {
    imageInstances.push(this);
  }

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onload(event: Event): void {}

  onerror(): void {}
}

beforeAll(() => {
  // @ts-ignore
  global.Image = FakeImage;
});

beforeEach(() => {
  imageInstances = [];
});

afterAll(() => {
  global.Image = RealImage;
});

test('LoadedImage deepCopy copies as expected', () => {
  const image: any = {image: 'yes'};
  const source = 'imageSource';
  const loadedImage = new LoadedImage(image, source);

  const copy = loadedImage.deepCopy();

  expect(copy.image === loadedImage.image).toBe(true);
  expect(copy.source).toBe(loadedImage.source);
});

test('loadImage produces expected result on success', () => {
  const source = 'server@5757';
  const canvasImageSource: any = {};
  const event: any = {currentTarget: canvasImageSource};

  const imagePromise = loadImage(source);

  expect(imageInstances.length).toBe(1);
  imageInstances[0].onload(event);
  return expect(imagePromise).resolves.toEqual({
    source: source,
    image: canvasImageSource,
  });
});

test('loadImage has expected source', () => {
  const prefix = 'server@';
  const sourceSuffix = '5757';

  loadImage(prefix + sourceSuffix);

  expect(imageInstances.length).toBe(1);
  expect(imageInstances[0].src).toBe(getOrigin() + sourceSuffix);
});

test('loadImage throws on bad source', () => {
  expect(() => loadImage('invalidSource')).toThrow();
});

test('loadImage produces expected result on failure', () => {
  const source = 'server@5757';

  const imagePromise = loadImage(source);

  expect(imageInstances.length).toBe(1);
  imageInstances[0].onerror();
  return expect(imagePromise).rejects.toBeInstanceOf(Error);
});

test('loadImages produces expected result', () => {
  const firstSource = 'server@first';
  const secondSource = 'server@first';
  const firstCanvasImage: any = {firstSource: true};
  const secondCanvasImage: any = {secondSource: true};

  const imageMapPromise = loadImages([firstSource, secondSource]);

  expect(imageInstances.length).toBe(2);
  imageInstances[0].onload({currentTarget: firstCanvasImage} as any);
  imageInstances[1].onload({currentTarget: secondCanvasImage} as any);
  return expect(imageMapPromise).resolves.toEqual(
    new Map([
      [firstSource, firstCanvasImage],
      [secondSource, secondCanvasImage],
    ])
  );
});
