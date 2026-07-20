/**
 * Whether `path` is `root` itself or nested anywhere beneath it. A plain
 * prefix check is not enough: '/mntx' is not within '/mnt', and a path
 * containing relative segments ('/mnt/../etc') could resolve outside the
 * root even though it starts with it — such paths are never within the root.
 */
export function isPathWithinRoot(path: string, root: string): boolean {
  if (path.split('/').some((segment) => segment === '.' || segment === '..')) {
    return false;
  }
  if (root === '/') {
    return path.startsWith('/');
  }
  return path === root || path.startsWith(`${root}/`);
}

/**
 * Collapses trailing slashes so root comparisons are exact: '/mnt/backups/'
 * would otherwise never equal the '/mnt/backups' produced by navigation.
 * '/' stays '/'.
 */
export function normalizeRootPath(root: string): string {
  return root.replace(/\/+$/, '') || '/';
}
