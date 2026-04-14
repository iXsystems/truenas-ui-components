import fs from 'fs';
import { resolve } from 'path';
import { findForwardingComponentMappings } from './find-icons-in-forwarding-components';
import { findIconsInTemplates } from './find-icons-in-templates';
import type { ScanResult } from './find-icons-in-templates';
import { findIconsWithMarker } from './find-icons-with-marker';
import type { ResolvedSpriteConfig } from '../sprite-config-interface';

export interface ValidationResult {
  scannedIcons: Set<string>;
  spriteIcons: Set<string>;
  missingFromSprite: Set<string>;
  staleInSprite: Set<string>;
  sources: Map<string, string[]>;
  spriteConfigFound: boolean;
}

/**
 * Validates icon usage against the current sprite manifest.
 * Reports missing icons (in code but not in sprite) and stale icons (in sprite but not in code).
 */
export function validateIcons(resolved: ResolvedSpriteConfig): ValidationResult {
  const srcDirs = resolved.srcDirs.map(dir => resolve(resolved.projectRoot, dir));
  const configPath = resolve(resolved.projectRoot, resolved.outputDir, 'sprite-config.json');

  // Load library icons
  const libraryIcons = loadLibraryIconsForValidation(resolved.projectRoot);

  // Discover forwarding component mappings
  const searchPaths = [...srcDirs];
  const libSrcPath = resolve(resolved.projectRoot, 'node_modules/@truenas/ui-components/src/lib');
  if (fs.existsSync(libSrcPath)) {
    searchPaths.push(libSrcPath);
  }
  const forwardingMappings = findForwardingComponentMappings(searchPaths);

  // Scan all source directories
  const allSources = new Map<string, string[]>();
  const scannedIcons = new Set<string>();

  for (const srcDir of srcDirs) {
    if (!fs.existsSync(srcDir)) {
      continue;
    }

    const templateResult = findIconsInTemplates(srcDir, libraryIcons, forwardingMappings);
    const markerResult = findIconsWithMarker(srcDir, libraryIcons);

    mergeScanResult(scannedIcons, allSources, templateResult);
    mergeScanResult(scannedIcons, allSources, markerResult);
  }

  // Include library icons in the scanned set (they're expected in the sprite)
  for (const icon of libraryIcons) {
    scannedIcons.add(icon);
  }

  // Include custom icons (they're always added to the sprite by generate)
  if (resolved.customIconsDir) {
    const customDir = resolve(resolved.projectRoot, resolved.customIconsDir);
    if (fs.existsSync(customDir)) {
      for (const filename of fs.readdirSync(customDir)) {
        if (filename.endsWith('.svg')) {
          scannedIcons.add(`tn-${filename.replace('.svg', '')}`);
        }
      }
    }
  }

  // Load existing sprite config
  let spriteIcons = new Set<string>();
  let spriteConfigFound = false;

  if (fs.existsSync(configPath)) {
    spriteConfigFound = true;
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      spriteIcons = new Set<string>(config.icons || []);
    } catch {
      // Corrupt config — treat as empty
    }
  }

  // Compute differences
  const missingFromSprite = new Set<string>();
  for (const icon of scannedIcons) {
    if (!spriteIcons.has(icon)) {
      missingFromSprite.add(icon);
    }
  }

  const staleInSprite = new Set<string>();
  for (const icon of spriteIcons) {
    if (!scannedIcons.has(icon)) {
      staleInSprite.add(icon);
    }
  }

  return {
    scannedIcons,
    spriteIcons,
    missingFromSprite,
    staleInSprite,
    sources: allSources,
    spriteConfigFound,
  };
}

/**
 * Prints the validation report to stdout.
 * Returns the appropriate exit code (0 = clean, 1 = missing icons).
 */
export function printValidationReport(result: ValidationResult): number {
  console.log('Icon Sprite Validation Report');
  console.log('==============================\n');

  if (!result.spriteConfigFound) {
    console.log('⚠ No sprite-config.json found. Run "npx truenas-icons generate" first.\n');
    console.log(`Scanned: ${result.scannedIcons.size} icon(s) across templates and markers`);
    return 1;
  }

  console.log(`Scanned: ${result.scannedIcons.size} icon(s) across templates and markers`);
  console.log(`Sprite:  ${result.spriteIcons.size} icon(s) in current sprite\n`);

  if (result.missingFromSprite.size > 0) {
    console.log(`Missing from sprite (${result.missingFromSprite.size} new icon(s) found):`);
    for (const icon of [...result.missingFromSprite].sort()) {
      const sourceFiles = result.sources.get(icon);
      const sourceHint = sourceFiles?.length
        ? ` (from ${sourceFiles[0]})`
        : '';
      console.log(`  + ${icon}${sourceHint}`);
    }
    console.log('');
  }

  if (result.staleInSprite.size > 0) {
    console.log(`Stale icons (${result.staleInSprite.size} in sprite but not referenced):`);
    for (const icon of [...result.staleInSprite].sort()) {
      console.log(`  - ${icon}`);
    }
    console.log('');
  }

  if (result.missingFromSprite.size === 0 && result.staleInSprite.size === 0) {
    console.log('✓ Sprite is up to date — no missing or stale icons.\n');
    return 0;
  }

  if (result.missingFromSprite.size > 0) {
    console.log('Run "npx truenas-icons generate" to rebuild the sprite.\n');
    return 1;
  }

  return 0;
}

function mergeScanResult(
  icons: Set<string>,
  sources: Map<string, string[]>,
  result: ScanResult,
): void {
  for (const icon of result.icons) {
    icons.add(icon);
  }
  for (const [icon, files] of result.sources) {
    const existing = sources.get(icon) || [];
    existing.push(...files);
    sources.set(icon, existing);
  }
}

function loadLibraryIconsForValidation(projectRoot: string): Set<string> {
  const librarySpritePath = resolve(
    projectRoot,
    'node_modules/@truenas/ui-components/assets/tn-icons/sprite-config.json'
  );

  if (!fs.existsSync(librarySpritePath)) {
    return new Set<string>();
  }

  try {
    const config = JSON.parse(fs.readFileSync(librarySpritePath, 'utf-8'));
    return new Set<string>(config.icons || []);
  } catch {
    return new Set<string>();
  }
}
