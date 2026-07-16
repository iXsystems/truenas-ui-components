/**
 * Whether `path` is `root` itself or nested anywhere beneath it. A plain
 * prefix check is not enough: '/mntx' is not within '/mnt'.
 */
export function isPathWithinRoot(path: string, root: string): boolean {
  if (root === '/') {
    return path.startsWith('/');
  }
  return path === root || path.startsWith(`${root}/`);
}
