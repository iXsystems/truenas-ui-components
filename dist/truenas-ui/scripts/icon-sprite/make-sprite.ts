import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateSprite } from './generate-sprite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate sprite for the truenas-ui library itself
 * This uses the library-specific paths for development
 */
async function makeSprite(): Promise<void> {
  // Library structure: scripts are in projects/truenas-ui/scripts/icon-sprite/
  // Source files are in projects/truenas-ui/src/
  // Assets are in projects/truenas-ui/assets/
  const projectRoot = resolve(__dirname, '../..');

  await generateSprite({
    projectRoot,
    srcDirs: ['./src/lib', './src/stories'],
    // outputDir defaults to './assets/tn-icons' (namespaced to avoid collisions)
    customIconsDir: './assets/tn-icons/custom',
  });
}

makeSprite();
