import fs from 'fs';
import mockfs from 'mock-fs';
import path from 'path';
import {
  BACKUP_DIR,
  FakeBackupStorage,
} from '_server/storage/fake_backup_storage';

beforeEach(() => {
  mockfs({});
});

afterEach(() => {
  mockfs.restore();
});

test('filesInDir ', async (done) => {
  mockfs({[`${BACKUP_DIR}/dir`]: {foo1: 'bar1', foo2: 'bar2'}});
  const backup = new FakeBackupStorage();

  const files = await backup.filesInDir('dir');
  expect(files.length).toBe(2);
  expect(files).toContain('foo1');
  expect(files).toContain('foo2');
  done();
});

test('filesInDir ', async (done) => {
  mockfs({
    [`${BACKUP_DIR}/dir`]: {foo1: 'bar1', foo2: 'bar2'},
  });
  const backup = new FakeBackupStorage();
  const dest = 'local/dir/foo1';

  await backup.downloadFile('dir/foo1', dest);
  const contents = fs.readFileSync(dest).toString();
  expect(contents).toBe('bar1');
  done();
});

test('filesInDir ', async (done) => {
  mockfs({
    'local/dir': {foo1: 'bar1'},
  });
  const backup = new FakeBackupStorage();
  const dest = 'remote/dir/foo1';

  await backup.uploadFile('local/dir/foo1', dest);
  const contents = fs.readFileSync(path.join(BACKUP_DIR, dest)).toString();
  expect(contents).toBe('bar1');
  done();
});
