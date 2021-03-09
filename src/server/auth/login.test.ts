import mockfs from 'mock-fs';
import {setupLogin} from '_server/auth/login';
import express from 'express';
import passport from 'passport';

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

test('setupLogin no secret key throws', () => {
  expect(() => setupLogin(express(), passport)).toThrow();
});

test('setupLogin secret key does not throw', () => {
  process.env.SECRET_KEY = 'key';
  setupLogin(express(), passport);
});
