import {getOrigin} from '_client/common/get_origin';
import {Point} from '_common/coordinates';
import {checkState} from '_common/preconditions';
import {gridDimensions} from '_common/util/grid';

export class LoadedImage {
  constructor(readonly image: CanvasImageSource, readonly source: string) {}
}

const IMAGE_TYPES: string[] = ['image/jpg', 'image/jpeg', 'image/png'];
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

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export async function handleImageUpload(
  event: HTMLInputEvent
): Promise<LoadedImage> {
  if (event?.target?.files === null || event.target.files.length === 0) {
    return Promise.reject(new Error('File upload event was null'));
  }
  const file: File = event.target.files[0];
  if (!IMAGE_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Invalid file type for upload'));
  }

  const loadImagePromise = loadImageFromFile(file);
  const saveImagePromise = saveImageToServer(file);
  const promises = await Promise.all([loadImagePromise, saveImagePromise]);
  return new LoadedImage(promises[0], promises[1]);
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      const result = event.target?.result;
      if (result === null || result === undefined) {
        reject(new Error('File result was null or undefined!'));
        return;
      }
      if (typeof result != 'string') {
        reject(new Error('File result was not string!'));
        return;
      }
      image.src = result;
      resolve(image);
    };
    reader.readAsDataURL(file);
  });
}

async function saveImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getOrigin() + '/uploadImage', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  const path = SERVER_PREFIX + '/retrieve_image/' + data.path;
  return path;
}
