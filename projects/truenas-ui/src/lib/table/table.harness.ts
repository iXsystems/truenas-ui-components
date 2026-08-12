import type { BaseHarnessFilters } from '@angular/cdk/testing';
import { ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';
import { TnCheckboxHarness } from '../checkbox/checkbox.harness';

/**
 * Harness for interacting with `tn-table` in tests.
 * Provides methods for querying rows/cells, sorting, selecting, and expanding.
 *
 * @example
 * ```typescript
 * const table = await loader.getHarness(TnTableHarness);
 * expect(await table.getRowCount()).toBe(5);
 *
 * await table.clickSortHeader('name');
 * expect(await table.getSortDirection('name')).toBe('ascending');
 *
 * await table.toggleRowExpansion(0);
 * expect(await table.isRowExpanded(0)).toBe(true);
 * ```
 */
export class TnTableHarness extends ComponentHarness {
  static hostSelector = 'tn-table';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a table
   * with specific attributes.
   *
   * @param options Options for filtering which instances are considered a match.
   * @returns A `HarnessPredicate` configured with the given options.
   */
  static with(options: TnTableHarnessFilters = {}) {
    return new HarnessPredicate(TnTableHarness, options);
  }

  // --- Row and cell queries ---

  /**
   * Gets the number of data rows (excludes header and detail rows).
   *
   * @returns Promise resolving to the row count.
   */
  async getRowCount(): Promise<number> {
    // Counts cards in card mode. Answering 0 there was the silent-wrong-answer shape the
    // selection block rejects, and this is the harness's own headline example — a consumer
    // that narrows the container and asserts emptiness would pass vacuously.
    const selector = (await this.isCards()) ? '.tn-table__card' : '.tn-table__row';
    const rows = await this.locatorForAll(selector)();
    return rows.length;
  }

  /**
   * Throws when the rendered layout is `cards`, for queries that have no card equivalent.
   * The alternative is an empty array or a 0, which reads as "the table is empty" and
   * greens a test over a rendered card list — the failure mode the selection and
   * active-row methods were made layout-aware to avoid.
   */
  private async assertTableLayout(method: string): Promise<void> {
    if (await this.isCards()) {
      throw new Error(
        `TnTableHarness.${method}() has no meaning in the card layout. `
          + 'Use the card API instead — getCardCount(), getCardTitle(), getCardFieldValue(), '
          + 'toggleCardDetail(), expandCardMoreFields(), getCardSortColumn(), '
          + 'getCardSortDirection(), toggleCardSortDirection() — or widen the container above '
          + 'cardBreakpoint.'
      );
    }
  }

  /**
   * Gets the text content of header cells (excludes sort icons).
   *
   * @returns Promise resolving to an array of header text strings.
   */
  async getHeaderTexts(): Promise<string[]> {
    await this.assertTableLayout('getHeaderTexts');
    const textEls = await this.locatorForAll('.tn-table__header-text')();
    const texts: string[] = [];
    for (const el of textEls) {
      texts.push((await el.text()).trim());
    }
    return texts;
  }

  /**
   * Gets the text of all data-column cells in a specific row.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to an array of cell text strings.
   */
  async getRowTexts(rowIndex: number): Promise<string[]> {
    await this.assertTableLayout('getRowTexts');
    await this.assertRowExists(rowIndex);
    const cells = await this.locatorForAll(
      `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__cell[data-column]`
    )();
    const texts: string[] = [];
    for (const cell of cells) {
      texts.push((await cell.text()).trim());
    }
    return texts;
  }

  /**
   * Gets the text of a specific cell by row and column.
   *
   * @param rowIndex Zero-based index of the data row.
   * @param columnName The column's data-column attribute value.
   * @returns Promise resolving to the cell text.
   */
  async getCellText(rowIndex: number, columnName: string): Promise<string> {
    await this.assertTableLayout('getCellText');
    await this.assertRowExists(rowIndex);
    const cell = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"] [data-column="${columnName}"]`
    )();
    return (await cell.text()).trim();
  }

  /**
   * Gets all row texts as a 2D string array (data-column cells only).
   *
   * @returns Promise resolving to an array of row text arrays.
   */
  async getAllRowTexts(): Promise<string[][]> {
    await this.assertTableLayout('getAllRowTexts');
    const count = await this.getRowCount();
    const result: string[][] = [];
    for (let i = 0; i < count; i++) {
      result.push(await this.getRowTexts(i));
    }
    return result;
  }

  // --- Sorting ---

  /**
   * Clicks a sortable column header to cycle sort direction.
   *
   * @param columnName The column's data-column attribute value.
   */
  async clickSortHeader(columnName: string): Promise<void> {
    await this.assertTableLayout('clickSortHeader');
    const header = await this.locatorFor(
      `th[data-column="${columnName}"]`
    )();
    await header.click();
  }

  /**
   * Checks whether a column header has the sortable class.
   *
   * @param columnName The column's data-column attribute value.
   * @returns Promise resolving to true if the column is sortable.
   */
  async isSortable(columnName: string): Promise<boolean> {
    await this.assertTableLayout('isSortable');
    const header = await this.locatorFor(
      `th[data-column="${columnName}"]`
    )();
    return header.hasClass('tn-table__header-cell--sortable');
  }

  /**
   * Gets the current sort direction for a column via aria-sort.
   *
   * `aria-sort="none"` — which a sortable-but-unsorted header now carries, so it is
   * discoverable as sortable — is normalised to null, keeping "not sorted" a single value
   * for callers. Only a non-sortable header has no attribute at all, and both answer null.
   *
   * @param columnName The column's data-column attribute value.
   * @returns Promise resolving to 'ascending', 'descending', or null.
   */
  async getSortDirection(columnName: string): Promise<string | null> {
    await this.assertTableLayout('getSortDirection');
    const header = await this.locatorFor(
      `th[data-column="${columnName}"]`
    )();
    const sort = await header.getAttribute('aria-sort');
    return sort === 'none' ? null : sort;
  }

  // --- Selection ---
  //
  // Layout-aware, all four of them. Card mode renders no `.tn-table__row` at all —
  // selection lives in `.tn-table__card .tn-table__card-select` — so a row-based
  // locator either throws or, worse, answers 0 for a table with rows selected.
  // Consumers shouldn't have to branch on the rendered layout to ask "is this row
  // selected", so these resolve the right selectors themselves.
  //
  // The click target is the WRAPPER in both layouts (the `<td>`, or the card's
  // `<div>`): `.tn-table__checkbox` is `pointer-events: none`, so clicking the
  // checkbox itself exercises a path no user can take.

  /** True when the container is narrow enough that card mode is rendered. */
  private async isCards(): Promise<boolean> {
    return (await this.getLayoutMode()) === 'cards';
  }

  /**
   * Clicks the select-all control — the header checkbox in table mode, the card
   * toolbar's "Select all" in card mode.
   */
  async toggleSelectAll(): Promise<void> {
    const selector = (await this.isCards())
      ? '.tn-table__cards-selectall'
      : '.tn-table__header-row .tn-table__select-cell';
    const target = await this.locatorFor(selector)();
    await target.click();
  }

  /**
   * Toggles selection for a specific row (or its card) by clicking its checkbox
   * wrapper.
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async toggleRowSelection(rowIndex: number): Promise<void> {
    const selector = (await this.isCards())
      ? `.tn-table__card[data-row-index="${rowIndex}"] .tn-table__card-select`
      : `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__select-cell`;
    const target = await this.locatorFor(selector)();
    await target.click();
  }

  /**
   * Checks if a specific row (or its card) is selected.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row's checkbox is checked.
   */
  async isRowSelected(rowIndex: number): Promise<boolean> {
    // Scoped to the select cell, matching `toggleRowSelection` and `getSelectedRowCount`.
    // Resolving against the whole row/card takes the first checkbox in document order, which
    // is the selection one only while `selectable` is on — with it off and a `tn-checkbox`
    // projected through `[tnRowActionsDef]`, this reported that checkbox's state instead of
    // failing to find a selection control.
    const ancestor = (await this.isCards())
      ? `.tn-table__card[data-row-index="${rowIndex}"] .tn-table__card-select`
      : `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__select-cell`;
    const checkbox = await this.locatorFor(TnCheckboxHarness.with({ ancestor }))();
    return checkbox.isChecked();
  }

  /**
   * Gets the count of currently selected rows, in either layout.
   *
   * @returns Promise resolving to the number of checked row checkboxes.
   */
  async getSelectedRowCount(): Promise<number> {
    // Scoped to the select cell, not the whole row/card: a checkbox projected through
    // `[tnRowActionsDef]` sits inside the row, and in card mode the detail panel is a
    // descendant of the card, so a checkbox in a detail template would inflate the count.
    // (Table mode escaped the second case only because its detail row is a sibling `<tr>`.)
    const ancestor = (await this.isCards())
      ? '.tn-table__card-select'
      : '.tn-table__row .tn-table__select-cell';
    const checkboxes = await this.locatorForAll(TnCheckboxHarness.with({ ancestor }))();
    let count = 0;
    for (const cb of checkboxes) {
      if (await cb.isChecked()) {
        count++;
      }
    }
    return count;
  }

  // --- Expansion ---

  /**
   * Clicks the expand button for a specific row.
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async toggleRowExpansion(rowIndex: number): Promise<void> {
    await this.assertTableLayout('toggleRowExpansion');
    await this.assertRowExists(rowIndex);
    const button = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__expand-button`
    )();
    await button.click();
  }

  /**
   * Checks if a data row is currently expanded.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row has the expanded class.
   */
  async isRowExpanded(rowIndex: number): Promise<boolean> {
    await this.assertTableLayout('isRowExpanded');
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    return row.hasClass('tn-table__row--expanded');
  }

  /**
   * Checks whether a row exposes an expand control. Returns false for rows made
   * non-expandable via the table's `isRowExpandable` predicate.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row has an expand button.
   */
  async hasExpandControl(rowIndex: number): Promise<boolean> {
    await this.assertTableLayout('hasExpandControl');
    await this.assertRowExists(rowIndex);
    const button = await this.locatorForOptional(
      `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__expand-button`
    )();
    return button !== null;
  }

  // --- Clickable rows ---

  /**
   * Clicks a row (for tables with `clickable` enabled).
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async clickRow(rowIndex: number): Promise<void> {
    await this.assertTableLayout('clickRow');
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    await row.click();
  }

  /**
   * Double-clicks a row (for tables with `clickable` enabled), triggering
   * `rowDoubleClick`. Note that a real double-click also fires two single
   * clicks first; this helper dispatches only the `dblclick` event.
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async doubleClickRow(rowIndex: number): Promise<void> {
    await this.assertTableLayout('doubleClickRow');
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    await row.dispatchEvent('dblclick');
  }

  /**
   * Sends a keyboard event to a row (Enter/Space activate clickable rows).
   *
   * @param rowIndex Zero-based index of the data row.
   * @param key Which key to press — Enter or Space.
   */
  async pressKeyOnRow(rowIndex: number, key: 'enter' | 'space'): Promise<void> {
    await this.assertTableLayout('pressKeyOnRow');
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    await row.focus();
    if (key === 'enter') {
      await row.sendKeys(TestKey.ENTER);
    } else {
      await row.sendKeys(' ');
    }
  }

  /**
   * Checks if a row is keyboard-focusable (tabindex=0).
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async isRowFocusable(rowIndex: number): Promise<boolean> {
    await this.assertTableLayout('isRowFocusable');
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    return (await row.getAttribute('tabindex')) === '0';
  }

  // --- Loading ---

  /**
   * Checks whether the table is currently in the loading state.
   *
   * @returns Promise resolving to true if the loading overlay is visible.
   */
  async isLoading(): Promise<boolean> {
    const overlay = await this.locatorForOptional('.tn-table__loading-overlay')();
    return overlay !== null;
  }

  // --- Active row ---

  /**
   * Checks if a data row is currently marked active.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row has the active class.
   */
  async isRowActive(rowIndex: number): Promise<boolean> {
    if (await this.isCards()) {
      const card = await this.locatorFor(
        `.tn-table__card[data-row-index="${rowIndex}"]`
      )();
      return card.hasClass('tn-table__card--active');
    }
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    return row.hasClass('tn-table__row--active');
  }

  /**
   * Gets the index of the currently active row, or null if none is active.
   *
   * @returns Promise resolving to the active row index or null.
   */
  async getActiveRowIndex(): Promise<number | null> {
    // Layout-aware for the same reason as the selection block: card mode marks the active
    // row as `.tn-table__card--active` and renders no `.tn-table__row` at all, so a
    // row-only locator answered null — "nothing is active" — over a visibly active card.
    // Silent wrong answers are worse than a throw; this one could green a test after a
    // resize.
    const selector = (await this.isCards())
      ? '.tn-table__card--active'
      : '.tn-table__row--active';
    const active = await this.locatorForOptional(selector)();
    if (!active) { return null; }
    const attr = await active.getAttribute('data-row-index');
    return attr === null ? null : Number(attr);
  }

  /**
   * Gets the text content of an expanded detail row.
   *
   * @param detailIndex Zero-based index among currently visible detail rows.
   * @returns Promise resolving to the detail row text.
   */
  async getDetailRowContent(detailIndex: number): Promise<string> {
    await this.assertTableLayout('getDetailRowContent');
    const detailRows = await this.locatorForAll('.tn-table__detail-row')();
    if (detailIndex >= detailRows.length) {
      throw new Error(
        `Detail row index ${detailIndex} out of bounds (${detailRows.length} detail rows)`
      );
    }
    return (await detailRows[detailIndex].text()).trim();
  }

  /**
   * Gets the count of currently expanded detail rows.
   *
   * @returns Promise resolving to the number of visible detail rows.
   */
  async getExpandedRowCount(): Promise<number> {
    if (await this.isCards()) {
      const panels = await this.locatorForAll('.tn-table__card-detail')();
      return panels.length;
    }
    const detailRows = await this.locatorForAll('.tn-table__detail-row')();
    return detailRows.length;
  }

  // --- Card layout (responsive) ---

  /**
   * Reports the currently rendered layout: `cards` when the container is narrow
   * enough that `mobileLayout="cards"` has taken effect, otherwise `table`.
   *
   * @returns Promise resolving to 'cards' or 'table'.
   */
  async getLayoutMode(): Promise<'cards' | 'table'> {
    const cards = await this.locatorForOptional('.tn-table__cards')();
    return cards ? 'cards' : 'table';
  }

  /**
   * Gets the number of rendered cards (card layout only).
   *
   * @returns Promise resolving to the card count.
   */
  async getCardCount(): Promise<number> {
    const cards = await this.locatorForAll('.tn-table__card')();
    return cards.length;
  }

  /**
   * Gets the title text of a card.
   *
   * @param cardIndex Zero-based index of the card.
   * @returns Promise resolving to the card title text.
   */
  async getCardTitle(cardIndex: number): Promise<string> {
    const title = await this.locatorFor(
      `.tn-table__card[data-row-index="${cardIndex}"] .tn-table__card-title`
    )();
    return (await title.text()).trim();
  }

  /**
   * Gets the value text of a field within a card, by column name. The field
   * may be a primary field or one tucked under "More fields".
   *
   * @param cardIndex Zero-based index of the card.
   * @param columnName The column's data-column attribute value.
   * @returns Promise resolving to the field's value text.
   */
  async getCardFieldValue(cardIndex: number, columnName: string): Promise<string> {
    const value = await this.locatorFor(
      `.tn-table__card[data-row-index="${cardIndex}"] .tn-table__card-field[data-column="${columnName}"] .tn-table__card-field-value`
    )();
    return (await value.text()).trim();
  }

  /**
   * Gets the column names of the fields shown directly on a card (i.e. not
   * those hidden behind the "More fields" disclosure).
   *
   * @param cardIndex Zero-based index of the card.
   * @returns Promise resolving to an array of column names.
   */
  async getCardPrimaryFieldColumns(cardIndex: number): Promise<string[]> {
    const fields = await this.locatorForAll(
      `.tn-table__card[data-row-index="${cardIndex}"] > .tn-table__card-fields > .tn-table__card-field[data-column]`
    )();
    const columns: string[] = [];
    for (const field of fields) {
      const col = await field.getAttribute('data-column');
      if (col !== null) { columns.push(col); }
    }
    return columns;
  }

  /**
   * Expands the "More fields" disclosure on a card to reveal lower-priority
   * fields. No-op if the card has no secondary fields.
   *
   * @param cardIndex Zero-based index of the card.
   */
  async expandCardMoreFields(cardIndex: number): Promise<void> {
    const summary = await this.locatorForOptional(
      `.tn-table__card[data-row-index="${cardIndex}"] .tn-table__card-more-summary`
    )();
    if (summary) { await summary.click(); }
  }

  /**
   * Toggles a card's detail section (card layout equivalent of row expansion).
   *
   * @param cardIndex Zero-based index of the card.
   */
  async toggleCardDetail(cardIndex: number): Promise<void> {
    const toggle = await this.locatorFor(
      `.tn-table__card[data-row-index="${cardIndex}"] .tn-table__card-detail-toggle`
    )();
    await toggle.click();
  }

  /**
   * Gets the currently selected sort column in the card-layout sort menu, or
   * `''` when unsorted. Returns null if the sort menu isn't rendered.
   *
   * @returns Promise resolving to the selected column name, '', or null.
   */
  async getCardSortColumn(): Promise<string | null> {
    const select = await this.locatorForOptional('.tn-table__cards-sort-select')();
    if (!select) { return null; }
    return select.getProperty<string>('value');
  }

  /**
   * Gets the active sort direction in the card layout, read from the direction toggle's
   * `data-sort-direction`. Deliberately not derived from the button's `aria-label`: matching
   * display text would silently report one direction forever if the wording or locale changed.
   *
   * @returns Promise resolving to 'asc' or 'desc'; `''` both when sorted by nothing and when the
   *   active column isn't sortable (the toggle isn't rendered in either case, and this reads the
   *   rendered control — so a non-sortable active column reports `''` even though the component's
   *   `sortDirection()` holds a value); or null when the card sort menu isn't rendered at all
   *   (table layout, or no sortable columns) — the same null-vs-empty distinction
   *   {@link getCardSortColumn} makes.
   */
  async getCardSortDirection(): Promise<'asc' | 'desc' | '' | null> {
    const menu = await this.locatorForOptional('.tn-table__cards-sort')();
    if (!menu) { return null; }
    const button = await this.locatorForOptional('.tn-table__cards-sort-dir')();
    if (!button) { return ''; }
    const direction = await button.getAttribute('data-sort-direction');
    // Report the empty direction rather than rounding it up to 'asc'. A column set with
    // no direction is not sorted, and claiming otherwise made this getter contradict its
    // own contract — and hid the fact that the button rendered a direction for it.
    if (direction === 'asc' || direction === 'desc') { return direction; }
    return '';
  }

  /**
   * Clicks the sort-direction toggle in the card-layout sort menu. No-op when the toggle
   * isn't rendered, which is three cases: the table layout is showing (the whole card sort
   * menu is absent — so a call made before the container narrowed does nothing and reports
   * success), no active sort column, or an active column that isn't `sortable()` — card mode
   * deliberately declines to reorder by a column whose table header ignores clicks.
   */
  async toggleCardSortDirection(): Promise<void> {
    const button = await this.locatorForOptional('.tn-table__cards-sort-dir')();
    if (button) { await button.click(); }
  }

  // --- Internal helpers ---

  private async assertRowExists(rowIndex: number): Promise<void> {
    // Counts `.tn-table__row` directly rather than calling `getRowCount()`, which is
    // layout-aware: in card mode that counts cards, so this guard passed for every valid
    // index and stopped catching the very mismatch it exists for. Row-only methods pair it
    // with `assertTableLayout()`, which reports the layout mismatch first.
    const rows = await this.locatorForAll('.tn-table__row')();
    if (rowIndex >= rows.length) {
      throw new Error(
        `Row index ${rowIndex} out of bounds (${rows.length} rows)`
      );
    }
  }
}

/**
 * Filters for finding `TnTableHarness` instances.
 */
export interface TnTableHarnessFilters extends BaseHarnessFilters {}
