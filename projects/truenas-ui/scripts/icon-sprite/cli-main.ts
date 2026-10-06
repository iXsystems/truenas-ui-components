#!/usr/bin/env tsx

/**
 * CLI entry point for truenas-icons sprite generation
 *
 * Usage:
 *   npx truenas-icons generate [options]
 *   npx truenas-icons validate [options]
 *
 * Options:
 *   --src <dirs>        Comma-separated source directories to scan (default: ./src/lib,./src/app)
 *   --output <dir>      Output directory for sprite files (default: ./src/assets/icons)
 *   --url <path>        Runtime URL path for sprite (defaults to output dir with './' stripped)
 *   --custom <dir>      Custom icons directory (optional)
 *   --config <file>     Configuration file path (default: truenas-icons.config.js)
 *   --help              Show help
 *
 * Configuration File:
 *   Create truenas-icons.config.js in your project root, as ESM or as CommonJS —
 *   either is read. A .cjs, .mjs, .cts, .mts or .json file is read too when named
 *   with --config. For TypeScript prefer .mts or .cts: a bare .ts takes its module
 *   kind from the nearest package.json, so without "type": "module" tsx reads it as
 *   CommonJS and leaves import.meta undefined — which is warned about rather than
 *   loaded quietly. See `lib/load-config.ts` for which shapes are read and how.
 *
 *   export default {
 *     srcDirs: ['./src/lib', './src/app'],
 *     outputDir: './src/assets/icons',
 *     customIconsDir: './custom-icons'
 *   };
 */

import { generateSprite } from './generate-sprite.js';
import { loadConfig } from './lib/load-config.js';
import { validateIcons, printValidationReport } from './lib/validate-icons.js';
import { resolveConfig } from './sprite-config-interface.js';

const HELP_TEXT = `
truenas-icons - Icon sprite generation for TrueNAS UI components

Usage:
  npx truenas-icons generate [options]
  npx truenas-icons validate [options]

Commands:
  generate            Scan source files and generate the icon sprite
  validate            Check for missing or stale icons without rebuilding

Options:
  --src <dirs>        Comma-separated source directories to scan
                      Default: ./src/lib,./src/app

  --output <dir>      Output directory for sprite files
                      Default: ./src/assets/icons

  --url <path>        Runtime URL path for sprite (in sprite-config.json)
                      Default: output dir with './' stripped
                      Use when build transforms paths (e.g., Angular strips 'src/')
                      Example: --output ./src/assets/tn-icons --url assets/tn-icons

  --custom <dir>      Custom icons directory (optional)
                      Icons will be prefixed with 'tn-'

  --config <file>     Configuration file path
                      Default: truenas-icons.config.js

  --help              Show this help message

Configuration File:
  Create truenas-icons.config.js in your project root. Either module form is
  read, so write it the way the rest of your project's .js files are written.

  export default {
    srcDirs: ['./src/lib', './src/app'],
    outputDir: './src/assets/icons',
    customIconsDir: './custom-icons'
  };

  module.exports = {
    srcDirs: ['./src/lib', './src/app']
  };

  Only truenas-icons.config.js is looked for by default. A .cjs, .mjs or .json
  config is read correctly but is not discovered, so name it with --config:

  npx truenas-icons generate --config truenas-icons.config.cjs

  For a TypeScript config, name it .mts if it is ESM or .cts if it is CommonJS.
  Both are decided by their extension. A bare .ts takes its module kind from the
  nearest package.json instead, so unless that declares "type": "module" it is
  read as CommonJS whatever it contains, leaving import.meta.dirname undefined;
  that case is warned about rather than loaded quietly.

  npx truenas-icons generate --config truenas-icons.config.mts

Examples:
  # Generate with defaults
  npx truenas-icons generate

  # Validate current sprite against code
  npx truenas-icons validate

  # Specify custom source directories
  npx truenas-icons generate --src ./src,./app

  # Specify output directory
  npx truenas-icons generate --output ./public/icons

  # Use custom icons
  npx truenas-icons generate --custom ./my-icons
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    command: null as string | null,
    srcDirs: null as string[] | null,
    outputDir: null as string | null,
    spriteUrlPath: null as string | null,
    customIconsDir: null as string | null,
    configFile: 'truenas-icons.config.js',
    showHelp: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.showHelp = true;
    } else if (arg === 'generate' || arg === 'validate') {
      parsed.command = arg;
    } else if (arg === '--src') {
      parsed.srcDirs = args[++i]?.split(',') || null;
    } else if (arg === '--output') {
      parsed.outputDir = args[++i] || null;
    } else if (arg === '--url') {
      parsed.spriteUrlPath = args[++i] || null;
    } else if (arg === '--custom') {
      parsed.customIconsDir = args[++i] || null;
    } else if (arg === '--config') {
      parsed.configFile = args[++i] || parsed.configFile;
    }
  }

  return parsed;
}

async function main() {
  const args = parseArgs();

  if (args.showHelp) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (!args.command || !['generate', 'validate'].includes(args.command)) {
    console.error('Error: No command specified. Use "generate" or "validate".');
    console.log('\nRun "truenas-icons --help" for usage information.');
    process.exit(1);
  }

  try {
    // Load configuration file
    const fileConfig = await loadConfig(args.configFile);

    // Merge configurations (CLI args take precedence)
    const config = {
      srcDirs: args.srcDirs || fileConfig.srcDirs,
      outputDir: args.outputDir || fileConfig.outputDir,
      spriteUrlPath: args.spriteUrlPath || fileConfig.spriteUrlPath,
      customIconsDir: args.customIconsDir || fileConfig.customIconsDir,
      projectRoot: process.cwd(),
    };

    if (args.command === 'generate') {
      console.log('Generating icon sprite...\n');
      await generateSprite(config);
      console.log('\nIcon sprite generated successfully!');
    } else if (args.command === 'validate') {
      console.log('Validating icon sprite...\n');
      const resolved = resolveConfig(config);
      const result = validateIcons(resolved);
      const exitCode = printValidationReport(result);
      process.exit(exitCode);
    }
  } catch (error: any) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
