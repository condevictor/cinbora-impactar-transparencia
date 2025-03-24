// Register path aliases and handle ESM modules
const tsConfigPaths = require('tsconfig-paths');
const { readFileSync } = require('fs');
const { parse } = require('jsonc-parser');

// Parse the tsconfig.json file (handles comments in JSON)
const tsConfig = parse(readFileSync('./tsconfig.json', 'utf-8'));

// Register path aliases
tsConfigPaths.register({
  baseUrl: './dist',
  paths: tsConfig.compilerOptions.paths
});

console.log("Successfully registered path aliases");