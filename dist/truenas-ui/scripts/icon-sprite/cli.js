#!/usr/bin/env node

/**
 * CLI entry point for truenas-icons sprite generation
 *
 * Usage:
 *   npx truenas-icons generate [options]
 *
 * Options:
 *   --src <dirs>        Comma-separated source directories to scan (default: ./src/lib,./src/app)
 *   --output <dir>      Output directory for sprite files (default: ./src/assets/icons)
 *   --custom <dir>      Custom icons directory (optional)
 *   --config <file>     Configuration file path (default: truenas-icons.config.js)
 *   --help              Show help
 *
 * Configuration File:
 *   Create truenas-icons.config.js in your project root:
 *
 *   export default {
 *     srcDirs: ['./src/lib', './src/app'],
 *     outputDir: './src/assets/icons',
 *     customIconsDir: './custom-icons'
 *   };
 */

const { generateSprite } = require('./generate-sprite.js');
const fs = require('fs');
const path = require('path');

const HELP_TEXT = `
truenas-icons - Icon sprite generation for TrueNAS UI components

Usage:
  npx truenas-icons generate [options]

Options:
  --src <dirs>        Comma-separated source directories to scan
                      Default: ./src/lib,./src/app

  --output <dir>      Output directory for sprite files
                      Default: ./src/assets/icons

  --custom <dir>      Custom icons directory (optional)
                      Icons will be prefixed with 'ix-'

  --config <file>     Configuration file path
                      Default: truenas-icons.config.js

  --help              Show this help message

Configuration File:
  Create truenas-icons.config.js in your project root:

  export default {
    srcDirs: ['./src/lib', './src/app'],
    outputDir: './src/assets/icons',
    customIconsDir: './custom-icons'
  };

Examples:
  # Generate with defaults
  npx truenas-icons generate

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
    command: null,
    srcDirs: null,
    outputDir: null,
    customIconsDir: null,
    configFile: 'truenas-icons.config.js',
    showHelp: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.showHelp = true;
    } else if (arg === 'generate') {
      parsed.command = 'generate';
    } else if (arg === '--src') {
      parsed.srcDirs = args[++i]?.split(',') || null;
    } else if (arg === '--output') {
      parsed.outputDir = args[++i] || null;
    } else if (arg === '--custom') {
      parsed.customIconsDir = args[++i] || null;
    } else if (arg === '--config') {
      parsed.configFile = args[++i] || parsed.configFile;
    }
  }

  return parsed;
}

async function loadConfig(configFile) {
  const configPath = path.resolve(process.cwd(), configFile);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    // Try to load as ES module
    const config = await import(configPath);
    return config.default || config;
  } catch (error) {
    // Fallback to CommonJS
    try {
      const config = require(configPath);
      return config.default || config;
    } catch (err) {
      console.warn(`Warning: Could not load config file: ${configPath}`);
      return {};
    }
  }
}

async function main() {
  const args = parseArgs();

  if (args.showHelp) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (!args.command || args.command !== 'generate') {
    console.error('Error: No command specified. Use "generate" to create icon sprite.');
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
      customIconsDir: args.customIconsDir || fileConfig.customIconsDir,
      projectRoot: process.cwd(),
    };

    console.log('Generating icon sprite...\n');
    await generateSprite(config);
    console.log('\nIcon sprite generated successfully!');
  } catch (error) {
    console.error('\nError generating sprite:', error.message);
    process.exit(1);
  }
}

main();
