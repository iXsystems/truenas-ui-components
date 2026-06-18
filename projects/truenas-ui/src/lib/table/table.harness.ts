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
    const rows = await this.locatorForAll('.tn-table__row')();
    return rows.length;
  }

  /**
   * Gets the text content of header cells (excludes sort icons).
   *
   * @returns Promise resolving to an array of header text strings.
   */
  async getHeaderTexts(): Promise<string[]> {
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
    const header = await this.locatorFor(
      `th[data-column="${columnName}"]`
    )();
    return header.hasClass('tn-table__header-cell--sortable');
  }

  /**
   * Gets the current sort direction for a column via aria-sort.
   *
   * @param columnName The column's data-column attribute value.
   * @returns Promise resolving to 'ascending', 'descending', or null.
   */
  async getSortDirection(columnName: string): Promise<string | null> {
    const header = await this.locatorFor(
      `th[data-column="${columnName}"]`
    )();
    return header.getAttribute('aria-sort');
  }

  // --- Selection ---

  /**
   * Clicks the select-all checkbox in the header.
   */
  async toggleSelectAll(): Promise<void> {
    const cell = await this.locatorFor(
      '.tn-table__header-row .tn-table__select-cell'
    )();
    await cell.click();
  }

  /**
   * Toggles selection for a specific row by clicking its checkbox cell.
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async toggleRowSelection(rowIndex: number): Promise<void> {
    await this.assertRowExists(rowIndex);
    const cell = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"] .tn-table__select-cell`
    )();
    await cell.click();
  }

  /**
   * Checks if a specific row's checkbox is checked.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row's checkbox is checked.
   */
  async isRowSelected(rowIndex: number): Promise<boolean> {
    await this.assertRowExists(rowIndex);
    const checkbox = await this.locatorFor(
      TnCheckboxHarness.with({
        ancestor: `.tn-table__row[data-row-index="${rowIndex}"]`,
      })
    )();
    return checkbox.isChecked();
  }

  /**
   * Gets the count of currently selected rows.
   *
   * @returns Promise resolving to the number of checked row checkboxes.
   */
  async getSelectedRowCount(): Promise<number> {
    const checkboxes = await this.locatorForAll(
      TnCheckboxHarness.with({ ancestor: '.tn-table__row' })
    )();
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
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    return row.hasClass('tn-table__row--expanded');
  }

  // --- Clickable rows ---

  /**
   * Clicks a row (for tables with `clickable` enabled).
   *
   * @param rowIndex Zero-based index of the data row.
   */
  async clickRow(rowIndex: number): Promise<void> {
    await this.assertRowExists(rowIndex);
    const row = await this.locatorFor(
      `.tn-table__row[data-row-index="${rowIndex}"]`
    )();
    await row.click();
  }

  /**
   * Sends a keyboard event to a row (Enter/Space activate clickable rows).
   *
   * @param rowIndex Zero-based index of the data row.
   * @param key Which key to press — Enter or Space.
   */
  async pressKeyOnRow(rowIndex: number, key: 'enter' | 'space'): Promise<void> {
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
    const row = await this.locatorForOptional('.tn-table__row--active')();
    if (!row) { return null; }
    const attr = await row.getAttribute('data-row-index');
    return attr === null ? null : Number(attr);
  }

  /**
   * Gets the text content of an expanded detail row.
   *
   * @param detailIndex Zero-based index among currently visible detail rows.
   * @returns Promise resolving to the detail row text.
   */
  async getDetailRowContent(detailIndex: number): Promise<string> {
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
   * Clicks the sort-direction toggle in the card-layout sort menu. No-op if no
   * sort column is active (the toggle is only shown while sorting).
   */
  async toggleCardSortDirection(): Promise<void> {
    const button = await this.locatorForOptional('.tn-table__cards-sort-dir')();
    if (button) { await button.click(); }
  }

  // --- Internal helpers ---

  private async assertRowExists(rowIndex: number): Promise<void> {
    const count = await this.getRowCount();
    if (rowIndex >= count) {
      throw new Error(
        `Row index ${rowIndex} out of bounds (${count} rows)`
      );
    }
  }
}

/**
 * Filters for finding `TnTableHarness` instances.
 */
export interface TnTableHarnessFilters extends BaseHarnessFilters {}
