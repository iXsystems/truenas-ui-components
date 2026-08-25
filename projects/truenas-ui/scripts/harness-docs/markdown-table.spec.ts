import {
  escapeTableCell,
  METHOD_TABLE_HEADER,
  methodTableRow,
  PROPERTY_TABLE_HEADER,
  propertyTableRow,
} from './markdown-table';

/**
 * Count the cells a Markdown parser reads out of one table row.
 *
 * The leading and trailing `|` are the row's own fences rather than delimiters, and a
 * backslash-escaped `\|` is content — which is exactly the distinction under test, so it
 * is spelled out here rather than borrowed from the code being tested.
 */
function cellsIn(row: string): number {
  const trimmed = row.trim();

  return trimmed.slice(1, -1).split(/(?<!\\)\|/).length;
}

/** The header's own first line decides how many cells every row below it must have. */
const columnsOf = (header: string): number => cellsIn(header.split('\n')[0]);

describe('escapeTableCell', () => {
  it('escapes a pipe so it cannot end the cell', () => {
    expect(escapeTableCell('string | RegExp')).toBe('string \\| RegExp');
  });

  it('escapes every pipe, not just the first', () => {
    expect(escapeTableCell(`'asc' | 'desc' | '' | null`)).toBe(
      `'asc' \\| 'desc' \\| '' \\| null`
    );
  });

  it('uses the backslash escape rather than an HTML entity, which a code span would show literally', () => {
    expect(escapeTableCell('A | B')).not.toContain('&#124;');
  });

  it('collapses newlines, because a row is one line', () => {
    expect(escapeTableCell('first line\n  second line')).toBe('first line second line');
  });

  it('leaves a value with nothing to escape alone', () => {
    expect(escapeTableCell('Promise<void>')).toBe('Promise<void>');
  });
});

describe('methodTableRow', () => {
  const columns = columnsOf(METHOD_TABLE_HEADER);

  it('has a four-column header', () => {
    expect(columns).toBe(4);
  });

  it('builds one row per union-typed parameter list, not one per union member', () => {
    const row = methodTableRow({
      name: 'clickActionButton',
      parameters: 'string | RegExp',
      returnType: 'Promise<void>',
      description: 'Clicks an action button in the dialog footer by its label.',
    });

    expect(cellsIn(row)).toBe(columns);
  });

  it('keeps the row intact when the union is in the return type', () => {
    const row = methodTableRow({
      name: 'getPlaceholder',
      parameters: '',
      returnType: 'Promise<string | null>',
      description: 'Gets the placeholder text of the input.',
    });

    expect(cellsIn(row)).toBe(columns);
  });

  it('keeps the row intact when the parameters and the return type both carry unions', () => {
    const row = methodTableRow({
      name: 'getCardSortDirection',
      parameters: `number, 'enter' | 'space'`,
      returnType: `Promise<'asc' | 'desc' | '' | null>`,
      description: 'Gets the active sort direction in the card layout.',
    });

    expect(cellsIn(row)).toBe(columns);
  });

  it('keeps the row intact when the description itself contains a pipe', () => {
    const row = methodTableRow({
      name: 'getType',
      parameters: '',
      returnType: 'Promise<string>',
      description: 'Reads the native type: button | submit | reset.',
    });

    expect(cellsIn(row)).toBe(columns);
  });

  it('puts the description in the Description column', () => {
    const row = methodTableRow({
      name: 'clickAction',
      parameters: 'string | RegExp',
      returnType: 'Promise<void>',
      description: "Clicks one of the banner's actions by its label.",
    });
    const cells = row.trim().slice(1, -1).split(/(?<!\\)\|/);

    expect(cells[3].trim()).toBe("Clicks one of the banner's actions by its label.");
  });

  it('leaves the Parameters cell empty for a method that takes none', () => {
    const row = methodTableRow({
      name: 'getText',
      parameters: '',
      returnType: 'Promise<string>',
      description: 'Gets the text.',
    });
    const cells = row.trim().slice(1, -1).split(/(?<!\\)\|/);

    expect(cells[1].trim()).toBe('');
  });
});

describe('propertyTableRow', () => {
  const columns = columnsOf(PROPERTY_TABLE_HEADER);

  it('has a three-column header', () => {
    expect(columns).toBe(3);
  });

  it('builds one row per union-typed property', () => {
    const row = propertyTableRow({
      name: 'label',
      type: 'string | RegExp',
      description: "Filters by the action's label text.",
    });

    expect(cellsIn(row)).toBe(columns);
  });

  it('keeps the row intact when the description contains a pipe', () => {
    const row = propertyTableRow({
      name: 'orientation',
      type: 'string',
      description: 'One of horizontal | vertical.',
    });

    expect(cellsIn(row)).toBe(columns);
  });
});
