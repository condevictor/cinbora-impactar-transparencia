/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest', // Adicione esta linha para suportar ES Modules
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@aws-sdk|mime)', // Adicione esta linha para transformar o módulo mime
  ],
  moduleNameMapper: {
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@routeParams/(.*)$": "<rootDir>/src/routeParams/$1",
  },
};