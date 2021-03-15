import {FakeImage} from '_client/utils/fake_image';

const OriginalImage = global.Image;

afterEach(() => {
  global.Image = OriginalImage;
  FakeImage.invokeBeforeEach();
});

describe('invokeBeforeAll', () => {
  test('with false replaces Image', () => {
    // @ts-ignore
    expect(global.Image === FakeImage.FakeImage).toBe(false);
    FakeImage.invokeBeforeAll(false);
    expect(global.Image).toBe(FakeImage.FakeImage);
  });

  test('with true replaces Image', () => {
    // @ts-ignore
    expect(global.Image === FakeImage.FakeImage).toBe(false);
    FakeImage.invokeBeforeAll(true);
    expect(global.Image).toBe(FakeImage.FakeImage);
  });

  test('with true starts autoloading', () => {
    FakeImage.invokeBeforeAll(true);
    const image = new FakeImage.FakeImage();
    expect(image.hasAutoloaded).toBe(false);

    jest.runOnlyPendingTimers();
    expect(image.onLoadCalled).toBe(true);
    expect(image.hasAutoloaded).toBe(true);
  });
});

test('invokeBeforeEach clears instances', () => {
  new FakeImage.FakeImage();
  FakeImage.invokeBeforeEach();
  expect(FakeImage.instances.length).toBe(0);
});

test('new FakeImage instances are added to list', () => {
  const image = new FakeImage.FakeImage();
  expect(FakeImage.instances.length).toBe(1);
  expect(FakeImage.instances[0]).toBe(image);
});

test('invokeAfterAll restores original image', () => {
  expect(global.Image).toBe(OriginalImage);
  FakeImage.invokeBeforeAll();
  FakeImage.invokeAfterAll();
  expect(global.Image).toBe(OriginalImage);
});
