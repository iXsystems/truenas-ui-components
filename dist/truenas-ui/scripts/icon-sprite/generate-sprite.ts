import crypto from 'crypto';
import fs from 'fs';
import { resolve } from 'path';
import { addCustomIcons } from './lib/add-custom-icons';
import { buildSprite } from './lib/build-sprite';
import { findIconsInTemplates } from './lib/find-icons-in-templates';
import { findIconsWithMarker } from './lib/find-icons-with-marker';
import { getIconPaths } from './lib/get-icon-paths';
import { warnAboutDuplicates } from './lib/warn-about-duplicates';
import { SpriteGeneratorConfig, resolveConfig } from './sprite-config-interface';

/**
 * Generates an icon sprite based on the provided configuration
 *
 * @param config - Configuration options for sprite generation
 * @returns Promise that resolves when sprite generation is complete
 */
export async function generateSprite(config: SpriteGeneratorConfig = {}): Promise<void> {
  try {
    const resolved = resolveConfig(config);

    // Resolve all paths relative to project root
    const srcDirs = resolved.srcDirs.map(dir => resolve(resolved.projectRoot, dir));
    const outputDir = resolve(resolved.projectRoot, resolved.outputDir);
    const targetPath = resolve(outputDir, 'sprite.svg');
    const configPath = resolve(outputDir, 'sprite-config.json');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Scan all source directories for icon usage
    const templateIcons = new Set<string>();
    const markerIcons = new Set<string>();

    for (const srcDir of srcDirs) {
      if (fs.existsSync(srcDir)) {
        const dirTemplateIcons = findIconsInTemplates(srcDir);
        const dirMarkerIcons = findIconsWithMarker(srcDir);

        dirTemplateIcons.forEach(icon => templateIcons.add(icon));
        dirMarkerIcons.forEach(icon => markerIcons.add(icon));
      } else {
        console.warn(`Source directory not found, skipping: ${srcDir}`);
      }
    }

    const usedIcons = new Set([...templateIcons, ...markerIcons]);

    // Merge library icons if truenas-ui is installed (for consumer projects)
    mergeLibraryIcons(usedIcons, resolved.projectRoot);

    // Add custom icons if directory is specified
    let allIcons: Set<string>;
    if (resolved.customIconsDir) {
      const customDir = resolve(resolved.projectRoot, resolved.customIconsDir);
      if (fs.existsSync(customDir)) {
        // Temporarily set __dirname context for addCustomIcons
        // This is a workaround since addCustomIcons uses __dirname
        allIcons = addCustomIconsFromPath(usedIcons, customDir);
      } else {
        console.warn(`Custom icons directory not found: ${customDir}`);
        allIcons = usedIcons;
      }
    } else {
      allIcons = usedIcons;
    }

    warnAboutDuplicates(allIcons);

    if (!allIcons.size) {
      throw new Error('No icons found in the project. Make sure your templates include <ix-icon> elements or use iconMarker() for dynamic icons.');
    }

    const icons = getIconPaths(allIcons, resolved.projectRoot);

    const result = await buildSprite(icons);
    const file = Object.values(result)[0].sprite;

    const buffer = file.contents as Buffer;
    const size = buffer.length / 1024;

    fs.writeFileSync(targetPath, buffer);

    // eslint-disable-next-line sonarjs/hashing
    const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 10);
    const versionedUrl = `assets/icons/sprite.svg?v=${hash}`;

    fs.writeFileSync(configPath, JSON.stringify({
      iconUrl: versionedUrl,
      icons: Array.from(allIcons).sort()
    }, null, 2));

    console.info(`✓ Generated icon sprite with ${allIcons.size} icons (${size.toFixed(2)} KiB)`);
    console.info(`✓ Versioned sprite URL: ${versionedUrl}`);
    console.info(`✓ Output: ${targetPath}`);
  } catch (error) {
    console.error('Error when building the icon sprite:', error);
    throw error;
  }
}

/**
 * Helper function to add custom icons from a specific path
 */
function addCustomIconsFromPath(usedIcons: Set<string>, customIconsPath: string): Set<string> {
  const customIcons = new Set<string>();
  const unusedCustomIcons = new Set<string>();

  if (!fs.existsSync(customIconsPath)) {
    return usedIcons;
  }

  fs.readdirSync(customIconsPath).forEach((filename) => {
    if (!filename.endsWith('.svg')) {
      return;
    }

    const icon = `ix-${filename.replace('.svg', '')}`;
    if (!usedIcons.has(icon)) {
      unusedCustomIcons.add(icon);
    }

    customIcons.add(icon);
  });

  if (unusedCustomIcons.size > 0) {
    console.info(
      `Including ${unusedCustomIcons.size} custom icon(s) not currently used (available for runtime)`,
    );
  }

  return new Set([...customIcons, ...usedIcons]);
}

/**
 * Merge library icons from truenas-ui package if installed
 * This ensures library-internal icons (chevrons, folder, etc.) are available in consumer apps
 */
function mergeLibraryIcons(usedIcons: Set<string>, projectRoot: string): void {
  const librarySpritePath = resolve(
    projectRoot,
    'node_modules/truenas-ui/dist/truenas-ui/assets/icons/sprite-config.json'
  );

  // Skip if truenas-ui is not installed (e.g., when building the library itself)
  if (!fs.existsSync(librarySpritePath)) {
    return;
  }

  try {
    const libraryConfig = JSON.parse(fs.readFileSync(librarySpritePath, 'utf-8'));
    const libraryIcons = libraryConfig.icons || [];

    if (libraryIcons.length > 0) {
      console.info(`Merging ${libraryIcons.length} icon(s) from truenas-ui library`);
      libraryIcons.forEach((icon: string) => usedIcons.add(icon));
    }
  } catch (error) {
    console.warn('Warning: Could not load library sprite config:', error);
  }
}
