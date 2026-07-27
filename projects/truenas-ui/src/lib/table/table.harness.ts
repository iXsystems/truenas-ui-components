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

  /**
   * Checks whether a row exposes an expand control. Returns false for rows made
   * non-expandable via the table's `isRowExpandable` predicate.
   *
   * @param rowIndex Zero-based index of the data row.
   * @returns Promise resolving to true if the row has an expand button.
   */
  async hasExpandControl(rowIndex: number): Promise<boolean> {
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
