import { execSync } from 'node:child_process';
import type { ScanResult } from './find-icons-in-templates';

export function findIconsWithMarker(path: string, skipIcons?: Set<string>): ScanResult {
  // Updated regex to capture tnIconMarker() and libIconMarker() calls with optional second parameter
  // Matches: tnIconMarker('name') or tnIconMarker('name', 'library') or libIconMarker('tn-name')
  const command = `grep -rEo "(tn|lib)IconMarker\\\\('[^']+',?\\s*'?[^'\\)]*'?\\)" --include="*.ts" --include="*.html" ${path}`;

  const icons = new Set<string>();
  const sources = new Map<string, string[]>();

  const addIcon = (iconName: string, sourceFile: string) => {
    icons.add(iconName);
    const existing = sources.get(iconName) || [];
    existing.push(sourceFile);
    sources.set(iconName, existing);
  };

  try {
    const output = execSync(command, { encoding: 'utf-8' });
    output
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        // grep output format: "filepath:match"
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) {
          return;
        }
        const sourceFile = line.substring(0, colonIdx);
        const match = line.substring(colonIdx + 1);

        // Extract icon name (first parameter)
        const iconNameMatch = /'([^']+)'/.exec(match);
        if (!iconNameMatch) {
          return;
        }

        let iconName = iconNameMatch[1];

        // Extract library parameter (second parameter) if present
        // Look for pattern: , 'library' after the icon name
        const libraryMatch = /,\s*'([^']+)'/.exec(match);
        const library = libraryMatch?.[1];

        // Apply prefix transformation (matching runtime tnIconMarker() logic)
        if (library === 'mdi' && !iconName.startsWith('mdi-')) {
          iconName = `mdi-${iconName}`;
        } else if (library === 'custom' && !iconName.startsWith('app-')) {
          iconName = `app-${iconName}`;
        } else if (library === 'material' && !iconName.startsWith('mat-')) {
          iconName = `mat-${iconName}`;
        }
        // Material icons get mat- prefix
        // libIconMarker already has tn- prefix, no transformation needed

        // Skip if already provided by library
        if (skipIcons?.has(iconName)) {
          return;
        }

        addIcon(iconName, sourceFile);
      });
  } catch (error: any) {
    // grep returns exit code 1 when no matches are found, which is not an error
    if (error.status === 1 && !error.stderr) {
      // No matches found, return empty set
      return { icons, sources };
    }
    // Re-throw actual errors
    throw error;
  }

  return { icons, sources };
}
