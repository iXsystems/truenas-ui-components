import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import type { PathSegment } from '../../file-picker/file-picker.interfaces';

/**
 * Maximum directory buttons shown after the root segment before the middle of
 * the path is collapsed into an "…" segment.
 */
const MAX_VISIBLE_DIRS = 4;

@Pipe({
  name: 'tnTruncatePath',
  standalone: true,
})
export class TruncatePathPipe implements PipeTransform {
  transform(path: string, rootPath = '/mnt'): PathSegment[] {
    // The root is always the first segment, shown as "/"
    const segments: PathSegment[] = [{ name: '/', path: rootPath }];

    if (!path || path === rootPath) {
      return segments;
    }

    if (!this.isWithinRoot(path, rootPath)) {
      // Path escaped the root — show just its leaf, with "/" leading back to the root
      segments.push({ name: path.substring(path.lastIndexOf('/') + 1), path });
      return segments;
    }

    // One clickable segment per directory between the root and the current path
    const relativePath = rootPath === '/' ? path : path.substring(rootPath.length);
    let segmentPath = rootPath;
    for (const name of relativePath.split('/').filter(Boolean)) {
      segmentPath = segmentPath === '/' ? `/${name}` : `${segmentPath}/${name}`;
      segments.push({ name, path: segmentPath });
    }

    return this.truncateMiddle(segments);
  }

  /**
   * Collapses the middle of deep paths into an "…" segment that navigates to the
   * parent of the first visible directory, e.g. /a/b/c/d/e → / … c d e.
   */
  private truncateMiddle(segments: PathSegment[]): PathSegment[] {
    const [root, ...dirs] = segments;
    if (dirs.length <= MAX_VISIBLE_DIRS) {
      return segments;
    }

    const visibleDirs = dirs.slice(-(MAX_VISIBLE_DIRS - 1));
    const collapsedParent = dirs[dirs.length - MAX_VISIBLE_DIRS];
    return [root, { name: '…', path: collapsedParent.path }, ...visibleDirs];
  }

  private isWithinRoot(path: string, rootPath: string): boolean {
    if (rootPath === '/') {
      return path.startsWith('/');
    }
    return path === rootPath || path.startsWith(`${rootPath}/`);
  }
}
