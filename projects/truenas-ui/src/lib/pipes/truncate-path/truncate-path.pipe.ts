import { Pipe, PipeTransform } from '@angular/core';
import { PathSegment } from '../../ix-file-picker/ix-file-picker.interfaces';

@Pipe({
  name: 'ixTruncatePath',
  standalone: true,
})
export class TruncatePathPipe implements PipeTransform {
  transform(path: string): PathSegment[] {
    // At root /mnt, show just "/"
    if (!path || path === '/mnt') {
      return [{ name: '/', path: '/mnt' }];
    }

    // For subdirectories, show ".." (parent) and current directory
    const segments: PathSegment[] = [];

    // Calculate parent path
    const lastSlashIndex = path.lastIndexOf('/');
    const parentPath = lastSlashIndex > 0 ? path.substring(0, lastSlashIndex) : '/mnt';

    // Get current directory name
    const currentDirName = path.substring(lastSlashIndex + 1);

    // Add parent navigation (..) and current directory
    segments.push({ name: '..', path: parentPath });
    segments.push({ name: currentDirName, path: path });

    return segments;
  }
}
