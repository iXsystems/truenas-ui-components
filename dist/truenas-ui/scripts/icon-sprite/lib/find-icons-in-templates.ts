import fs from 'fs';
import * as cheerio from 'cheerio';

export function findIconsInTemplates(path: string): Set<string> {
  const iconNames = new Set<string>();

  const templates = fs.globSync(`${path}/**/*.html`);

  templates.forEach((template) => {
    const content = fs.readFileSync(template, 'utf-8');
    const parsedTemplate = cheerio.load(content);

    parsedTemplate('ix-icon').each((_, iconTag) => {
      const name = parsedTemplate(iconTag).attr('name');
      const library = parsedTemplate(iconTag).attr('library');

      if (!name) {
        return;
      }

      // Skip icons with registry format (e.g., "mdi:menu", "lucide:home")
      // These are resolved at runtime via icon registry, not sprite
      if (name.includes(':')) {
        return;
      }

      // Handle library attribute - prefix the icon name with library prefix
      if (library === 'mdi' && !name.startsWith('mdi-')) {
        iconNames.add(`mdi-${name}`);
      } else if (library === 'material' && !name.startsWith('mat-')) {
        iconNames.add(name); // Material icons don't need prefix
      } else {
        iconNames.add(name);
      }
    });
  });

  return iconNames;
}
