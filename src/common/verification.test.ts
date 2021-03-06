import {isStringArray} from '_common/verification';


test('isStringArray on empty array returns true', () => {
  expect(isStringArray([])).toBe(true);
});

test('isStringArray on string array returns true', () => {
  expect(isStringArray(['43', '32'])).toBe(true);
});

test('isStringArray on partial array returns false', () => {
  expect(isStringArray([43, '32'])).toBe(false);
});

test('isStringArray on not strings returns false', () => {
  expect(isStringArray([['32'], ['43']])).toBe(false);
});
