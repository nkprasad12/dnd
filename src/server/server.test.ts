import mockfs from 'mock-fs';
import supertest from 'supertest';
import {checkDefined} from '_common/preconditions';

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
    supertest.SuperTest<supertest.Test>|undefined = undefined;

function request(): supertest.SuperTest<supertest.Test> {
  return checkDefined(requestSingleton);
}

beforeAll(() => {
  jest.resetModules();
  requestSingleton = supertest(prepareServer());
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

beforeEach(() => {
  mockfs({'data/images': {}});
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
