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

// Pre-load mime module and make it available immediately
(async () => {
  try {
    // Import the ESM module dynamically
    const mimeModule = await import('mime');
    
    // Create a more reliable monkey patch that handles both direct and nested requires
    const Module = require('module');
    const originalResolveFilename = Module._resolveFilename;
    
    Module._resolveFilename = function(request, parent, isMain, options) {
      if (request === 'mime') {
        return request; // Return the request as-is to trigger our custom require
      }
      return originalResolveFilename(request, parent, isMain, options);
    };
    
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function(path) {
      if (path === 'mime') {
        return mimeModule.default; // Return the ESM module directly
      }
      return originalRequire.call(this, path);
    };
    
    console.log("Successfully bridged ESM module 'mime' to CommonJS");
  } catch (err) {
    console.error("Failed to load 'mime' module:", err);
    process.exit(1);
  }
})();