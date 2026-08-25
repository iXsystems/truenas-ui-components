import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableTesting } from './table-testing';
import { TnTableComponent, TN_TABLE_LABELS, type TnTableLabels } from './table.component';
import {
  TnCellDefDirective, TnDetailRowDefDirective, TnHeaderCellDefDirective, TnRowActionsDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';

/**
 * The chrome the table renders itself ("Sort by", "Unsorted", "Expand row", …) used to be English
 * literals in the template with no input to bind, so a translated app could not reach them at all.
 * These pin the DI route that replaced them.
 *
 * Every field of {@link TnTableLabels} is asserted individually rather than through one
 * "does the token reach the template" case: they are ten independent bindings, and a typo in any
 * one of them lands green against a spec that only reads `unsorted`.
 */
@Component({
  selector: 'tn-table-labels-host',
  standalone: true,
  imports: [
    TnTableComponent, TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective,
    TnDetailRowDefDirective, TnRowActionsDefDirective,
  ],
  // `cardPrimaryCount` of 1 leaves `type` behind the "More fields" disclosure — `name` is the
  // card title and `size` the one primary field — which is the only thing that renders that label.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      mobileLayout="cards"
      [dataSource]="rows"
      [displayedColumns]="['name', 'size', 'type']"
      [expandable]="true"
      [cardPrimaryCount]="1">
      <ng-container tnColumnDef="name" label="Name" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="size" label="Size">
        <ng-template tnHeaderCellDef>Size</ng-template>
        <ng-template let-row tnCellDef>{{ row.size }}</ng-template>
      </ng-container>
      <ng-container tnColumnDef="type" label="Type">
        <ng-template tnHeaderCellDef>Type</ng-template>
        <ng-template let-row tnCellDef>{{ row.type }}</ng-template>
      </ng-container>
      <ng-template let-row tnDetailRowDef>Detail for {{ row.name }}</ng-template>
      <ng-template tnRowActionsDef><button type="button">Edit</button></ng-template>
    </tn-table>
  `
})
class LabelsHostComponent {
  rows = [{ name: 'alpha', size: 1, type: 'disk' }, { name: 'beta', size: 2, type: 'pool' }];
}

describe('TnTableComponent labels', () => {
  const french: TnTableLabels = {
    sortBy: 'Trier par', unsorted: 'Non trié', moreFields: 'Plus de champs',
    details: 'Détails', sortAscending: 'Trier par ordre croissant',
    sortDescending: 'Trier par ordre décroissant', expand: 'Développer',
    expandRow: 'Développer la ligne', collapseRow: 'Réduire la ligne', actions: 'Actions de ligne',
  };

  const english: TnTableLabels = {
    sortBy: 'Sort by', unsorted: 'Unsorted', moreFields: 'More fields',
    details: 'Details', sortAscending: 'Sort ascending', sortDescending: 'Sort descending',
    expand: 'Expand', expandRow: 'Expand row', collapseRow: 'Collapse row', actions: 'Actions',
  };

  type Fixture = ComponentFixture<LabelsHostComponent>;

  /**
   * @param labels Token value, or omitted to exercise the no-provider fallback.
   * @param width Container width pushed to the stand-in ResizeObserver. Below `cardBreakpoint`
   *   the table switches to cards, which is where the card-mode chrome surfaces; above it the
   *   `<table>` renders, which is where the expand and actions columns do.
   */
  function setup(
    labels?: TnTableLabels | ReturnType<typeof signal<TnTableLabels>>,
    width = 320,
  ): Fixture {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent, NoopAnimationsModule],
      providers: labels ? [{ provide: TN_TABLE_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    // jsdom has no ResizeObserver, hence the installed stand-in.
    TnTableTesting.emitContainerWidth(width);
    fixture.detectChanges();
    return fixture;
  }

  const setupTable = (labels?: TnTableLabels): Fixture => setup(labels, 1200);

  const text = (fixture: Fixture): string =>
    (fixture.nativeElement as HTMLElement).textContent ?? '';

  const labelOf = (fixture: Fixture, selector: string): string | null =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)?.getAttribute('aria-label') ?? null;

  const textOf = (fixture: Fixture, selector: string): string | null =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent?.trim() ?? null;

  let restoreResizeObserver: () => void;

  beforeEach(() => { restoreResizeObserver = TnTableTesting.installResizeObserver(); });

  afterEach(() => {
    restoreResizeObserver();
    TestBed.resetTestingModule();
  });

  describe('card-mode chrome', () => {
    it('falls back to the English defaults when no token is provided', () => {
      const fixture = setup();
      expect(labelOf(fixture, '.tn-table__cards-sort-select')).toBe('Sort by');
      expect(text(fixture)).toContain('Unsorted');
      expect(text(fixture)).toContain('More fields');
      expect(text(fixture)).toContain('Details');
    });

    it('takes sortBy, unsorted, moreFields and details from the token', () => {
      const fixture = setup(french);
      expect(labelOf(fixture, '.tn-table__cards-sort-select')).toBe('Trier par');
      expect(text(fixture)).toContain('Non trié');
      expect(text(fixture)).toContain('Plus de champs');
      expect(text(fixture)).toContain('Détails');
    });

    // The direction toggle names the ACTION, so it reads `sortAscending` from both the unsorted
    // and the descending state — the branch the label wording depends on, and worth pinning in
    // the language the consumer supplied rather than the default.
    it('names the direction toggle for the sort it would apply', () => {
      const fixture = setup(french);
      const select: HTMLSelectElement | null =
        (fixture.nativeElement as HTMLElement).querySelector('.tn-table__cards-sort-select');
      expect(select).not.toBeNull();

      select!.value = 'name';
      select!.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(labelOf(fixture, '.tn-table__cards-sort-dir')).toBe('Trier par ordre décroissant');

      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('.tn-table__cards-sort-dir')!.click();
      fixture.detectChanges();

      expect(labelOf(fixture, '.tn-table__cards-sort-dir')).toBe('Trier par ordre croissant');
    });
  });

  describe('table-mode chrome', () => {
    it('falls back to the English defaults when no token is provided', () => {
      const fixture = setupTable();
      expect(textOf(fixture, '.tn-table__expand-cell .cdk-visually-hidden')).toBe('Expand');
      expect(textOf(fixture, '.tn-table__actions-cell .cdk-visually-hidden')).toBe('Actions');
      expect(labelOf(fixture, '.tn-table__expand-button')).toBe('Expand row');
    });

    it('takes the expand and actions column headers from the token', () => {
      const fixture = setupTable(french);
      expect(textOf(fixture, '.tn-table__expand-cell .cdk-visually-hidden')).toBe('Développer');
      expect(textOf(fixture, '.tn-table__actions-cell .cdk-visually-hidden')).toBe('Actions de ligne');
    });

    it('names the row expand control for the action it performs, in both states', () => {
      const fixture = setupTable(french);
      expect(labelOf(fixture, '.tn-table__expand-button')).toBe('Développer la ligne');

      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLButtonElement>('.tn-table__expand-button')!.click();
      fixture.detectChanges();

      expect(labelOf(fixture, '.tn-table__expand-button')).toBe('Réduire la ligne');
    });
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnTableLabels>(english);
    const fixture = setup(labels);
    expect(text(fixture)).toContain('Unsorted');

    labels.set(french);
    fixture.detectChanges();

    expect(text(fixture)).toContain('Non trié');
  });
});
