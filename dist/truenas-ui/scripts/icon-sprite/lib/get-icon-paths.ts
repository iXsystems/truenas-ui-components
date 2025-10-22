import fs from 'fs';
import { resolve } from 'path';

/**
 * Find the node_modules directory by checking project root and parent directories
 */
function findNodeModules(projectRoot: string): string {
  // Try project root first
  const projectNodeModules = resolve(projectRoot, 'node_modules');
  if (fs.existsSync(projectNodeModules)) {
    return projectNodeModules;
  }

  // Try parent directory (for monorepo/library structure)
  const parentNodeModules = resolve(projectRoot, '../../node_modules');
  if (fs.existsSync(parentNodeModules)) {
    return parentNodeModules;
  }

  // Fallback to project root (will error later if doesn't exist)
  return projectNodeModules;
}

export function getIconPaths(names: Set<string>, projectRoot: string = process.cwd()): Map<string, string> {
  const iconPaths = new Map<string, string>();
  const nodeModulesPath = findNodeModules(projectRoot);

  names.forEach((name) => {
    // Library custom icons (ix- prefix) - ONLY from library package
    if (name.startsWith('ix-')) {
      // When building the library itself, icons are in the source directory
      // When consuming the library, icons are in node_modules
      const sourceLibraryPath = resolve(projectRoot, `assets/icons/custom/${name.slice(3)}.svg`);
      const installedLibraryPath = resolve(nodeModulesPath, `truenas-ui/dist/truenas-ui/assets/icons/custom/${name.slice(3)}.svg`);

      // Check source first (for library development), then installed package (for consumers)
      if (fs.existsSync(sourceLibraryPath)) {
        iconPaths.set(name, sourceLibraryPath);
      } else if (fs.existsSync(installedLibraryPath)) {
        iconPaths.set(name, installedLibraryPath);
      } else {
        console.warn(`⚠ Library custom icon not found: ${name} (looking for ${name.slice(3)}.svg in library)`);
        // Fallback to source path (will error if doesn't exist, which is expected)
        iconPaths.set(name, sourceLibraryPath);
      }
      return;
    }

    // Consumer custom icons (app- prefix) - ONLY from consumer's assets
    if (name.startsWith('app-')) {
      const localPath = resolve(projectRoot, `assets/icons/custom/${name.slice(4)}.svg`);

      if (!fs.existsSync(localPath)) {
        console.warn(`⚠ Consumer custom icon not found: ${name} (looking for ${name.slice(4)}.svg in assets/icons/custom/)`);
      }
      iconPaths.set(name, localPath);
      return;
    }

    // MDI icons
    if (name.startsWith('mdi-')) {
      const mdiPath = resolve(nodeModulesPath, `@mdi/svg/svg/${name.slice(4)}.svg`);
      if (!fs.existsSync(mdiPath)) {
        console.warn(`⚠ MDI icon not found: ${name} (looking for ${name.slice(4)}.svg in @mdi/svg)`);
        console.warn(`  This icon may not exist in the current MDI version. Check https://pictogrammers.com/library/mdi/`);
      }
      iconPaths.set(name, mdiPath);
      return;
    }

    // Material Design Icons (no prefix)
    const materialPath = resolve(nodeModulesPath, `@material-design-icons/svg/filled/${name}.svg`);
    if (!fs.existsSync(materialPath)) {
      console.warn(`⚠ Material icon not found: ${name} (looking for ${name}.svg in @material-design-icons)`);
    }
    iconPaths.set(name, materialPath);
  });

  return iconPaths;
}
