import {isImage, parentOf} from './file_util';

test('parentOf returns correct result', () => {
  expect(parentOf('foo/bar/baz')).toBe('foo/bar');
});

test('isImage on png returns true', () => {
  expect(isImage(getFile('trajan.png'))).toBe(true);
  expect(isImage(getFile('trajan.PNG'))).toBe(true);
});

test('isImage on jpeg returns true', () => {
  expect(isImage(getFile('hAdriAn.jpg'))).toBe(true);
  expect(isImage(getFile('trajan.jpeg'))).toBe(true);
  expect(isImage(getFile('hAdriAn.JPG'))).toBe(true);
  expect(isImage(getFile('trajan.JPEG'))).toBe(true);
});

test('isImage on other file types returns true', () => {
  expect(isImage(getFile('Commodus.txt'))).toBe(false);
  expect(isImage(getFile('Caligula.exe'))).toBe(false);
});

function getFile(originalName: string): Express.Multer.File {
  return {
    fieldname: '',
    originalname: originalName,
    encoding: '',
    mimetype: '',
    size: 0,
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from(''),
    // @ts-ignore: this is unused.
    stream: null,
  };
}
