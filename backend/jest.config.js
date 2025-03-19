export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
  '^.+\\.jsx?$': 'babel-jest',
};
export const transformIgnorePatterns = [
  '/node_modules/',
];
export const moduleNameMapper = {
  '@config/(.*)': '<rootDir>/src/config/$1',
  '@modules/(.*)': '<rootDir>/src/modules/$1',
  '@shared/(.*)': '<rootDir>/src/shared/$1',
};