import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  TnTablePagerComponent, TN_TABLE_PAGER_LABELS, type TnTablePagerLabels,
} from './table-pager.component';

/**
 * `TN_TABLE_PAGER_LABELS` is the token the select, autocomplete, dialog and table label tokens
 * were all modelled on, and it shipped without a spec of its own. These pin the same three
 * guarantees the others now assert — no-provider fallback, plain-object token, live signal — plus
 * the per-instance override, which is the one behaviour the resolved computeds exist for.
 */
@Component({
  selector: 'tn-table-pager-labels-host',
  standalone: true,
  imports: [TnTablePagerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table-pager [totalItems]="120" [pageSize]="50" [currentPage]="2" />
    <tn-table-pager
      [totalItems]="120"
      [pageSize]="50"
      [currentPage]="2"
      [itemsPerPageLabel]="itemsPerPageLabel()"
      [tablePaginationLabel]="tablePaginationLabel()" />
  `
})
class LabelsHostComponent {
  itemsPerPageLabel = signal<string | undefined>('Rows shown');
  tablePaginationLabel = signal<string | undefined>('Dataset pages');
}

describe('TnTablePagerComponent labels', () => {
  const french: TnTablePagerLabels = {
    itemsPerPage: 'Éléments par page',
    of: 'sur',
    firstPage: 'Première page',
    previousPage: 'Page précédente',
    nextPage: 'Page suivante',
    lastPage: 'Dernière page',
    tablePagination: 'Pagination du tableau',
  };

  type Fixture = ComponentFixture<LabelsHostComponent>;

  function setup(
    labels?: TnTablePagerLabels | ReturnType<typeof signal<TnTablePagerLabels>>,
  ): Fixture {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent],
      providers: labels ? [{ provide: TN_TABLE_PAGER_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  /** The nth `<tn-table-pager>`: 0 binds no labels, 1 binds two explicitly. */
  const pager = (fixture: Fixture, index: number): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('tn-table-pager')[index] as HTMLElement;

  const text = (fixture: Fixture, index: number): string =>
    pager(fixture, index).textContent ?? '';

  /** Accessible names of the four navigation buttons, in DOM order. */
  const buttonLabels = (fixture: Fixture, index: number): (string | null)[] =>
    Array.from(pager(fixture, index).querySelectorAll('.tn-table-pager__buttons button[aria-label]'))
      .map((el) => el.getAttribute('aria-label'));

  afterEach(() => TestBed.resetTestingModule());

  it('falls back to the English defaults when no token is provided', () => {
    const fixture = setup();
    expect(text(fixture, 0)).toContain('Items per page');
    // "51 – 100 of 120" — `of` is the only label in the range sentence.
    expect(text(fixture, 0)).toContain('of');
    expect(pager(fixture, 0).getAttribute('aria-label')).toBe('Table pagination');
    expect(buttonLabels(fixture, 0))
      .toEqual(['First page', 'Previous page', 'Next page', 'Last page']);
  });

  it('renders every label from a plain-object token', () => {
    const fixture = setup(french);
    expect(text(fixture, 0)).toContain('Éléments par page');
    expect(text(fixture, 0)).toContain('sur');
    expect(pager(fixture, 0).getAttribute('aria-label')).toBe('Pagination du tableau');
    expect(buttonLabels(fixture, 0))
      .toEqual(['Première page', 'Page précédente', 'Page suivante', 'Dernière page']);
  });

  it('lets an explicit input win over the token', () => {
    const fixture = setup(french);
    expect(text(fixture, 1)).toContain('Rows shown');
    expect(pager(fixture, 1).getAttribute('aria-label')).toBe('Dataset pages');
  });

  it('falls back to the token when an explicit input is cleared', () => {
    const fixture = setup(french);
    fixture.componentInstance.itemsPerPageLabel.set(undefined);
    fixture.componentInstance.tablePaginationLabel.set(undefined);
    fixture.detectChanges();

    expect(text(fixture, 1)).toContain('Éléments par page');
    expect(pager(fixture, 1).getAttribute('aria-label')).toBe('Pagination du tableau');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnTablePagerLabels>({
      itemsPerPage: 'Items per page', of: 'of', firstPage: 'First page',
      previousPage: 'Previous page', nextPage: 'Next page', lastPage: 'Last page',
      tablePagination: 'Table pagination',
    });
    const fixture = setup(labels);
    expect(text(fixture, 0)).toContain('Items per page');

    labels.set(french);
    fixture.detectChanges();

    expect(text(fixture, 0)).toContain('Éléments par page');
    expect(pager(fixture, 0).getAttribute('aria-label')).toBe('Pagination du tableau');
  });
});
