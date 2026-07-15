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
      { name: '/mnt', path: '/mnt' }
    ]);
  });

  it('should show empty path as root', () => {
    const result = pipe.transform('');

    expect(result).toEqual([
      { name: '/mnt', path: '/mnt' }
    ]);
  });

  it('should show the root and directory name for a first-level directory', () => {
    const result = pipe.transform('/mnt/tank');

    expect(result).toEqual([
      { name: '/mnt', path: '/mnt' },
      { name: 'tank', path: '/mnt/tank' }
    ]);
  });

  it('should show every directory between the root and the current path', () => {
    const result = pipe.transform('/mnt/tank/documents/subfolder');

    expect(result).toEqual([
      { name: '/mnt', path: '/mnt' },
      { name: 'tank', path: '/mnt/tank' },
      { name: 'documents', path: '/mnt/tank/documents' },
      { name: 'subfolder', path: '/mnt/tank/documents/subfolder' }
    ]);
  });

  it('should collapse the middle of deep paths into a navigable "…" segment', () => {
    const result = pipe.transform('/mnt/pool/data/backup/2024/january');

    expect(result).toEqual([
      { name: '/mnt', path: '/mnt' },
      { name: '…', path: '/mnt/pool/data/backup' },
      { name: '2024', path: '/mnt/pool/data/backup/2024' },
      { name: 'january', path: '/mnt/pool/data/backup/2024/january' }
    ]);
  });

  it('should handle single character directory names', () => {
    const result = pipe.transform('/mnt/a');

    expect(result).toEqual([
      { name: '/mnt', path: '/mnt' },
      { name: 'a', path: '/mnt/a' }
    ]);
  });

  describe('custom rootPath', () => {
    it('should show "/" at a custom root path', () => {
      const result = pipe.transform('/dev/zvol', '/dev/zvol');

      expect(result).toEqual([
        { name: '/dev/zvol', path: '/dev/zvol' }
      ]);
    });

    it('should show segments relative to a custom root', () => {
      const result = pipe.transform('/dev/zvol/tank/vm', '/dev/zvol');

      expect(result).toEqual([
        { name: '/dev/zvol', path: '/dev/zvol' },
        { name: 'tank', path: '/dev/zvol/tank' },
        { name: 'vm', path: '/dev/zvol/tank/vm' }
      ]);
    });

    it('should show only the leaf when the path escapes the root', () => {
      const result = pipe.transform('/elsewhere/place', '/dev/zvol');

      expect(result).toEqual([
        { name: '/dev/zvol', path: '/dev/zvol' },
        { name: 'place', path: '/elsewhere/place' }
      ]);
    });

    it('should not treat a sibling with the same prefix as being under the root', () => {
      const result = pipe.transform('/mntx/foo', '/mnt');

      expect(result).toEqual([
        { name: '/mnt', path: '/mnt' },
        { name: 'foo', path: '/mntx/foo' }
      ]);
    });

    it('should support "/" as the root path', () => {
      expect(pipe.transform('/', '/')).toEqual([
        { name: '/', path: '/' }
      ]);

      expect(pipe.transform('/dev/zvol', '/')).toEqual([
        { name: '/', path: '/' },
        { name: 'dev', path: '/dev' },
        { name: 'zvol', path: '/dev/zvol' }
      ]);
    });
  });
});
