import { LabelMarkupPipe } from './label-markup.pipe';

describe('LabelMarkupPipe', () => {
  let pipe: LabelMarkupPipe;

  beforeEach(() => {
    pipe = new LabelMarkupPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('renders bold markup', () => {
    expect(pipe.transform('Type **foo** below')).toBe('Type <strong>foo</strong> below');
  });

  it('renders italic markup', () => {
    expect(pipe.transform('Type *foo* below')).toBe('Type <em>foo</em> below');
  });

  it('renders code markup', () => {
    expect(pipe.transform('Run `ls`')).toBe('Run <code>ls</code>');
  });

  it('escapes HTML in the label', () => {
    expect(pipe.transform('a < b')).toBe('a &lt; b');
  });

  it('returns empty string for null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
