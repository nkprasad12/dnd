/* istanbul ignore file */

import {Storage} from '@google-cloud/storage';
import {checkDefined} from '_common/preconditions';
import {BackupStorage} from '_server/storage/backup_storage';

export class GoogleCloudStorage extends BackupStorage {
  GCS_BUCKET = checkDefined(process.env.GCS_BUCKET);

  storage = new Storage();

  async filesInDir(remotePath: string): Promise<string[]> {
    const files = await this.storage
      .bucket(this.GCS_BUCKET)
      .getFiles({prefix: remotePath});
    return files[0].map((file) => file.name);
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    console.log(`Attempting to download ${remotePath} to ${localPath}`);
    const blob = this.storage.bucket(this.GCS_BUCKET).file(remotePath);
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

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    console.log(`Attempting to upload ${localPath} to ${remotePath}`);
    return this.storage
      .bucket(this.GCS_BUCKET)
      .upload(localPath, {
        destination: remotePath,
        metadata: {
          // TODO: figure out what cacheControl: 'public, max-age=31536000' does
          cacheControl: 'no-cache',
        },
      })
      .then(() => {});
  }
}
