export class LoadedImage {
  image: CanvasImageSource;
  source: string;

  constructor(image: CanvasImageSource, source: string) {
    this.image = image;
    this.source = source;
  }

  deepCopy(): LoadedImage {
    return new LoadedImage(this.image, this.source);
  }
}

function loadImage(source: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.src = source;
    image.onload = (event: Event) => {
      let loadedImage = new LoadedImage(<CanvasImageSource>event.currentTarget, source);
      resolve(loadedImage);
    }
    image.onerror = () => {
      reject("Failed to load image");
    }
  });
}

/** Loads all the images requested in the URLs in the input array. */
export function loadImages(sources: Array<string>): Promise<Map<string, CanvasImageSource>> {
  let promises = []
  for (let source of sources) {
    promises.push(loadImage(source));
  }
  return Promise.all(promises)
    .then((res) => {
      let imageMap = new Map();
      for (let loadedImage of res) {
        imageMap.set(loadedImage.source, loadedImage.image);
      }
      return imageMap;
    });
}
