import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableTesting } from './table-testing';
import { TnTableComponent, TN_TABLE_LABELS, type TnTableLabels } from './table.component';
import {
  TnCellDefDirective, TnHeaderCellDefDirective, TnTableColumnDirective,
} from '../table-column/table-column.directive';

/**
 * The card-mode chrome ("Sort by", "Unsorted", …) used to be English literals in the template
 * with no input to bind, so a translated app could not reach them at all. These pin the DI
 * route that replaced them.
 */
@Component({
  selector: 'tn-table-labels-host',
  standalone: true,
  imports: [TnTableComponent, TnTableColumnDirective, TnHeaderCellDefDirective, TnCellDefDirective],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table mobileLayout="cards" [dataSource]="rows" [displayedColumns]="['name']">
      <ng-container tnColumnDef="name" label="Name" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>
    </tn-table>
  `
})
class LabelsHostComponent {
  rows = [{ name: 'alpha' }, { name: 'beta' }];
}

describe('TnTableComponent labels', () => {
  const french: TnTableLabels = {
    sortBy: 'Trier par', unsorted: 'Non trié', moreFields: 'Plus de champs',
    details: 'Détails', expand: 'Développer', actions: 'Actions',
  };

  function setup(
    labels?: TnTableLabels | ReturnType<typeof signal<TnTableLabels>>,
  ): ComponentFixture<LabelsHostComponent> {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent, NoopAnimationsModule],
      providers: labels ? [{ provide: TN_TABLE_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    // Push a sub-`cardBreakpoint` width so the table switches to cards, which is where these
    // labels surface. jsdom has no ResizeObserver, hence the installed stand-in.
    TnTableTesting.emitContainerWidth(320);
    fixture.detectChanges();
    return fixture;
  }

  /** Card-mode chrome text, which is where these labels surface. */
  const chromeText = (fixture: ComponentFixture<LabelsHostComponent>): string =>
    (fixture.nativeElement as HTMLElement).textContent ?? '';

  let restoreResizeObserver: () => void;

  beforeEach(() => { restoreResizeObserver = TnTableTesting.installResizeObserver(); });

  afterEach(() => {
    restoreResizeObserver();
    TestBed.resetTestingModule();
  });

  it('falls back to the English default when no token is provided', () => {
    expect(chromeText(setup())).toContain('Unsorted');
  });

  it('renders the app-wide label from a plain-object token', () => {
    expect(chromeText(setup(french))).toContain('Non trié');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnTableLabels>({
      sortBy: 'Sort by', unsorted: 'Unsorted', moreFields: 'More fields',
      details: 'Details', expand: 'Expand', actions: 'Actions',
    });
    const fixture = setup(labels);
    expect(chromeText(fixture)).toContain('Unsorted');

    labels.set(french);
    fixture.detectChanges();

    expect(chromeText(fixture)).toContain('Non trié');
  });
});
