import { execSync } from 'node:child_process';

export function findIconsWithMarker(path: string, skipIcons?: Set<string>): Set<string> {
  // Updated regex to capture iconMarker() and libIconMarker() calls with optional second parameter
  // Matches: iconMarker('name') or iconMarker('name', 'library') or libIconMarker('ix-name')
  const command = `grep -rEo "(lib)?iconMarker\\\\('[^']+',?\\s*'?[^'\\)]*'?\\)" --include="*.ts" --include="*.html" ${path}`;

  const icons = new Set<string>();

  try {
    const output = execSync(command, { encoding: 'utf-8' });
    output
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        const [, match] = line.split(':');
        if (!match) {
          return;
        }

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

        // Apply prefix transformation (matching runtime iconMarker() logic)
        if (library === 'mdi' && !iconName.startsWith('mdi-')) {
          iconName = `mdi-${iconName}`;
        } else if (library === 'custom' && !iconName.startsWith('app-')) {
          iconName = `app-${iconName}`;
        } else if (library === 'material' && !iconName.startsWith('mat-')) {
          iconName = `mat-${iconName}`;
        }
        // Material icons get mat- prefix
        // libIconMarker already has ix- prefix, no transformation needed

        // Skip if already provided by library
        if (skipIcons?.has(iconName)) {
          return;
        }

        icons.add(iconName);
      });
  } catch (error: any) {
    // grep returns exit code 1 when no matches are found, which is not an error
    if (error.status === 1 && !error.stderr) {
      // No matches found, return empty set
      return icons;
    }
    // Re-throw actual errors
    throw error;
  }

  return icons;
}
