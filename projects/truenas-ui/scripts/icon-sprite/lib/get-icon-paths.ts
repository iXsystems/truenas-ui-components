import fs from 'fs';
import { resolve } from 'path';

export function getIconPaths(names: Set<string>, projectRoot: string = process.cwd()): Map<string, string> {
  const iconPaths = new Map<string, string>();

  names.forEach((name) => {
    // Library structure: custom icons are in assets/icons/custom/ (not src/assets/)
    if (name.startsWith('ix-')) {
      const localPath = resolve(projectRoot, `assets/icons/custom/${name.slice(3)}.svg`);
      const libraryPath = resolve(projectRoot, `node_modules/truenas-ui/dist/truenas-ui/assets/icons/custom/${name.slice(3)}.svg`);

      // Check local custom icons first, then library custom icons
      if (fs.existsSync(localPath)) {
        iconPaths.set(name, `assets/icons/custom/${name.slice(3)}.svg`);
      } else if (fs.existsSync(libraryPath)) {
        iconPaths.set(name, `node_modules/truenas-ui/dist/truenas-ui/assets/icons/custom/${name.slice(3)}.svg`);
      } else {
        // Fallback to local path (will error if doesn't exist, which is expected)
        iconPaths.set(name, `assets/icons/custom/${name.slice(3)}.svg`);
      }
      return;
    }

    if (name.startsWith('mdi-')) {
      iconPaths.set(name, `node_modules/@mdi/svg/svg/${name.slice(4)}.svg`);
      return;
    }

    iconPaths.set(name, `node_modules/@material-design-icons/svg/filled/${name}.svg`);
  });

  return iconPaths;
}
