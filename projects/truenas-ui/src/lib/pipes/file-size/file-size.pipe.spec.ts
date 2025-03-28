import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('converts bytes to KiB', () => {
    const result = pipe.transform(1024);
    expect(result).toBe('1 KiB');
  });

  it('converts bytes to MiB', () => {
    const result = pipe.transform(1024 * 1024);
    expect(result).toBe('1 MiB');
  });

  it('handles 0 bytes', () => {
    const result = pipe.transform(0);
    expect(result).toBe('0 B');
  });
});
