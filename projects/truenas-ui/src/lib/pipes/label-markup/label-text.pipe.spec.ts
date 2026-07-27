import { LabelTextPipe } from './label-text.pipe';

describe('LabelTextPipe', () => {
  let pipe: LabelTextPipe;

  beforeEach(() => {
    pipe = new LabelTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('strips markup markers', () => {
    expect(pipe.transform('Type **foo** and `bar`')).toBe('Type foo and bar');
  });

  it('returns empty string for null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
