import { TruncatePathPipe } from './truncate-path.pipe';

describe('TruncatePathPipe', () => {
  let pipe: TruncatePathPipe;

  beforeEach(() => {
    pipe = new TruncatePathPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should show "/" at root path', () => {
    const result = pipe.transform('/mnt');

    expect(result).toEqual([
      { name: '/', path: '/mnt' }
    ]);
  });

  it('should show empty path as root', () => {
    const result = pipe.transform('');

    expect(result).toEqual([
      { name: '/', path: '/mnt' }
    ]);
  });

  it('should show ".." and directory name for subdirectories', () => {
    const result = pipe.transform('/mnt/tank');

    expect(result).toEqual([
      { name: '..', path: '/mnt' },
      { name: 'tank', path: '/mnt/tank' }
    ]);
  });

  it('should navigate to parent for nested paths', () => {
    const result = pipe.transform('/mnt/tank/documents/subfolder');

    expect(result).toEqual([
      { name: '..', path: '/mnt/tank/documents' },
      { name: 'subfolder', path: '/mnt/tank/documents/subfolder' }
    ]);
  });

  it('should handle deep nesting correctly', () => {
    const result = pipe.transform('/mnt/pool/data/backup/2024');

    expect(result).toEqual([
      { name: '..', path: '/mnt/pool/data/backup' },
      { name: '2024', path: '/mnt/pool/data/backup/2024' }
    ]);
  });

  it('should handle single character directory names', () => {
    const result = pipe.transform('/mnt/a');

    expect(result).toEqual([
      { name: '..', path: '/mnt' },
      { name: 'a', path: '/mnt/a' }
    ]);
  });

  describe('custom rootPath', () => {
    it('should show "/" at a custom root path', () => {
      const result = pipe.transform('/dev/zvol', '/dev/zvol');

      expect(result).toEqual([
        { name: '/', path: '/dev/zvol' }
      ]);
    });

    it('should show ".." and directory name below a custom root', () => {
      const result = pipe.transform('/dev/zvol/tank', '/dev/zvol');

      expect(result).toEqual([
        { name: '..', path: '/dev/zvol' },
        { name: 'tank', path: '/dev/zvol/tank' }
      ]);
    });

    it('should clamp ".." to the root when the parent would escape it', () => {
      const result = pipe.transform('/elsewhere/place', '/dev/zvol');

      expect(result).toEqual([
        { name: '..', path: '/dev/zvol' },
        { name: 'place', path: '/elsewhere/place' }
      ]);
    });

    it('should not treat a sibling with the same prefix as being under the root', () => {
      const result = pipe.transform('/mntx/foo', '/mnt');

      expect(result).toEqual([
        { name: '..', path: '/mnt' },
        { name: 'foo', path: '/mntx/foo' }
      ]);
    });

    it('should support "/" as the root path', () => {
      expect(pipe.transform('/', '/')).toEqual([
        { name: '/', path: '/' }
      ]);

      expect(pipe.transform('/dev', '/')).toEqual([
        { name: '..', path: '/' },
        { name: 'dev', path: '/dev' }
      ]);
    });
  });
});
