import mockfs from 'mock-fs';
import fs from 'fs';

import {writeGoogleCredentials} from './startup_scripts';

const EXPECTED_FILE = 'Hasdrubal.txt';
const ORIGINAL_ENV = process.env;


beforeEach(() => {
  jest.resetModules();
  process.env = {...ORIGINAL_ENV};
  mockfs({});
});

afterEach(() => {
  process.env = {...ORIGINAL_ENV};
  mockfs.restore();
});

test('writeGoogleCredentials without APP_CREDENTIALS throws', () => {
  process.env.GOOGLE_KEY = 'Hamilcar';
  expect(() => writeGoogleCredentials()).toThrow();
});

test('writeGoogleCredentials without GOOGLE_KEY', () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = 'Hasdrubal.txt';
  expect(() => writeGoogleCredentials()).toThrow();
});

test('writeGoogleCredentials writes to file', () => {
  process.env.GOOGLE_KEY = 'Hamilcar';
  process.env.GOOGLE_APPLICATION_CREDENTIALS = EXPECTED_FILE;

  writeGoogleCredentials();

  expect(fs.existsSync(EXPECTED_FILE)).toBe(true);
  expect(fs.readFileSync(EXPECTED_FILE).toString())
      .toBe(process.env.GOOGLE_KEY);
});
