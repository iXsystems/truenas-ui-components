import {
  labelMarkupToHtml,
  labelMarkupToText,
  parseLabelMarkup,
} from './label-markup.utils';

describe('parseLabelMarkup', () => {
  it('returns a single text segment for plain labels', () => {
    expect(parseLabelMarkup('Type foo below')).toEqual([
      { type: 'text', text: 'Type foo below' },
    ]);
  });

  it('parses **bold** into a strong segment', () => {
    expect(parseLabelMarkup('Type **foo** below')).toEqual([
      { type: 'text', text: 'Type ' },
      { type: 'strong', text: 'foo' },
      { type: 'text', text: ' below' },
    ]);
  });

  it('parses *italic* into an em segment', () => {
    expect(parseLabelMarkup('Type *foo* below')).toEqual([
      { type: 'text', text: 'Type ' },
      { type: 'em', text: 'foo' },
      { type: 'text', text: ' below' },
    ]);
  });

  it('parses `code` into a code segment', () => {
    expect(parseLabelMarkup('Run `zpool status` first')).toEqual([
      { type: 'text', text: 'Run ' },
      { type: 'code', text: 'zpool status' },
      { type: 'text', text: ' first' },
    ]);
  });

  it('parses multiple markers in one label', () => {
    expect(parseLabelMarkup('**Bold** and *italic*')).toEqual([
      { type: 'strong', text: 'Bold' },
      { type: 'text', text: ' and ' },
      { type: 'em', text: 'italic' },
    ]);
  });

  it('treats unmatched markers as literal text', () => {
    expect(parseLabelMarkup('Type **foo below')).toEqual([
      { type: 'text', text: 'Type **foo below' },
    ]);
    expect(parseLabelMarkup('Type `foo below')).toEqual([
      { type: 'text', text: 'Type `foo below' },
    ]);
  });

  it('leaves whitespace-adjacent asterisks alone', () => {
    expect(parseLabelMarkup('2 * 3 * 4')).toEqual([
      { type: 'text', text: '2 * 3 * 4' },
    ]);
  });

  it('leaves glob patterns alone', () => {
    expect(parseLabelMarkup('Matches *.tar files')).toEqual([
      { type: 'text', text: 'Matches *.tar files' },
    ]);
  });

  it('honors backslash escapes', () => {
    expect(parseLabelMarkup('Literal \\*foo\\*')).toEqual([
      { type: 'text', text: 'Literal *foo*' },
    ]);
  });

  it('honors escapes inside emphasis content', () => {
    expect(parseLabelMarkup('**a \\* b**')).toEqual([
      { type: 'strong', text: 'a * b' },
    ]);
  });

  it('takes code content verbatim without nested parsing', () => {
    expect(parseLabelMarkup('`**not bold**`')).toEqual([
      { type: 'code', text: '**not bold**' },
    ]);
  });

  it('does not nest emphasis', () => {
    expect(parseLabelMarkup('**bold *and* more**')).toEqual([
      { type: 'strong', text: 'bold *and* more' },
    ]);
  });

  it('returns no segments for an empty string', () => {
    expect(parseLabelMarkup('')).toEqual([]);
  });
});

describe('labelMarkupToHtml', () => {
  it('returns plain labels unchanged', () => {
    expect(labelMarkupToHtml('Type foo below')).toBe('Type foo below');
  });

  it('wraps markup in whitelisted tags', () => {
    expect(labelMarkupToHtml('Type **foo** below')).toBe('Type <strong>foo</strong> below');
    expect(labelMarkupToHtml('Type *foo* below')).toBe('Type <em>foo</em> below');
    expect(labelMarkupToHtml('Run `ls` now')).toBe('Run <code>ls</code> now');
  });

  it('escapes HTML in text segments', () => {
    expect(labelMarkupToHtml('Size < 10 & > 5')).toBe('Size &lt; 10 &amp; &gt; 5');
  });

  it('escapes HTML tags coming from translations instead of rendering them', () => {
    expect(labelMarkupToHtml('Type <strong>foo</strong>')).toBe(
      'Type &lt;strong&gt;foo&lt;/strong&gt;',
    );
  });

  it('escapes script injection attempts', () => {
    expect(labelMarkupToHtml('**<script>alert(1)</script>**')).toBe(
      '<strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>',
    );
  });
});

describe('labelMarkupToText', () => {
  it('strips markup markers', () => {
    expect(labelMarkupToText('Type **foo** below')).toBe('Type foo below');
    expect(labelMarkupToText('Type *foo* and `bar`')).toBe('Type foo and bar');
  });

  it('keeps literal text unchanged', () => {
    expect(labelMarkupToText('2 * 3 * 4')).toBe('2 * 3 * 4');
  });
});
