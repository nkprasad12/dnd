import path from 'path';

const ALLOWED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg'];

/** Given a directory, returns the absolute parth to the parent. */
export function parentOf(directory: string): string {
  return directory.split(path.sep).slice(0, -1).join(path.sep);
}

/** Returns the application root directory. */
export function getRoot(): string {
  return parentOf(__dirname);
}

export function isImage(file: Express.Multer.File): boolean {
  const fileType = path.extname(file.originalname).toLowerCase();
  return ALLOWED_IMAGE_TYPES.includes(fileType);
}
