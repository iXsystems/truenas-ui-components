import { StripMntPrefixPipe } from './strip-mnt-prefix.pipe';

describe('StripMntPrefixPipe', () => {
  let pipe: StripMntPrefixPipe;

  beforeEach(() => {
    pipe = new StripMntPrefixPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should strip /mnt/ prefix from path', () => {
    const result = pipe.transform('/mnt/tank/documents');
    expect(result).toBe('/tank/documents');
  });

  it('should convert /mnt to /', () => {
    const result = pipe.transform('/mnt');
    expect(result).toBe('/');
  });

  it('should return empty string for null', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
  });

  it('should return empty string for undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
  });

  it('should return empty string for empty string', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('should return path unchanged if it does not start with /mnt', () => {
    const result = pipe.transform('/var/log');
    expect(result).toBe('/var/log');
  });

  it('should handle paths with multiple segments after /mnt/', () => {
    const result = pipe.transform('/mnt/tank/dataset/folder/file.txt');
    expect(result).toBe('/tank/dataset/folder/file.txt');
  });

  it('should handle single character after /mnt/', () => {
    const result = pipe.transform('/mnt/a');
    expect(result).toBe('/a');
  });
});
