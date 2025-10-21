#!/usr/bin/env node

/**
 * CLI wrapper that uses tsx to run the TypeScript CLI
 * This allows us to distribute TypeScript files without needing to compile them
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
