import { isPathWithinRoot, normalizeRootPath } from './path-utils';

describe('isPathWithinRoot', () => {
  it('should accept the root itself and paths nested beneath it', () => {
    expect(isPathWithinRoot('/mnt', '/mnt')).toBe(true);
    expect(isPathWithinRoot('/mnt/tank', '/mnt')).toBe(true);
    expect(isPathWithinRoot('/mnt/tank/deep/nested', '/mnt')).toBe(true);
  });

  it('should reject paths outside the root', () => {
    expect(isPathWithinRoot('/etc', '/mnt')).toBe(false);
    expect(isPathWithinRoot('/', '/mnt')).toBe(false);
  });

  it('should reject sibling paths sharing the root as a plain prefix', () => {
    expect(isPathWithinRoot('/mntx', '/mnt')).toBe(false);
    expect(isPathWithinRoot('/mnt-backup/tank', '/mnt')).toBe(false);
  });

  it('should treat every absolute path as within the "/" root', () => {
    expect(isPathWithinRoot('/', '/')).toBe(true);
    expect(isPathWithinRoot('/anything', '/')).toBe(true);
    expect(isPathWithinRoot('relative', '/')).toBe(false);
  });

  it('should reject paths containing relative segments that could escape the root', () => {
    expect(isPathWithinRoot('/mnt/../etc', '/mnt')).toBe(false);
    expect(isPathWithinRoot('/mnt/tank/..', '/mnt')).toBe(false);
    expect(isPathWithinRoot('/mnt/./tank', '/mnt')).toBe(false);
    expect(isPathWithinRoot('/..', '/')).toBe(false);
  });

  it('should accept names that merely contain dots', () => {
    expect(isPathWithinRoot('/mnt/file.txt', '/mnt')).toBe(true);
    expect(isPathWithinRoot('/mnt/..hidden', '/mnt')).toBe(true);
  });
});

describe('normalizeRootPath', () => {
  it('should collapse trailing slashes', () => {
    expect(normalizeRootPath('/mnt/backups/')).toBe('/mnt/backups');
    expect(normalizeRootPath('/mnt/backups///')).toBe('/mnt/backups');
  });

  it('should leave already-normalized roots untouched', () => {
    expect(normalizeRootPath('/mnt')).toBe('/mnt');
  });

  it('should keep "/" as "/"', () => {
    expect(normalizeRootPath('/')).toBe('/');
    expect(normalizeRootPath('///')).toBe('/');
  });
});
