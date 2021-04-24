import path from 'path';

const ALLOWED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg'];

/** The application root directory. (Server starts in root/build) */
export const ROOT = parentOf(parentOf(parentOf(__dirname)));

/** Given a directory, returns the absolute path to the parent. */
export function parentOf(directory: string): string {
  return directory.split(path.sep).slice(0, -1).join(path.sep);
}

export function isImage(file: Express.Multer.File): boolean {
  const fileType = path.extname(file.originalname).toLowerCase();
  return ALLOWED_IMAGE_TYPES.includes(fileType);
}
