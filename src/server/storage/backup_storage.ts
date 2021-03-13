export abstract class BackupStorage {
  /** Returns the names of all files in the given directory. */
  abstract filesInDir(remotePath: string): Promise<string[]>;

  /** Downloads the file at the given path to the specified local location. */
  abstract downloadFile(remotePath: string, localPath: string): Promise<void>;

  /** Uploads the file at the given path to the specified remote location. */
  abstract uploadFile(localPath: string, remotePath: string): Promise<void>;
}
