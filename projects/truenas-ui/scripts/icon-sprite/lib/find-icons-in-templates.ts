import fs from 'fs';
import fg from 'fast-glob';
import * as cheerio from 'cheerio';

export function findIconsInTemplates(path: string, skipIcons?: Set<string>): Set<string> {
  const iconNames = new Set<string>();

  const templates = fg.sync(`${path}/**/*.html`);

  templates.forEach((template) => {
    const content = fs.readFileSync(template, 'utf-8');
    const parsedTemplate = cheerio.load(content);

    // Helper function to extract icon names from elements (used for both ix-icon and ix-icon-button)
    const processIconElement = (iconTag: cheerio.Element) => {
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
        // Match string literals that are values, not comparison operands
        // This handles:
        // - Ternary: isExpanded ? 'chevron-down' : 'chevron-right'
        // - But skips comparisons: element.status === 'Active' ? 'check' : 'close'
        //
        // Strategy: Match quoted strings that come after ? or : (ternary results)
        // or are standalone (not part of a comparison)
        const ternaryResultRegex = /[?:]\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = ternaryResultRegex.exec(boundName)) !== null) {
          const iconName = match[1];
          // Valid icon names only contain alphanumeric, hyphens, and underscores
          if (/^[a-z0-9\-_]+$/i.test(iconName)) {
            extractedNames.push(iconName);
          }
        }

        // Also handle simple string literals (no ternary, no comparison)
        // e.g., [name]="'folder'" (though this is unusual)
        if (!boundName.includes('?') && !boundName.includes('=')) {
          const simpleStringRegex = /^['"]([^'"]+)['"]$/;
          const simpleMatch = boundName.match(simpleStringRegex);
          if (simpleMatch && /^[a-z0-9\-_]+$/i.test(simpleMatch[1])) {
            extractedNames.push(simpleMatch[1]);
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

        // Determine the final icon name with appropriate prefix
        let finalIconName: string;

        // Handle library attribute - prefix the icon name with library prefix
        if (library === 'mdi' && !iconName.startsWith('mdi-')) {
          finalIconName = `mdi-${iconName}`;
        } else if (library === 'custom' && !iconName.startsWith('app-') && !iconName.startsWith('ix-')) {
          // Consumer custom icons get app- prefix
          // (Library templates should never use library="custom", they use libIconMarker() instead)
          finalIconName = `app-${iconName}`;
        } else if (library === 'material' && !iconName.startsWith('mat-')) {
          finalIconName = `mat-${iconName}`; // Material icons get mat- prefix
        } else {
          finalIconName = iconName;
        }

        // Skip if already provided by library
        if (skipIcons?.has(finalIconName)) {
          return;
        }

        iconNames.add(finalIconName);
      });
    };

    // Scan ix-icon elements
    parsedTemplate('ix-icon').each((_, iconTag) => {
      processIconElement(iconTag);
    });

    // Scan ix-icon-button elements (they also have name and library attributes)
    parsedTemplate('ix-icon-button').each((_, iconTag) => {
      processIconElement(iconTag);
    });
  });

  return iconNames;
}
