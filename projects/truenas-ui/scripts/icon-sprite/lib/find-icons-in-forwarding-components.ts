import { execSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export interface IconSlotMapping {
  iconAttribute: string;
  libraryAttribute?: string;
  defaultLibrary?: string;
}

export interface ForwardingComponentMapping {
  selector: string;
  iconSlots: IconSlotMapping[];
}

/**
 * Discovers components implementing TnIconForwardingComponent and derives
 * their icon attribute mappings by reading their templates.
 *
 * Steps:
 * 1. Grep for `implements TnIconForwardingComponent` (or `implements.*TnIconForwardingComponent`)
 * 2. Extract the @Component selector and templateUrl from the same file
 * 3. Read the component template and find <tn-icon> [name] / [library] bindings
 * 4. Map binding expressions back to input names (strip signal call syntax)
 * 5. Extract default library values from input declarations in the TS file
 */
export function findForwardingComponentMappings(searchPaths: string[]): ForwardingComponentMapping[] {
  const mappings: ForwardingComponentMapping[] = [];
  const componentFiles = findForwardingComponentFiles(searchPaths);

  for (const filePath of componentFiles) {
    const mapping = extractMappingFromComponent(filePath);
    if (mapping) {
      mappings.push(mapping);
    }
  }

  return mappings;
}

/**
 * Grep for .ts files containing `implements TnIconForwardingComponent`
 * (handles multi-interface: `implements TnIconForwardingComponent, AfterViewInit`)
 */
function findForwardingComponentFiles(searchPaths: string[]): string[] {
  const files: string[] = [];

  for (const searchPath of searchPaths) {
    if (!fs.existsSync(searchPath)) {
      continue;
    }

    try {
      const command = `grep -rl "implements.*TnIconForwardingComponent" --include="*.ts" ${searchPath}`;
      const output = execSync(command, { encoding: 'utf-8' });
      output
        .split('\n')
        .filter(Boolean)
        .forEach((file) => files.push(file));
    } catch (error: any) {
      // grep returns exit code 1 when no matches found
      if (error.status === 1 && !error.stderr) {
        continue;
      }
      throw error;
    }
  }

  return files;
}

/**
 * Extract the forwarding component mapping from a single component .ts file.
 *
 * Reads the TS file to get the selector and templateUrl, then reads the
 * template to find <tn-icon> bindings and maps them back to input names.
 */
function extractMappingFromComponent(tsFilePath: string): ForwardingComponentMapping | null {
  const tsContent = fs.readFileSync(tsFilePath, 'utf-8');

  // Extract selector from @Component({ selector: '...' })
  const selectorMatch = /selector:\s*['"]([^'"]+)['"]/.exec(tsContent);
  if (!selectorMatch) {
    return null;
  }
  const selector = selectorMatch[1];

  // Extract templateUrl from @Component({ templateUrl: '...' })
  const templateUrlMatch = /templateUrl:\s*['"]([^'"]+)['"]/.exec(tsContent);
  if (!templateUrlMatch) {
    return null;
  }

  // Resolve template path relative to the TS file
  const templatePath = path.resolve(path.dirname(tsFilePath), templateUrlMatch[1]);
  if (!fs.existsSync(templatePath)) {
    return null;
  }

  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  const iconSlots = extractIconSlotsFromTemplate(templateContent, tsContent);

  if (iconSlots.length === 0) {
    return null;
  }

  return { selector, iconSlots };
}

/**
 * Find <tn-icon> elements in the template and extract the input names
 * from their [name] and [library] bindings.
 *
 * For example:
 *   <tn-icon [name]="icon()!" [library]="iconLibrary()">
 *   yields: { iconAttribute: 'icon', libraryAttribute: 'iconLibrary' }
 *
 *   <tn-icon [name]="prefixIcon()!">
 *   yields: { iconAttribute: 'prefixIcon' }
 */
function extractIconSlotsFromTemplate(templateContent: string, tsContent: string): IconSlotMapping[] {
  const $ = cheerio.load(templateContent);
  const slots: IconSlotMapping[] = [];

  $('tn-icon').each((_, el) => {
    const boundName = $(el).attr('[name]');
    if (!boundName) {
      return;
    }

    // Extract the signal/input name from the binding expression
    // Handles: "icon()", "icon()!", "prefixIcon()!", etc.
    const inputName = extractInputName(boundName);
    if (!inputName) {
      return;
    }

    const slot: IconSlotMapping = { iconAttribute: inputName };

    // Check for [library] binding on the same <tn-icon>
    const boundLibrary = $(el).attr('[library]');
    if (boundLibrary) {
      const libraryInputName = extractInputName(boundLibrary);
      if (libraryInputName) {
        slot.libraryAttribute = libraryInputName;

        // Try to extract the default value from the input declaration in the TS
        const defaultLibrary = extractInputDefault(tsContent, libraryInputName);
        if (defaultLibrary) {
          slot.defaultLibrary = defaultLibrary;
        }
      }
    }

    slots.push(slot);
  });

  return slots;
}

/**
 * Extract a simple input/signal name from a template binding expression.
 *
 * Matches patterns like:
 *   "icon()"     -> "icon"
 *   "icon()!"    -> "icon"
 *   "prefixIcon()!" -> "prefixIcon"
 *
 * Returns null for complex expressions (ternaries, method calls with args, etc.)
 * since those represent computed values, not direct input forwarding.
 */
function extractInputName(expression: string): string | null {
  const match = /^\s*(\w+)\(\)!?\s*$/.exec(expression);
  return match ? match[1] : null;
}

/**
 * Extract the default value from an Angular input declaration.
 *
 * Matches patterns like:
 *   iconLibrary = input<IconLibraryType>('mdi')  -> "mdi"
 *   iconLibrary = input('mdi')                    -> "mdi"
 */
function extractInputDefault(tsContent: string, inputName: string): string | null {
  const regex = new RegExp(`${inputName}\\s*=\\s*input[^(]*\\(\\s*['"]([^'"]+)['"]`);
  const match = regex.exec(tsContent);
  return match ? match[1] : null;
}
