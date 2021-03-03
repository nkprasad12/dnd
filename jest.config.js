module.exports = {
  'roots': [
    '<rootDir>/src',
  ],
  'testMatch': [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  'transform': {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  'moduleNameMapper': {
    '_common/(.*)': '<rootDir>/src/common/$1',
    '_client/(.*)': '<rootDir>/src/client/$1',
    '_server/(.*)': '<rootDir>/src/server/$1',
  },
  'collectCoverageFrom': [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
