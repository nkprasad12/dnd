import {getOrigin} from '_client/common/get_origin';
import {Point} from '_common/coordinates';
import {checkState} from '_common/preconditions';
import {gridDimensions} from '_common/util/grid';

export class LoadedImage {
  constructor(readonly image: CanvasImageSource, readonly source: string) {}
}

const SERVER_PREFIX = 'server@';

export function loadImage(source: string): Promise<LoadedImage> {
  checkState(
    source.startsWith(SERVER_PREFIX),
    'loadImage called with invalid source!'
  );
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = (event: Event) => {
      const loadedImage = new LoadedImage(
        <CanvasImageSource>event.currentTarget,
        source
      );
      resolve(loadedImage);
    };
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    image.src = source.replace(SERVER_PREFIX, getOrigin());
  });
}

/** Loads all the images requested in the URLs in the input array. */
export async function loadImages(
  sources: Array<string>
): Promise<Map<string, CanvasImageSource>> {
  const promises = [];
  for (const source of sources) {
    promises.push(loadImage(source));
  }
  const res = await Promise.all(promises);
  const imageMap = new Map();
  for (const loadedImage of res) {
    imageMap.set(loadedImage.source, loadedImage.image);
  }
  return imageMap;
}

export interface BackgroundData {
  backgroundImage: LoadedImage;
  width: number;
  height: number;
  cols: number;
  rows: number;
}

export function getBackgroundData(
  image: LoadedImage,
  tileSize: number,
  gridOffset: Point
): BackgroundData {
  const width = <number>image.image.width;
  const height = <number>image.image.height;
  const dimensions = gridDimensions(width, height, tileSize, gridOffset);
  return {
    backgroundImage: image,
    width: width,
    height: height,
    cols: dimensions.cols,
    rows: dimensions.rows,
  };
}
