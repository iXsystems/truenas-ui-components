import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { PathSegment } from '../../file-picker/file-picker.interfaces';

@Pipe({
  name: 'tnTruncatePath',
  standalone: true,
})
export class TruncatePathPipe implements PipeTransform {
  transform(path: string, rootPath = '/mnt'): PathSegment[] {
    // At the root, show just "/"
    if (!path || path === rootPath) {
      return [{ name: '/', path: rootPath }];
    }

    // For subdirectories, show ".." (parent) and current directory
    const segments: PathSegment[] = [];

    // Calculate parent path, clamped so ".." can never navigate above the root
    const lastSlashIndex = path.lastIndexOf('/');
    let parentPath = lastSlashIndex > 0 ? path.substring(0, lastSlashIndex) : rootPath;
    if (!this.isWithinRoot(parentPath, rootPath)) {
      parentPath = rootPath;
    }

    // Get current directory name
    const currentDirName = path.substring(lastSlashIndex + 1);

    // Add parent navigation (..) and current directory
    segments.push({ name: '..', path: parentPath });
    segments.push({ name: currentDirName, path: path });

    return segments;
  }

  private isWithinRoot(path: string, rootPath: string): boolean {
    if (rootPath === '/') {
      return path.startsWith('/');
    }
    return path === rootPath || path.startsWith(`${rootPath}/`);
  }
}
