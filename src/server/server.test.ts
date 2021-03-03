import fs from 'fs';
import supertest from 'supertest';

const EXPECTED_FILE = 'Hasdrubal.txt';
const ORIGINAL_ENV = process.env;
process.env = {...ORIGINAL_ENV};

process.env.GOOGLE_KEY = 'Hamilcar';
process.env.GOOGLE_APPLICATION_CREDENTIALS = EXPECTED_FILE;
process.env.SECRET_KEY = 'key';
process.env.ADMIN_USER = 'user';
process.env.ADMIN_PASSWORD = 'password';
process.env.GCS_BUCKET = 'bucket';

import {server} from './server';
const request = supertest(server);

function removeOutputs() {
  if (fs.existsSync(EXPECTED_FILE)) {
    fs.rmSync(EXPECTED_FILE);
  }
  // TODO: data/images is created by multer. Figure out a way either to inject
  // this, or to run the tests in a sandboxed environment.
}

beforeAll(() => {
  jest.resetModules();
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
  removeOutputs();
});


test('Unauthenticated static request performs redirect', async (done) => {
  const response = await request.get('/templates/board_tools.html');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated page request performs redirect', async (done) => {
  const response = await request.get('/boardTools');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated non-existant route performs redirect', async (done) => {
  const response = await request.get('/notEvenARoute');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});

test('Unauthenticated retrieve image performs redirect', async (done) => {
  const response = await request.get('/retrieve_image/test.png');

  expect(response.status).toBe(302);
  expect(response.header.location).toBe('/');
  done();
});
