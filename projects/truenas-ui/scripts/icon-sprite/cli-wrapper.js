#!/usr/bin/env node

/**
 * CLI wrapper that uses tsx to run the TypeScript CLI
 * This allows us to distribute TypeScript files without needing to compile them
 */

const { spawn } = require('child_process');
const path = require('path');

// Get the directory where this script is located
const scriptDir = __dirname;
const tsxPath = path.join(scriptDir, '../../node_modules/.bin/tsx');
const cliPath = path.join(scriptDir, 'cli-main.ts');

// Check if tsx exists in the package
const fs = require('fs');
if (!fs.existsSync(path.join(scriptDir, '../../node_modules/tsx'))) {
  console.error('Error: tsx is required but not found.');
  console.error('This should have been installed as a dependency of truenas-ui.');
  process.exit(1);
}

// Spawn tsx to run the TypeScript CLI
const child = spawn('node', [tsxPath, cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
