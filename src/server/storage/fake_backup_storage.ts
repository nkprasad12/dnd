import fs from 'fs';
import path from 'path';
import {BackupStorage} from '_server/storage/backup_storage';

export const BACKUP_DIR = '_tmp/fake_backup_storage';

/** Implementation of BackupStorage that saves to a subdirectory. */
export class FakeBackupStorage extends BackupStorage {
  constructor() {
    super();
    fs.mkdirSync(BACKUP_DIR, {recursive: true});
  }

  async filesInDir(remotePath: string): Promise<string[]> {
    const root = path.join(BACKUP_DIR, remotePath);
    const contents = await fs.promises.readdir(root);
    const files: string[] = [];
    for (const file of contents) {
      const stats = await fs.promises.stat(path.join(root, file));
      if (stats.isFile()) {
        files.push(file);
      }
    }
    return files;
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    const source = path.join(BACKUP_DIR, remotePath);
    await fs.promises.mkdir(path.dirname(source), {recursive: true});
    await fs.promises.mkdir(path.dirname(localPath), {recursive: true});
    return fs.promises.copyFile(source, localPath);
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    const dest = path.join(BACKUP_DIR, remotePath);
    await fs.promises.mkdir(path.dirname(dest), {recursive: true});
    await fs.promises.mkdir(path.dirname(localPath), {recursive: true});
    return fs.promises.copyFile(localPath, dest);
  }
}
