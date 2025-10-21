import { execSync } from 'node:child_process';

export function findIconsWithMarker(path: string): Set<string> {
  const command = `grep -rEo "iconMarker\\\\('[^']+'" --include="*.ts" --include="*.html" ${path}`;

  const icons = new Set<string>();

  try {
    const output = execSync(command, { encoding: 'utf-8' });
    output
      .split('\n')
      .filter(Boolean)
      .forEach((line) => {
        const [, match] = line.split(':');
        const value = /'([^']+)'/.exec(match)?.[1];
        if (!value) {
          return;
        }

        icons.add(value);
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
