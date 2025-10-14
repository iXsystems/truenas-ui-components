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
});
