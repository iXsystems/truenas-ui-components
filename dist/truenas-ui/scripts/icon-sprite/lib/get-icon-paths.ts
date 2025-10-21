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
    // Library structure: custom icons are in assets/icons/custom/ (not src/assets/)
    if (name.startsWith('ix-')) {
      const localPath = resolve(projectRoot, `assets/icons/custom/${name.slice(3)}.svg`);
      const libraryPath = resolve(nodeModulesPath, `truenas-ui/dist/truenas-ui/assets/icons/custom/${name.slice(3)}.svg`);

      // Check local custom icons first, then library custom icons
      if (fs.existsSync(localPath)) {
        iconPaths.set(name, localPath);
      } else if (fs.existsSync(libraryPath)) {
        iconPaths.set(name, libraryPath);
      } else {
        // Fallback to local path (will error if doesn't exist, which is expected)
        iconPaths.set(name, localPath);
      }
      return;
    }

    if (name.startsWith('mdi-')) {
      const mdiPath = resolve(nodeModulesPath, `@mdi/svg/svg/${name.slice(4)}.svg`);
      if (!fs.existsSync(mdiPath)) {
        console.warn(`⚠ MDI icon not found: ${name} (looking for ${name.slice(4)}.svg in @mdi/svg)`);
        console.warn(`  This icon may not exist in the current MDI version. Check https://pictogrammers.com/library/mdi/`);
      }
      iconPaths.set(name, mdiPath);
      return;
    }

    const materialPath = resolve(nodeModulesPath, `@material-design-icons/svg/filled/${name}.svg`);
    if (!fs.existsSync(materialPath)) {
      console.warn(`⚠ Material icon not found: ${name} (looking for ${name}.svg in @material-design-icons)`);
    }
    iconPaths.set(name, materialPath);
  });

  return iconPaths;
}
