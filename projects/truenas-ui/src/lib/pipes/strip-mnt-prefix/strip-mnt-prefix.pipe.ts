import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ixStripMntPrefix',
  standalone: true,
})
export class StripMntPrefixPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    if (!path) return '';

    if (path.startsWith('/mnt/')) {
      return path.substring(4); // Remove "/mnt" prefix -> "/mnt/foo" becomes "/foo"
    } else if (path === '/mnt') {
      return '/'; // Show root as just "/"
    }

    return path;
  }
}
