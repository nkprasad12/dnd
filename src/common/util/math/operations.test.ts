import {modulo} from '_common/util/math/operations';

describe('modulo', () => {
  it('returns expected for positive n smaller than m', () => {
    expect(modulo(2, 5)).toBe(2);
  });

  it('returns expected for negative n', () => {
    expect(modulo(-2, 5)).toBe(3);
  });

  it('returns expected for n >= m', () => {
    expect(modulo(5, 5)).toBe(0);
  });

  it('throws on illegal m', () => {
    expect(() => modulo(5, 0)).toThrow();
  });
});
