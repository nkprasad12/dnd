import fs from 'fs';
import mockfs from 'mock-fs';
import {DirectoryItems} from 'mock-fs/lib/filesystem';
import path from 'path';
import {
  BACKUP_DIR,
  FakeBackupStorage,
} from '_server/storage/fake_backup_storage';
import {storageUtil} from '_server/storage/storage_util';
import {ROOT} from '_server/util/file_util';

jest.mock('_server/storage/google_cloud_storage', () => {
  return {
    GoogleCloudStorage: FakeBackupStorage,
  };
});

beforeEach(() => {
  mockfs({});
});

afterEach(() => {
  mockfs.restore();
});

const UPLOAD_FOLDER = 'data/images';
const DB_FOLDER = 'data/server_db';
const GCS_ROOT = 'DenJonver/';

const LOCAL_FILE_ROOT = path.join(ROOT, DB_FOLDER);
const REMOTE_FILE_ROOT = path.join(BACKUP_DIR, GCS_ROOT, DB_FOLDER);
const LOCAL_IMAGE_ROOT = path.join(ROOT, UPLOAD_FOLDER);
const REMOTE_IMAGE_ROOT = path.join(BACKUP_DIR, GCS_ROOT, UPLOAD_FOLDER);

test('storageUtil returns singleton', () => {
  const first = storageUtil();
  const second = storageUtil();

  expect(first).toBe(second);
});

test('filesInRemoteDir returns expected', async (done) => {
  mockfs({
    [`${REMOTE_FILE_ROOT}/emperors`]: {
      caligula: 'bootikins',
      pupienus: 'maximus',
    },
  });

  const files = await storageUtil().filesInRemoteDir('emperors');
  expect(files.length).toBe(2);
  expect(files).toContain('caligula');
  expect(files).toContain('pupienus');
  done();
});

test('saveToFile saves to local and remote', async (done) => {
  const bootikins = 'bootikins';
  const caligula = 'caligula.txt';
  await storageUtil().saveToFile(bootikins, caligula);

  const localContents = fs
    .readFileSync(path.join(LOCAL_FILE_ROOT, caligula))
    .toString();
  expect(localContents).toBe(bootikins);
  const remoteContents = fs
    .readFileSync(path.join(REMOTE_FILE_ROOT, caligula))
    .toString();
  expect(remoteContents).toBe(bootikins);
  done();
});

describe('loadFromFile', () => {
  const caligula = 'caligula.txt';
  const bootikins = 'bootikins';

  it('rejects if file does not exist', () => {
    const promise = storageUtil().loadFromFile(caligula);
    return expect(promise).rejects.toBeInstanceOf(Error);
  });

  it('pulls remote if no local copy', async (done) => {
    mockfs({
      [REMOTE_FILE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    await storageUtil().loadFromFile(caligula);
    const localSavedContents = fs
      .readFileSync(path.join(LOCAL_FILE_ROOT, caligula))
      .toString();
    expect(localSavedContents).toBe(bootikins);
    done();
  });

  it('returns expected value if no local copy', async (done) => {
    mockfs({
      [REMOTE_FILE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    const contents = await storageUtil().loadFromFile(caligula);
    expect(contents).toBe(bootikins);
    done();
  });

  it('uses local copy if available', async (done) => {
    mockfs({
      [LOCAL_FILE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    const contents = await storageUtil().loadFromFile(caligula);
    expect(contents).toBe(bootikins);
    done();
  });
});

describe('getImagePath', () => {
  const caligula = 'caligula.png';
  const bootikins = 'bootikins';

  it('rejects on unknown file', () => {
    const promise = storageUtil().getImagePath(caligula);
    return expect(promise).rejects.toBeInstanceOf(Error);
  });

  it('pulls remote if no local file', async (done) => {
    mockfs({
      [REMOTE_IMAGE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    await storageUtil().getImagePath(caligula);
    const localSavedContents = fs
      .readFileSync(path.join(LOCAL_IMAGE_ROOT, caligula))
      .toString();
    expect(localSavedContents).toBe(bootikins);
    done();
  });

  it('returns correct contents if no local file', async (done) => {
    mockfs({
      [REMOTE_IMAGE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    const imagePath = await storageUtil().getImagePath(caligula);
    expect(imagePath).toBe(path.join(LOCAL_IMAGE_ROOT, caligula));
    done();
  });

  it('uses local if available', async (done) => {
    mockfs({
      [LOCAL_IMAGE_ROOT]: {
        [caligula]: bootikins,
      },
    });

    const imagePath = await storageUtil().getImagePath(caligula);
    expect(imagePath).toBe(path.join(LOCAL_IMAGE_ROOT, caligula));
    done();
  });
});

describe('saveImage', () => {
  const EXPRESS_TEMP = 'express_tmp';
  const TEMP_NAME = 'Octavianus.png';
  const ORIGINAL_NAME = 'Gaius.png';
  const FAKE_EXPRESS_FILE: any = {
    originalname: ORIGINAL_NAME,
    path: path.join(EXPRESS_TEMP, TEMP_NAME),
  };
  const MOCK_FILES: DirectoryItems = {
    [EXPRESS_TEMP]: {
      [TEMP_NAME]: 'Give me back my legions!',
    },
    [LOCAL_IMAGE_ROOT]: {},
  };

  it('moves and renames the temp file', () => {
    mockfs(MOCK_FILES);
    const backup = storageUtil().saveImage(FAKE_EXPRESS_FILE).backupStatus;

    const expectedLocation = path.join(LOCAL_IMAGE_ROOT, ORIGINAL_NAME);
    const contents = fs.readFileSync(expectedLocation).toString();
    expect(contents).toBe('Give me back my legions!');
    return backup;
  });

  it('returns the original file name', () => {
    mockfs(MOCK_FILES);
    const result = storageUtil().saveImage(FAKE_EXPRESS_FILE);
    expect(result.imageName).toBe(ORIGINAL_NAME);
    return result.backupStatus;
  });

  it('backs up to permanent storage', async (done) => {
    mockfs(MOCK_FILES);
    const result = storageUtil().saveImage(FAKE_EXPRESS_FILE);
    await result.backupStatus;

    const remoteContents = fs
      .readFileSync(path.join(REMOTE_IMAGE_ROOT, ORIGINAL_NAME))
      .toString();
    expect(remoteContents).toBe('Give me back my legions!');
    done();
  });
});
