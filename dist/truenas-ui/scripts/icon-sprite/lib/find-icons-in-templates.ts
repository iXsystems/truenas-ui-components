import fs from 'fs';
import * as cheerio from 'cheerio';

export function findIconsInTemplates(path: string): Set<string> {
  const iconNames = new Set<string>();

  const templates = fs.globSync(`${path}/**/*.html`);

  templates.forEach((template) => {
    const content = fs.readFileSync(template, 'utf-8');
    const parsedTemplate = cheerio.load(content);

    parsedTemplate('ix-icon').each((_, iconTag) => {
      // Check both 'name' and '[name]' attributes (Angular binding syntax)
      const staticName = parsedTemplate(iconTag).attr('name');
      const boundName = parsedTemplate(iconTag).attr('[name]');
      const library = parsedTemplate(iconTag).attr('library');

      const extractedNames: string[] = [];

      // Handle static name attribute: name="folder"
      if (staticName) {
        extractedNames.push(staticName);
      }

      // Handle bound name attribute: [name]="expression"
      // Extract string literals from the expression
      if (boundName) {
        // Match string literals in the expression
        // This handles ternary: isExpanded ? 'chevron-down' : 'chevron-right'
        const stringLiteralRegex = /['"]([^'"]+)['"]/g;
        let match;
        while ((match = stringLiteralRegex.exec(boundName)) !== null) {
          const iconName = match[1];
          // Skip if it looks like a property accessor or contains invalid characters
          // Valid icon names only contain alphanumeric, hyphens, and underscores
          if (/^[a-z0-9\-_]+$/i.test(iconName)) {
            extractedNames.push(iconName);
          }
        }
      }

      if (extractedNames.length === 0) {
        return;
      }

      // Process each extracted name
      extractedNames.forEach((iconName) => {
        // Skip icons with registry format (e.g., "mdi:menu", "lucide:home")
        // These are resolved at runtime via icon registry, not sprite
        if (iconName.includes(':')) {
          return;
        }

        // Handle library attribute - prefix the icon name with library prefix
        if (library === 'mdi' && !iconName.startsWith('mdi-')) {
          iconNames.add(`mdi-${iconName}`);
        } else if (library === 'material' && !iconName.startsWith('mat-')) {
          iconNames.add(iconName); // Material icons don't need prefix
        } else {
          iconNames.add(iconName);
        }
      });
    });
  });

  return iconNames;
}
