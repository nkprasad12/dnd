import {getOrigin} from '/src/common/common';

export class LoadedImage {
  constructor(readonly image: CanvasImageSource, readonly source: string) {}

  deepCopy(): LoadedImage {
    return new LoadedImage(this.image, this.source);
  }
}

const SERVER_PREFIX = 'server@';

export function loadImage(source: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = source.replace(SERVER_PREFIX, getOrigin());
    image.onload = (event: Event) => {
      const loadedImage =
          new LoadedImage(<CanvasImageSource>event.currentTarget, source);
      resolve(loadedImage);
    };
    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

/** Loads all the images requested in the URLs in the input array. */
export async function loadImages(
    sources: Array<string>): Promise<Map<string, CanvasImageSource>> {
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
