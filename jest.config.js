module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: 'tsconfig.json'
      }],
  },
  testMatch: ['**/tests/**/*.test.(ts|js)'],
};
