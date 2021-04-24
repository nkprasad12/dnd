import mockfs from 'mock-fs';
import path from 'path';
import supertest from 'supertest';

import {checkDefined} from '_common/preconditions';
import {FakeBackupStorage} from '_server/storage/fake_backup_storage';
import {ROOT} from '_server/util/file_util';

const EXPECTED_FILE = 'Hasdrubal.txt';
const ORIGINAL_ENV = process.env;
process.env = {...ORIGINAL_ENV};

process.env.GOOGLE_KEY = 'Hamilcar';
process.env.GOOGLE_APPLICATION_CREDENTIALS = EXPECTED_FILE;
process.env.SECRET_KEY = 'key';
process.env.ADMIN_USER = 'user';
process.env.ADMIN_PASSWORD = 'password';
process.env.GCS_BUCKET = 'bucket';

import {prepareServer} from './server';

let requestSingleton:
  | supertest.SuperTest<supertest.Test>
  | undefined = undefined;

function request(): supertest.SuperTest<supertest.Test> {
  return checkDefined(requestSingleton);
}

jest.mock('_server/storage/google_cloud_storage', () => {
  return {
    GoogleCloudStorage: FakeBackupStorage,
  };
});

beforeAll(() => {
  jest.resetModules();
  requestSingleton = supertest.agent(prepareServer());
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

const TEMPLATE_ROOT = path.join(ROOT, 'public', 'templates');
const LOGIN_PAGE = '<html>login page</html>';

beforeEach(() => {
  mockfs({
    [TEMPLATE_ROOT]: {
      'login.html': LOGIN_PAGE,
    },
  });
});

afterEach(() => {
  mockfs.restore();
});

test('Unauthenticated static request performs redirect', async (done) => {
  const response = await request().get('/templates/board_tools.html');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated page request performs redirect', async (done) => {
  const response = await request().get('/boardTools');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated non-existant route performs redirect', async (done) => {
  const response = await request().get('/notEvenARoute');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated retrieve image performs redirect', async (done) => {
  const response = await request().get('/retrieve_image/test.png');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated home route succeeds', async (done) => {
  const response = await request().get('/');

  expect(response.status).toBe(200);
  expect(response.text).toBe(LOGIN_PAGE);
  done();
});

test('Authentication fail redirects to login', async (done) => {
  const response = await request().post('/');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});
