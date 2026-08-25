/**
 * Markdown table rows for the harness documentation `scripts/generate-harness-docs.ts`
 * generates.
 *
 * These live apart from the generator because that file calls `main()` at the bottom of
 * the module, so importing anything out of it runs the whole build. Everything here is a
 * pure function of its argument, which is what makes the row shape testable at all.
 */

/** A harness method, reduced to the fields a table row renders. */
export interface MethodRowInput {
  name: string;
  parameters: string;
  returnType: string;
  description: string;
}

/** An interface property, reduced to the fields a table row renders. */
export interface PropertyRowInput {
  name: string;
  type: string;
  description: string;
}

/** Header and delimiter rows for the Methods table. Four columns. */
export const METHOD_TABLE_HEADER =
  '| Method | Parameters | Returns | Description |\n' +
  '|--------|------------|---------|-------------|\n';

/** Header and delimiter rows for an interface's properties table. Three columns. */
export const PROPERTY_TABLE_HEADER =
  '| Property | Type | Description |\n' +
  '|----------|------|-------------|\n';

/**
 * Render one value as the contents of a Markdown table cell.
 *
 * A `|` is a cell delimiter wherever it appears in a table row, and a code span does not
 * protect it: the row is split into cells before its inline content is parsed, so a
 * `string | RegExp` parameter arrives as two cells and every column after it shifts left
 * by one. That is what dropped the Description column of every union-typed harness
 * method.
 *
 * The backslash escape is read during that split, which is why `\|` works inside a code
 * span and `&#124;` does not — an entity inside a code span renders as the six literal
 * characters that spell it.
 *
 * Newlines collapse for the same reason: a row is one line, so a wrapped type or
 * description would otherwise end the table partway through.
 */
export function escapeTableCell(value: string): string {
  return value
    .replace(/\s*\n+\s*/g, ' ')
    .trim()
    .replace(/\|/g, '\\|');
}

/** One row of the Methods table, newline included. */
export function methodTableRow(method: MethodRowInput): string {
  const parameters = method.parameters ? `\`${escapeTableCell(method.parameters)}\`` : '';

  return (
    `| \`${escapeTableCell(method.name)}()\`` +
    ` | ${parameters}` +
    ` | \`${escapeTableCell(method.returnType)}\`` +
    ` | ${escapeTableCell(method.description)} |\n`
  );
}

/** One row of an interface's properties table, newline included. */
export function propertyTableRow(property: PropertyRowInput): string {
  return (
    `| \`${escapeTableCell(property.name)}\`` +
    ` | \`${escapeTableCell(property.type)}\`` +
    ` | ${escapeTableCell(property.description)} |\n`
  );
}
