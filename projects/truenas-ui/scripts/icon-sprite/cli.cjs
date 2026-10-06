#!/usr/bin/env node

/**
 * CLI wrapper that uses tsx to run the TypeScript CLI
 * This allows us to distribute TypeScript files without needing to compile them
 *
 * `.cjs`, not `.js`, and the extension is the fix for #362 rather than a style choice.
 * This file ships to consumers as an ng-package asset, and node decides whether to read a
 * `.js` file as CommonJS or as ESM from the `type` field of the nearest `package.json` — which
 * for the published package is written by ng-packagr, not by this repo. 0.8.2 was the first
 * release where ng-packagr emitted `"type": "module"`, and the same bytes that had worked in
 * 0.7.12 became ESM and died on the `require` below with `ReferenceError: require is not
 * defined in ES module scope`, before generating anything. A `.cjs` file is CommonJS whatever
 * any manifest says, so the generated field cannot reach it.
 *
 * Renaming this back to `.js` reopens #362. `scripts/package-contract/bin-module-scope.spec.ts`
 * fails if anything does.
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = __dirname;
const cliPath = path.join(scriptDir, 'cli-main.ts');

// Use npx to run tsx, which will find it in node_modules
const child = spawn('npx', ['tsx', cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: process.platform === 'win32'
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start tsx:', err.message);
  console.error('Make sure tsx is installed as a dependency of truenas-ui.');
  process.exit(1);
});
