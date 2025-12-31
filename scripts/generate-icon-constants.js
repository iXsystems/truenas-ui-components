#!/usr/bin/env node

/**
 * Generate TypeScript constants file from SVG icon files
 *
 * This script reads all .svg files from the assets/icons directory
 * and generates a TypeScript file with icon constants that can be
 * imported and used synchronously at runtime.
 *
 * Usage: node scripts/generate-icon-constants.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const iconsDir = path.join(__dirname, '../projects/truenas-ui/src/assets/icons');
const outputFile = path.join(__dirname, '../projects/truenas-ui/src/lib/custom-icons/generated-icons.ts');

console.log('🔨 Generating icon constants from SVG files...');
console.log(`📂 Source directory: ${iconsDir}`);
console.log(`📝 Output file: ${outputFile}`);

// Check if icons directory exists
if (!fs.existsSync(iconsDir)) {
  console.error(`❌ Error: Icons directory not found at ${iconsDir}`);
  process.exit(1);
}

// Read all SVG files
const iconFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

if (iconFiles.length === 0) {
  console.warn('⚠️  Warning: No SVG files found in icons directory');
}

// Generate TypeScript content
let output = '/**\n';
output += ' * Auto-generated from SVG files - DO NOT EDIT MANUALLY\n';
output += ' * \n';
output += ' * To regenerate this file, run:\n';
output += ' *   npm run generate-icons\n';
output += ' * \n';
output += ` * Generated: ${new Date().toISOString()}\n`;
output += ` * Source: ${path.relative(process.cwd(), iconsDir)}\n`;
output += ' */\n\n';
output += '/* eslint-disable */\n\n';
output += 'export const TRUENAS_ICONS: Record<string, string> = {\n';

// Process each SVG file
iconFiles.forEach((file, index) => {
  const name = file.replace('.svg', '');
  const filePath = path.join(iconsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Escape backticks and dollar signs for template literals
  const escaped = content
    .trim()
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/`/g, '\\`')     // Escape backticks
    .replace(/\$/g, '\\$');   // Escape dollar signs

  // Add icon entry with 'tn-' prefix
  output += `  'tn-${name}': \`${escaped}\``;

  // Add comma for all but last entry
  if (index < iconFiles.length - 1) {
    output += ',';
  }
  output += '\n';

  console.log(`  ✓ Processed: ${file} → tn-${name}`);
});

output += '};\n\n';

// Add helper function
output += '/**\n';
output += ' * Register all TrueNAS custom icons with the icon registry\n';
output += ' * @param iconRegistry The IxIconRegistryService instance\n';
output += ' */\n';
output += 'export function registerTruenasIcons(iconRegistry: any): void {\n';
output += '  Object.entries(TRUENAS_ICONS).forEach(([name, svg]) => {\n';
output += '    iconRegistry.registerIcon(name, svg);\n';
output += '  });\n';
output += '}\n';

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);
}

// Write output file
fs.writeFileSync(outputFile, output, 'utf8');

console.log(`✅ Successfully generated ${iconFiles.length} icon constant(s)`);
console.log(`📦 Output written to: ${path.relative(process.cwd(), outputFile)}`);
