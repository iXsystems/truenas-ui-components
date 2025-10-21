import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function addCustomIcons(usedIcons: Set<string>): Set<string> {
  // Library structure: custom icons are in assets/icons/custom/ (not src/assets/)
  const customIconsPath = resolve(__dirname, '../../../assets/icons/custom');

  const customIcons = new Set<string>();
  const unusedCustomIcons = new Set<string>();

  fs.readdirSync(customIconsPath).forEach((filename) => {
    const icon = `ix-${filename.replace('.svg', '')}`;
    if (!usedIcons.has(icon)) {
      unusedCustomIcons.add(icon);
    }

    customIcons.add(icon);
  });

  // For a library, custom icons should always be included so consumers can use them
  // Just log unused icons for informational purposes
  if (unusedCustomIcons.size > 0) {
    console.info(
      `Including ${unusedCustomIcons.size} custom icon(s) not currently used in library components (available for consumers)`,
    );
  }

  return new Set([...customIcons, ...usedIcons]);
}
