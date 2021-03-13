import fsPromises from 'fs';
import path from 'path';
import {BackupStorage} from '_server/storage/backup_storage';
import {GoogleCloudStorage} from '_server/storage/google_cloud_storage';

import {ROOT} from '_server/util/file_util';

const UPLOAD_FOLDER = 'data/images';
const DB_FOLDER = 'data/server_db';
const GCS_ROOT = 'DenJonver/';

type ExpressFile = Express.Multer.File;

export class StorageUtil {
  constructor(private readonly backup: BackupStorage) {}

  private newFiles: Map<string, string> = new Map();

  /** Saves the input image file with the given key. */
  saveImage(file: ExpressFile): string {
    const imageKey = file.originalname;
    const dest = path.join(ROOT, UPLOAD_FOLDER, imageKey);
    const gcsDest = path.join(GCS_ROOT, UPLOAD_FOLDER, imageKey);
    fsPromises.renameSync(file.path, dest);
    this.newFiles.set(dest, gcsDest);
    // TODO: Do this once requests have stopped
    this.backup.uploadFile(dest, gcsDest);
    return imageKey;
  }

  /** Returns the path of the image with the given key. */
  async getImagePath(imageKey: string): Promise<string> {
    const dest = path.join(ROOT, UPLOAD_FOLDER, imageKey);
    // TODO: Make this check async.
    if (!fsPromises.existsSync(dest)) {
      const gcsDest = path.join(GCS_ROOT, UPLOAD_FOLDER, imageKey);
      try {
        await this.backup.downloadFile(gcsDest, dest);
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
    this.backup.uploadFile(dest, gcsDest);
  }

  /** Returns the contents from the input file key. */
  async loadFromFile(fileKey: string): Promise<string> {
    console.log('loadFromFile: ' + fileKey);
    const dest = path.join(ROOT, DB_FOLDER, fileKey);
    if (!fsPromises.existsSync(dest)) {
      const gcsDest = path.join(GCS_ROOT, DB_FOLDER, fileKey);
      try {
        await this.backup.downloadFile(gcsDest, dest);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    const buffer = await fsPromises.promises.readFile(dest);
    const result = buffer.toString();
    console.log(`Loaded ${fileKey} successfully`);
    return result;
  }

  async filesInRemoteDir(dirPath: string): Promise<string[]> {
    const remoteDir = path.join(GCS_ROOT, DB_FOLDER, dirPath);
    return this.backup.filesInDir(remoteDir);
  }
}

let cachedStorageUtil: StorageUtil | undefined = undefined;

/* istanbul ignore next */
export function storageUtil(): StorageUtil {
  if (cachedStorageUtil === undefined) {
    console.log('Creating new storage util');
    cachedStorageUtil = new StorageUtil(new GoogleCloudStorage());
  }
  return cachedStorageUtil;
}
