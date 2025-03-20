/** @type {import('ts-jest').JestConfigWithTsJest} **/
export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
  '^.+\\.jsx?$': 'babel-jest',
};
export const transformIgnorePatterns = [
  '/node_modules/(?!@aws-sdk|mime)',
];
export const moduleNameMapper = {
  "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  "^@config/(.*)$": "<rootDir>/src/config/$1",
  "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
  "^@routeParams/(.*)$": "<rootDir>/src/routeParams/$1",
};