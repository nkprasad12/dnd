import {getOrigin} from '_client/common/get_origin';
import {
  getBackgroundData,
  handleImageUpload,
  LoadedImage,
  loadImage,
  loadImages,
} from '_client/utils/image_utils';
import {FakeImage} from '_client/utils/fake_image';
import {FakeFileReader} from '_client/utils/fake_file_reader';

const realFetch = global.fetch;
const savePath = 'whatever.png';

beforeAll(() => {
  // @ts-ignore
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({path: savePath}),
    })
  );
  FakeImage.invokeBeforeAll(false);
  FakeFileReader.invokeBeforeAll();
});

beforeEach(() => {
  FakeImage.invokeBeforeEach();
});

afterEach(() => {
  FakeFileReader.invokeAfterEach();
});

afterAll(() => {
  global.fetch = realFetch;
  FakeImage.invokeAfterAll();
  FakeFileReader.invokeAfterAll();
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
  const data = getBackgroundData(loadedImage, 10, {x: 0, y: 0});

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

  it('computes rows and columns correctly with offset', () => {
    const data = getBackgroundData(loadedImage, 10, {x: 2, y: 0});
    expect(data.cols).toBe(7);
    expect(data.rows).toBe(42);
    expect(data.offset).toStrictEqual({x: 2, y: 0});
  });
});

describe('handleImageUpload', () => {
  it('rejects on null files', async () => {
    const event: any = {target: {files: null}};
    return expect(handleImageUpload(event)).rejects.toThrowError('was null');
  });

  it('rejects on empty files', async () => {
    const event: any = {target: {files: []}};
    return expect(handleImageUpload(event)).rejects.toThrowError('was null');
  });

  it('rejects on disallowed type', async () => {
    const event: any = {target: {files: [{type: 'image/gif'}]}};
    return expect(handleImageUpload(event)).rejects.toThrowError(
      'Invalid file type'
    );
  });

  it('rejects on failed load', async () => {
    const uploadEvent: any = {target: {files: [{type: 'image/png'}]}};
    FakeFileReader.setOnLoadEvent({target: {result: null}} as any);
    return expect(handleImageUpload(uploadEvent)).rejects.toThrowError(
      'File result was null or undefined'
    );
  });

  it('rejects on incorrect load type', async () => {
    const uploadEvent: any = {target: {files: [{type: 'image/png'}]}};
    FakeFileReader.setOnLoadEvent({target: {result: 5}} as any);
    return expect(handleImageUpload(uploadEvent)).rejects.toThrowError(
      'result was not string'
    );
  });

  it('resolves to expected on success', async (done) => {
    const uploadEvent: any = {target: {files: [{type: 'image/png'}]}};
    FakeFileReader.setOnLoadEvent({target: {result: 'imagebytes'}} as any);
    const result = await handleImageUpload(uploadEvent);

    expect(result.source).toBe('server@/retrieve_image/' + savePath);
    done();
  });
});
