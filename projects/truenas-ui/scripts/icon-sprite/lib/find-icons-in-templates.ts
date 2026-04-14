import fs from 'fs';
import fg from 'fast-glob';
import * as cheerio from 'cheerio';
import type { ForwardingComponentMapping } from './find-icons-in-forwarding-components';

export interface ScanResult {
  icons: Set<string>;
  sources: Map<string, string[]>;
}

export function findIconsInTemplates(
  path: string,
  skipIcons?: Set<string>,
  forwardingMappings?: ForwardingComponentMapping[],
): ScanResult {
  const iconNames = new Set<string>();
  const sources = new Map<string, string[]>();

  const templates = fg.sync(`${path}/**/*.html`);

  const addIcon = (iconName: string, templateFile: string) => {
    iconNames.add(iconName);
    const existing = sources.get(iconName) || [];
    existing.push(templateFile);
    sources.set(iconName, existing);
  };

  templates.forEach((template) => {
    const content = fs.readFileSync(template, 'utf-8');
    const parsedTemplate = cheerio.load(content);

    // Generic function to extract icon names from an element's attributes
    const processElement = (
      el: cheerio.Element,
      iconAttr: string,
      libraryAttr: string | undefined,
      defaultLibrary: string | undefined,
    ) => {
      // Check both static and [bound] attributes (Angular binding syntax)
      // Cheerio lowercases HTML attribute names, so look up the lowercase form
      const iconAttrLower = iconAttr.toLowerCase();
      const staticName = parsedTemplate(el).attr(iconAttrLower);
      const boundName = parsedTemplate(el).attr(`[${iconAttrLower}]`);
      const libraryAttrLower = libraryAttr?.toLowerCase();
      const library = libraryAttrLower
        ? parsedTemplate(el).attr(libraryAttrLower) || parsedTemplate(el).attr(`[${libraryAttrLower}]`)
        : undefined;

      // Resolve library: use explicit value, fall back to default
      let resolvedLibrary = defaultLibrary;
      if (library) {
        // Handle both static library="mdi" and bound [library]="'mdi'"
        const staticLib = library.replace(/^['"]|['"]$/g, '');
        if (/^[a-z]+$/.test(staticLib)) {
          resolvedLibrary = staticLib;
        }
      }

      const extractedNames: string[] = [];

      // Handle static name attribute: icon="folder"
      if (staticName) {
        extractedNames.push(staticName);
      }

      // Handle bound name attribute: [icon]="expression"
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
        // e.g., [icon]="'folder'" (though this is unusual)
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
        if (resolvedLibrary === 'mdi' && !iconName.startsWith('mdi-')) {
          finalIconName = `mdi-${iconName}`;
        } else if (resolvedLibrary === 'custom' && !iconName.startsWith('app-') && !iconName.startsWith('tn-')) {
          // Consumer custom icons get app- prefix
          // (Library templates should never use library="custom", they use libIconMarker() instead)
          finalIconName = `app-${iconName}`;
        } else if (resolvedLibrary === 'material' && !iconName.startsWith('mat-')) {
          finalIconName = `mat-${iconName}`; // Material icons get mat- prefix
        } else {
          finalIconName = iconName;
        }

        // Skip if already provided by library
        if (skipIcons?.has(finalIconName)) {
          return;
        }

        addIcon(finalIconName, template);
      });
    };

    // Scan tn-icon elements
    parsedTemplate('tn-icon').each((_, iconTag) => {
      processElement(iconTag, 'name', 'library', undefined);
    });

    // Scan tn-icon-button elements (they also have name and library attributes)
    parsedTemplate('tn-icon-button').each((_, iconTag) => {
      processElement(iconTag, 'name', 'library', undefined);
    });

    // Scan icon-forwarding components
    if (forwardingMappings) {
      for (const mapping of forwardingMappings) {
        parsedTemplate(mapping.selector).each((_, el) => {
          for (const slot of mapping.iconSlots) {
            processElement(el, slot.iconAttribute, slot.libraryAttribute, slot.defaultLibrary);
          }
        });
      }
    }
  });

  return { icons: iconNames, sources };
}
