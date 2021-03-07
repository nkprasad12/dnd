import {Storage} from '@google-cloud/storage';
import fsPromises from 'fs';
import path from 'path';

import {checkDefined} from '_common/preconditions';
import {ROOT} from '_server/util/file_util';

const GCS_BUCKET = checkDefined(process.env.GCS_BUCKET);
const UPLOAD_FOLDER = 'data/images';
const DB_FOLDER = 'data/server_db';
const GCS_ROOT = 'DenJonver/';

type ExpressFile = Express.Multer.File;

const storage = new Storage();


async function downloadFile(
    remotePath: string, localPath: string): Promise<void> {
  console.log(`Attempting to download ${remotePath} to ${localPath}`);
  const blob = storage.bucket(GCS_BUCKET).file(remotePath);
  // TODO: Keep track of what we've already checked
  // also, if there's a way to check the entire dir contents
  try {
    const exists = await blob.exists();
    if (!exists[0]) {
      return Promise.reject(new Error(`File ${remotePath} was not found!`));
    }
  } catch (error) {
    console.log('Error while checking if file exists!');
    console.log(error);
    return Promise.reject(new Error(`File ${remotePath} was not found!`));
  }
  return blob.download({destination: localPath}).then(() => {});
}

async function uploadFile(
    localPath: string, remotePath: string): Promise<void> {
  console.log(`Attempting to upload ${localPath} to ${remotePath}`);
  return storage.bucket(GCS_BUCKET).upload(
      localPath,
      {
        destination: remotePath,
        metadata: {
          // TODO: figure out what cacheControl: 'public, max-age=31536000' does
          cacheControl: 'no-cache',
        },
      })
      .then(() => {});
}

class StorageUtil {
  private newFiles: Map<string, string> = new Map();

  /** Saves the input image file with the given key. */
  saveImage(file: ExpressFile): string {
    const imageKey = file.originalname;
    const dest = path.join(ROOT, UPLOAD_FOLDER, imageKey);
    const gcsDest = path.join(GCS_ROOT, UPLOAD_FOLDER, imageKey);
    fsPromises.renameSync(file.path, dest);
    this.newFiles.set(dest, gcsDest);
    // TODO: Do this once requests have stopped
    uploadFile(dest, gcsDest);
    return imageKey;
  }

  /** Returns the path of the image with the given key. */
  async getImagePath(imageKey: string): Promise<string> {
    const dest = path.join(ROOT, UPLOAD_FOLDER, imageKey);
    // TODO: Make this check async.
    if (!fsPromises.existsSync(dest)) {
      const gcsDest = path.join(GCS_ROOT, UPLOAD_FOLDER, imageKey);
      try {
        await downloadFile(gcsDest, dest);
      } catch {
        return Promise.reject(new Error('File does not exist: ' + imageKey));
      }
      return dest;
    }
    return dest;
  }

  /** Saves the given contents to the input file key. */
  saveToFile(contents: string, fileKey: string): void {
    const dest = path.join(ROOT, DB_FOLDER, fileKey);
    // TODO: Should this be async?
    fsPromises.writeFileSync(dest, contents);
    const gcsDest = path.join(GCS_ROOT, DB_FOLDER, fileKey);
    this.newFiles.set(dest, gcsDest);
    uploadFile(dest, gcsDest);
  }

  /** Returns the contents from the input file key. */
  async loadFromFile(fileKey: string): Promise<string> {
    const dest = path.join(ROOT, DB_FOLDER, fileKey);
    if (!fsPromises.existsSync(dest)) {
      const gcsDest = path.join(GCS_ROOT, DB_FOLDER, fileKey);
      try {
        await downloadFile(gcsDest, dest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    const buffer = await fsPromises.promises.readFile(dest);
    const result = buffer.toString();
    console.log(`Loaded ${fileKey} successfully`);
    return result;
  }
}

let cachedStorageUtil: StorageUtil|undefined = undefined;

export function storageUtil(): StorageUtil {
  if (cachedStorageUtil === undefined) {
    console.log('Creating new storage util');
    cachedStorageUtil = new StorageUtil();
  }
  return cachedStorageUtil;
}
