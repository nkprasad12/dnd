import {
  inRange,
  isGrid,
  isStringArray,
  maybeMerge,
  notUndefined,
  prefer,
} from '_common/verification';

describe('isStringArray', () => {
  it('on empty array returns true', () => {
    expect(isStringArray([])).toBe(true);
  });

  it('on not array returns false', () => {
    expect(isStringArray('notAnArray')).toBe(false);
  });

  it('on string array returns true', () => {
    expect(isStringArray(['43', '32'])).toBe(true);
  });

  it('on partial array returns false', () => {
    expect(isStringArray([43, '32'])).toBe(false);
  });

  it('on not strings returns false', () => {
    expect(isStringArray([['32'], ['43']])).toBe(false);
  });
});

describe('isGrid', () => {
  it('with expected returns true', () => {
    const grid = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    expect(isGrid(grid, 3, 2)).toBe(true);
  });

  it('with incorrect rows returns false', () => {
    const grid = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    expect(isGrid(grid, 3, 4)).toBe(false);
  });

  it('with incorrect cols returns false', () => {
    const grid = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    expect(isGrid(grid, 4, 2)).toBe(false);
  });

  it('with variable cols returns false', () => {
    const grid = [
      [0, 0],
      [0, 0, 0],
      [0, 0],
    ];
    expect(isGrid(grid, 3, 2)).toBe(false);
  });

  it('cols 0 handles correctly', () => {
    const grid: number[] = [];
    expect(isGrid(grid, 0, 2)).toBe(true);
  });

  it('with not array returns false', () => {
    const grid = '[[0, 0], [0, 0], [0, 0]]';
    expect(isGrid(grid, 3, 2)).toBe(false);
  });

  it('with not array column returns false', () => {
    const grid = [[0, 0], '[0, 0]', [0, 0]];
    expect(isGrid(grid, 3, 2)).toBe(false);
  });
});

describe('prefer', () => {
  it('returns backup on null', () => {
    expect(prefer(null, 57)).toBe(57);
  });

  it('returns backup on undefined', () => {
    expect(prefer(null, 57)).toBe(57);
  });

  it('returns backup on null', () => {
    expect(prefer(null, 57)).toBe(57);
  });

  it('returns preferred on undefined', () => {
    expect(prefer(420, 57)).toBe(420);
  });
});

describe('maybeMerge', () => {
  interface TestType {
    num: number;
    str: string;
  }

  function testMerge(testType: TestType, str: string) {
    return {num: testType.num, str: str};
  }

  function baseObject(): TestType {
    return {num: 420, str: 'Praise it'};
  }

  it('returns base on null', () => {
    const base = baseObject();
    expect(maybeMerge(base, null, testMerge)).toBe(base);
  });

  it('returns base on undefined', () => {
    const base = baseObject();
    expect(maybeMerge(base, undefined, testMerge)).toBe(base);
  });

  it('returns merged value otherwise', () => {
    const base = baseObject();
    expect(maybeMerge(base, 'Blaze it', testMerge)).toStrictEqual({
      num: 420,
      str: 'Blaze it',
    });
  });
});

describe('notUndefined', () => {
  it('returns true on defined', () => {
    expect(notUndefined(0)).toBe(true);
  });

  it('returns false on undefined', () => {
    expect(notUndefined(undefined)).toBe(false);
  });
});

describe('inRange', () => {
  it('Returns true for number in inclusive range', () => {
    expect(inRange(7, 1, 10)).toBe(true);
  });

  it('Returns true for number on lower boundary', () => {
    expect(inRange(1, 1, 10)).toBe(true);
  });

  it('Returns true for number on upper boundary', () => {
    expect(inRange(10, 1, 10)).toBe(true);
  });

  it('Returns false for number below range', () => {
    expect(inRange(0, 1, 10)).toBe(false);
  });

  it('Returns false for number above range', () => {
    expect(inRange(11, 1, 10)).toBe(false);
  });
});
