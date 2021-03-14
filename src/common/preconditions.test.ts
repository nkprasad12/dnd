import {checkDefined, checkState} from './preconditions';

test('checkDefined returns original', () => {
  const testObj = {x: 'test'};
  expect(testObj === checkDefined(testObj)).toBe(true);
});

test('checkDefined throws on null', () => {
  expect(() => checkDefined(null)).toThrow();
});

test('checkDefined throws on undefined', () => {
  expect(() => checkDefined(undefined)).toThrow();
});

test('checkDefined throws on undefined with name', () => {
  expect(() => checkDefined(undefined, 'Crassus')).toThrowError('Crassus');
});

test('checkState throws on false', () => {
  expect(() => checkState(false, 'Testing')).toThrow();
});

test('checkState does not throw on true.', () => {
  checkState(true, 'Testing');
});
