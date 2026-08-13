import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import type { TnSortEvent } from './table.component';
import { TnTableComponent } from './table.component';
import { TnTableHarness } from './table.harness';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnHeaderCellDefDirective,
  TnRowActionsDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';
import { emitContainerWidth, installMockResizeObserver } from './testing/mock-resize-observer';

interface Server {
  id: number;
  name: string;
  status: string;
  role: string;
  email: string;
}

const SERVERS: Server[] = [
  { id: 101, name: 'alpha', status: 'active', role: 'primary', email: 'a@example.com' },
  { id: 102, name: 'beta', status: 'idle', role: 'replica', email: 'b@example.com' },
];

/**
 * Exercises card mode with real `tnColumnDef` inputs — `cardTitle`, `cardHidden`,
 * `cardPriority` and `cardLabel` — driven through the public harness rather than raw
 * DOM queries, so the harness's card API is covered by the same tests.
 */
@Component({
  selector: 'tn-table-card-test',
  standalone: true,
  imports: [
    TnTableComponent,
    TnTableColumnDirective,
    TnHeaderCellDefDirective,
    TnCellDefDirective,
    TnDetailRowDefDirective,
    TnRowActionsDefDirective,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table
      [mobileLayout]="mobileLayout"
      [dataSource]="tableData"
      [displayedColumns]="displayedColumns"
      [selectable]="selectable"
      [clickable]="clickable"
      [expandable]="expandable"
      [expandOnRowClick]="expandOnRowClick"
      [cardPrimaryCount]="cardPrimaryCount"
      [fixedLayout]="fixedLayout"
      [minColumnWidth]="minColumnWidth"
      [minWidth]="minWidth"
      [activeRow]="activeRow"
      [loading]="loading"
      (sortChange)="sortEvents.push($event)"
      (rowClick)="rowClicks.push($event)"
      (rowDoubleClick)="rowDoubleClicks.push($event)">
      <!--
        id is displayed in table mode but deliberately kept off the card. Sortable on
        purpose: a cardHidden column must stay sortable from the table header while
        being absent from the card sort menu.
      -->
      <ng-container tnColumnDef="id" label="ID" [cardHidden]="true" [sortable]="true">
        <ng-template tnHeaderCellDef>ID</ng-template>
        <ng-template let-row tnCellDef>{{ row.id }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="name" label="Name" [cardTitle]="titleOnName" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>

      <!-- A control in a SORTABLE header: clicking it must not also re-sort the table. -->
      <ng-container tnColumnDef="status" label="Status" [cardPriority]="100" [sortable]="true">
        <ng-template tnHeaderCellDef>
          <button
            type="button"
            class="header-filter-sortable"
            (click)="headerFilterClicks = headerFilterClicks + 1">
            Status
          </button>
        </ng-template>
        <ng-template let-row tnCellDef>{{ row.status }}</ng-template>
      </ng-container>

      <!--
        A control projected into a NON-sortable header. Every other header in this fixture
        projects plain text, which is exactly why the header-guard bug was invisible.
      -->
      <ng-container tnColumnDef="role" label="Role" [cardPriority]="80">
        <ng-template tnHeaderCellDef>
          <button type="button" class="header-filter" (click)="headerFilterClicks = headerFilterClicks + 1">
            Role
          </button>
        </ng-template>
        <ng-template let-row tnCellDef>{{ row.role }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="email" label="Email" cardLabel="Email address" [cardPriority]="10">
        <ng-template tnHeaderCellDef>Email</ng-template>
        <ng-template let-row tnCellDef>{{ row.email }}</ng-template>
      </ng-container>

      @if (expandable) {
        <ng-template let-row tnDetailRowDef>
          <div class="detail-body">
            <button
              type="button"
              class="detail-button"
              (click)="detailButtonClicks = detailButtonClicks + 1">
              Restart {{ row.name }}
            </button>
            <input class="detail-input" [value]="row.name" />
          </div>
        </ng-template>
      }

      @if (withActions) {
        <ng-template let-row tnRowActionsDef>
          <button type="button" class="row-action" (click)="actionClicks.push(row)">Edit</button>
        </ng-template>
      }
    </tn-table>
  `,
})
class TableCardTestComponent {
  tableData: Server[] = [...SERVERS];
  displayedColumns = ['id', 'name', 'status', 'role', 'email'];
  mobileLayout: 'cards' | 'scroll' = 'cards';
  selectable = false;
  clickable = false;
  expandable = false;
  expandOnRowClick = false;
  withActions = false;
  fixedLayout = false;
  minColumnWidth = '';
  minWidth = '';
  activeRow: Server | null = null;
  loading = false;
  titleOnName = true;
  cardPrimaryCount = 3;
  sortEvents: TnSortEvent[] = [];
  rowClicks: Server[] = [];
  rowDoubleClicks: Server[] = [];
  actionClicks: Server[] = [];
  detailButtonClicks = 0;
  headerFilterClicks = 0;
}

describe('TnTable card layout', () => {
  let fixture: ComponentFixture<TableCardTestComponent>;
  let component: TableCardTestComponent;
  let loader: HarnessLoader;
  let harness: TnTableHarness;
  let restoreResizeObserver: () => void;

  beforeEach(async () => {
    restoreResizeObserver = installMockResizeObserver();

    await TestBed.configureTestingModule({
      imports: [TableCardTestComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableCardTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(TnTableHarness);
  });

  afterEach(() => {
    restoreResizeObserver();
  });

  /** Pushes a sub-breakpoint width so the table switches to cards. */
  async function goNarrow(): Promise<void> {
    emitContainerWidth(320);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /** Drives the card toolbar's sort <select> the way a user would. */
  function selectSortColumn(column: string): void {
    const select = fixture.nativeElement.querySelector(
      '.tn-table__cards-sort-select'
    ) as HTMLSelectElement;
    select.value = column;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function cardEl(index: number): HTMLElement {
    return fixture.nativeElement.querySelector(
      `.tn-table__card[data-row-index="${index}"]`
    ) as HTMLElement;
  }

  describe('layout switch', () => {
    it('reports the table layout until the container is measured as narrow', async () => {
      expect(await harness.getLayoutMode()).toBe('table');

      await goNarrow();

      expect(await harness.getLayoutMode()).toBe('cards');
      expect(await harness.getCardCount()).toBe(2);
    });

    it('treats a zero width as unmeasurable rather than narrow', async () => {
      // A table inside a `display: none` container reports a 0x0 contentRect. Reading that
      // as "narrow" would flip it to card mode and tear down anything keyed off
      // isCardMode() for a resize that never happened. `measureContainer` has always
      // guarded this; the observer path had not.
      emitContainerWidth(0);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(await harness.getLayoutMode()).toBe('table');
      expect(await harness.getCardCount()).toBe(0);
    });

    it('returns to the table layout when the container grows past the breakpoint', async () => {
      await goNarrow();
      expect(await harness.getLayoutMode()).toBe('cards');

      emitContainerWidth(900);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(await harness.getLayoutMode()).toBe('table');
      expect(await harness.getRowCount()).toBe(2);
    });
  });

  describe('column def inputs', () => {
    it('titles the card from the cardTitle column', async () => {
      await goNarrow();

      expect(await harness.getCardTitle(0)).toBe('alpha');
      expect(await harness.getCardTitle(1)).toBe('beta');
    });

    it('skips a cardHidden column when falling back to a title', async () => {
      // No column claims cardTitle, so the fallback runs. `id` is first in
      // displayedColumns but cardHidden, so `name` should win.
      component.titleOnName = false;
      fixture.detectChanges();
      await goNarrow();

      expect(await harness.getCardTitle(0)).toBe('alpha');
    });

    it('omits cardHidden columns from the card fields entirely', async () => {
      await goNarrow();
      await harness.expandCardMoreFields(0);

      const shown = fixture.nativeElement.querySelectorAll(
        '.tn-table__card[data-row-index="0"] .tn-table__card-field[data-column]'
      );
      const columns = [...shown].map((el) => (el as HTMLElement).dataset['column']);
      // Asserted in full — `not.toContain('id')` would also pass if no fields rendered at all.
      expect(columns).toEqual(['status', 'role', 'email']);
    });

    it('orders fields by descending priority', async () => {
      await goNarrow();

      // status(100) > role(80) > email(10); id is hidden, name is the title.
      expect(await harness.getCardPrimaryFieldColumns(0)).toEqual(['status', 'role', 'email']);
    });

    it('folds fields past cardPrimaryCount behind the disclosure', async () => {
      component.cardPrimaryCount = 2;
      fixture.detectChanges();
      await goNarrow();

      expect(await harness.getCardPrimaryFieldColumns(0)).toEqual(['status', 'role']);
      expect(cardEl(0).querySelector('.tn-table__card-more')).not.toBeNull();
    });

    it('prefers cardLabel over the shared label for a field', async () => {
      component.cardPrimaryCount = 5;
      fixture.detectChanges();
      await goNarrow();

      const label = cardEl(0).querySelector(
        '.tn-table__card-field[data-column="email"] .tn-table__card-field-label'
      ) as HTMLElement;
      expect(label.textContent?.trim()).toBe('Email address');
    });

    it('keeps a cardHidden column out of the card sort menu', async () => {
      await goNarrow();

      const options = [...fixture.nativeElement.querySelectorAll(
        '.tn-table__cards-sort-select option'
      )].map((o) => (o as HTMLOptionElement).value);

      // '' is the "Unsorted" option. `id` is sortable but cardHidden, so offering it
      // would reorder the cards by a value no card displays.
      expect(options).toEqual(['', 'name', 'status']);
    });

    // The filter must not strand an *active* sort. Dropping the sorted column from the
    // menu left the picker reset to "Unsorted" while the direction toggle still showed an
    // arrow — and picking "Unsorted" fired no change event, because it was already
    // selected, so the sort could not be cleared from card mode at all.
    it('keeps an active cardHidden column in the menu after switching to cards', async () => {
      await harness.clickSortHeader('id');
      await goNarrow();

      const options = [...fixture.nativeElement.querySelectorAll(
        '.tn-table__cards-sort-select option'
      )].map((o) => (o as HTMLOptionElement).value);
      expect(options).toContain('id');
      expect(await harness.getCardSortColumn()).toBe('id');
      expect(await harness.getCardSortDirection()).toBe('asc');
    });

    it('lets an active cardHidden sort be cleared from card mode', async () => {
      await harness.clickSortHeader('id');
      await goNarrow();
      component.sortEvents = [];

      selectSortColumn('');

      expect(await harness.getCardSortColumn()).toBe('');
      expect(component.sortEvents).toEqual([{ column: '', direction: '' }]);
    });

    it('drops the column from the menu again once the sort moves elsewhere', async () => {
      await harness.clickSortHeader('id');
      await goNarrow();
      selectSortColumn('name');

      const options = [...fixture.nativeElement.querySelectorAll(
        '.tn-table__cards-sort-select option'
      )].map((o) => (o as HTMLOptionElement).value);
      expect(options).toEqual(['', 'name', 'status']);
    });

    // Reconciliation is against the rendered option set, so it holds for every reason a
    // sorted column can go missing — not just `cardHidden`.
    it('keeps an active non-sortable column listed, but offers no direction toggle', async () => {
      const table = fixture.debugElement.children[0].componentInstance as TnTableComponent;
      table.sortColumn.set('role'); // displayed, but never [sortable]
      table.sortDirection.set('desc');
      fixture.detectChanges();
      await goNarrow();

      // Listed so the sort stays clearable...
      expect(await harness.getCardSortColumn()).toBe('role');
      // ...but the toggle doesn't ride along: clicking the `role` header in table mode does
      // nothing, so card mode must not offer to reorder by it either.
      expect(fixture.nativeElement.querySelector('.tn-table__cards-sort-dir')).toBeNull();
      expect(await harness.getCardSortDirection()).toBe('');
    });

    it('refuses toggleSortDirection for a non-sortable active column', async () => {
      const table = fixture.debugElement.children[0].componentInstance as TnTableComponent;
      table.sortColumn.set('role');
      table.sortDirection.set('asc');
      fixture.detectChanges();
      await goNarrow();
      component.sortEvents = [];

      table.toggleSortDirection();

      expect(table.sortDirection()).toBe('asc');
      expect(component.sortEvents).toEqual([]);
    });

    it('keeps an active column that is not displayed at all in the menu', async () => {
      const table = fixture.debugElement.children[0].componentInstance as TnTableComponent;
      table.sortColumn.set('ghost');
      table.sortDirection.set('asc');
      fixture.detectChanges();
      await goNarrow();

      // Better a listed column with a bare name than a picker reading "Unsorted" beside an
      // arrow, with no way to clear it.
      expect(await harness.getCardSortColumn()).toBe('ghost');
    });

    it('still sorts by a cardHidden column from the table header', async () => {
      // The exclusion is card-layout-only; the column is visible in table mode.
      await harness.clickSortHeader('id');

      expect(component.sortEvents.at(-1)).toEqual({ column: 'id', direction: 'asc' });
    });

    it('reads field values through the harness', async () => {
      await goNarrow();

      expect(await harness.getCardFieldValue(0, 'status')).toBe('active');
      expect(await harness.getCardFieldValue(1, 'role')).toBe('replica');
    });
  });

  describe('card sort menu', () => {
    it('reflects a sort applied before card mode engaged', async () => {
      // Sort in table mode, then narrow — the select must show the active column
      // rather than resetting to "Unsorted".
      await harness.clickSortHeader('name');
      await goNarrow();

      expect(await harness.getCardSortColumn()).toBe('name');
    });

    // The two layouts share one `sortChange` contract, so the shape emitted on clear must not
    // depend on which one is rendered. Table mode used to fall back to the clicked column name
    // (`sortColumn() || column`) while card mode emitted '', so a consumer keying off
    // `event.column` got a different answer at different container widths.
    describe('sortChange parity on clear', () => {
      it('emits an empty column from the table header', async () => {
        await harness.clickSortHeader('name'); // asc
        await harness.clickSortHeader('name'); // desc
        component.sortEvents = [];

        await harness.clickSortHeader('name'); // cleared

        expect(component.sortEvents).toEqual([{ column: '', direction: '' }]);
      });

      it('emits the same from the card sort menu', async () => {
        await harness.clickSortHeader('name');
        await goNarrow();
        component.sortEvents = [];

        selectSortColumn('');

        expect(component.sortEvents).toEqual([{ column: '', direction: '' }]);
      });

      // A column set with an empty direction is not sorted. It's reachable through the two-way
      // `[(sortColumn)]` binding — a consumer restoring only the column — and all three sort
      // controls used to disagree about it: the header did nothing (but still emitted), the card
      // direction toggle jumped straight to descending, and only the card select got it right.
      describe('a restored column with no direction', () => {
        function table(): TnTableComponent {
          return fixture.debugElement.children[0].componentInstance as TnTableComponent;
        }

        function restoreColumnOnly(): void {
          table().sortColumn.set('name');
          table().sortDirection.set('');
          fixture.detectChanges();
          component.sortEvents = [];
        }

        it('starts a fresh ascending sort from the table header', async () => {
          restoreColumnOnly();

          await harness.clickSortHeader('name');

          expect(table().sortDirection()).toBe('asc');
          expect(component.sortEvents).toEqual([{ column: 'name', direction: 'asc' }]);
        });

        it('starts at ascending from the card direction toggle, not descending', async () => {
          await goNarrow();
          restoreColumnOnly();

          await harness.toggleCardSortDirection();

          expect(await harness.getCardSortDirection()).toBe('asc');
          expect(component.sortEvents).toEqual([{ column: 'name', direction: 'asc' }]);
        });

        it('shows a neutral direction icon rather than claiming a direction', async () => {
          await goNarrow();
          restoreColumnOnly();

          const button = fixture.nativeElement.querySelector(
            '.tn-table__cards-sort-dir'
          ) as HTMLElement;
          // Still rendered — it is how the user escapes the state — but neutral.
          expect(button).not.toBeNull();
          expect(button.getAttribute('data-sort-direction')).toBe('');
          expect(button.getAttribute('aria-label')).toBe('Sort ascending');
          expect(button.querySelector('tn-icon')?.getAttribute('name')).toBe('mat-unfold_more');
          expect(await harness.getCardSortDirection()).toBe('');
        });

        it('starts a fresh ascending sort from the card sort menu', async () => {
          await goNarrow();
          restoreColumnOnly();

          selectSortColumn('name');

          expect(component.sortEvents).toEqual([{ column: 'name', direction: 'asc' }]);
        });
      });

      it('still names the column when a sort is applied, in both layouts', async () => {
        await harness.clickSortHeader('name');
        expect(component.sortEvents.at(-1)).toEqual({ column: 'name', direction: 'asc' });

        await goNarrow();
        selectSortColumn('status');

        expect(component.sortEvents.at(-1)).toEqual({ column: 'status', direction: 'asc' });
      });
    });

    it('flips direction from the card toolbar, both ways', async () => {
      await harness.clickSortHeader('name');
      await goNarrow();
      expect(await harness.getCardSortDirection()).toBe('asc');

      await harness.toggleCardSortDirection();
      expect(await harness.getCardSortDirection()).toBe('desc');

      // desc -> asc as well. This half lost its only assertion when the bare-component
      // test was repointed at the sortability guard, and the ''-> asc case exercises the
      // same ternary arm, so branch coverage would not have shown the gap.
      await harness.toggleCardSortDirection();
      expect(await harness.getCardSortDirection()).toBe('asc');
    });

    it('resets to ascending when the sorted column changes', async () => {
      await harness.clickSortHeader('name');
      await goNarrow();
      await harness.toggleCardSortDirection();
      expect(await harness.getCardSortDirection()).toBe('desc');

      // Picking a different column must not inherit the previous direction.
      selectSortColumn('status');

      expect(await harness.getCardSortColumn()).toBe('status');
      expect(await harness.getCardSortDirection()).toBe('asc');
    });
  });

  describe('card detail section', () => {
    beforeEach(() => {
      component.expandable = true;
      component.clickable = true;
      fixture.detectChanges();
    });

    it('toggles detail content from the Details button', async () => {
      await goNarrow();
      expect(cardEl(0).querySelector('.detail-body')).toBeNull();

      await harness.toggleCardDetail(0);

      expect(cardEl(0).querySelector('.detail-body')).not.toBeNull();
    });

    // Regression: the detail panel is rendered *inside* the clickable card, so a
    // click on projected content used to bubble into card activation — emitting
    // rowClick and, with expandOnRowClick, collapsing the panel being used.
    it('does not activate the card when projected detail content is clicked', async () => {
      component.expandOnRowClick = true;
      fixture.detectChanges();
      await goNarrow();
      await harness.toggleCardDetail(0);

      const button = cardEl(0).querySelector('.detail-button') as HTMLButtonElement;
      button.click();
      fixture.detectChanges();

      expect(component.detailButtonClicks).toBe(1);
      expect(component.rowClicks).toEqual([]);
      expect(cardEl(0).querySelector('.detail-body')).not.toBeNull();
    });

    it('does not swallow Space typed into a projected detail input', async () => {
      await goNarrow();
      await harness.toggleCardDetail(0);

      const input = cardEl(0).querySelector('.detail-input') as HTMLInputElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
      expect(component.rowClicks).toEqual([]);
    });

    it('marks the card aria-expanded when the card itself is the expand trigger', async () => {
      component.expandOnRowClick = true;
      fixture.detectChanges();
      await goNarrow();

      expect(cardEl(0).getAttribute('aria-expanded')).toBe('false');

      cardEl(0).click();
      fixture.detectChanges();

      expect(cardEl(0).getAttribute('aria-expanded')).toBe('true');
      expect(component.rowClicks).toHaveLength(1);
    });

    // The Details button is the control a screen-reader user reaches by tabbing, so it
    // reports the state unconditionally — including when the card is also a trigger and
    // carries the same state. Redundant beats muting the real control.
    it('reports expanded state on the Details button even when the card is a trigger', async () => {
      component.expandOnRowClick = true;
      fixture.detectChanges();
      await goNarrow();

      const button = (): HTMLElement =>
        cardEl(0).querySelector('.tn-table__card-detail-toggle') as HTMLElement;
      expect(button().getAttribute('aria-expanded')).toBe('false');
      expect(button().hasAttribute('aria-controls')).toBe(false);

      await harness.toggleCardDetail(0);

      expect(button().getAttribute('aria-expanded')).toBe('true');
      expect(button().getAttribute('aria-controls')).toBe(
        cardEl(0).querySelector('.tn-table__card-detail')?.getAttribute('id')
      );
      // The card still carries it too, for a user who focuses the card itself.
      expect(cardEl(0).getAttribute('aria-expanded')).toBe('true');
    });

    it('reports expanded state on the Details button when it is the only trigger', async () => {
      await goNarrow();

      const button = (): HTMLElement =>
        cardEl(0).querySelector('.tn-table__card-detail-toggle') as HTMLElement;
      expect(button().getAttribute('aria-expanded')).toBe('false');

      await harness.toggleCardDetail(0);

      expect(button().getAttribute('aria-expanded')).toBe('true');
    });

    it('leaves aria-expanded off when the card is not an expand trigger', async () => {
      await goNarrow();

      expect(cardEl(0).hasAttribute('aria-expanded')).toBe(false);
    });
  });

  describe('card activation', () => {
    beforeEach(() => {
      component.clickable = true;
      component.withActions = true;
      fixture.detectChanges();
    });

    it('emits rowClick from the card body', async () => {
      await goNarrow();

      (cardEl(0).querySelector('.tn-table__card-title') as HTMLElement).click();
      fixture.detectChanges();

      expect(component.rowClicks).toEqual([SERVERS[0]]);
    });

    it('emits rowDoubleClick from the card body', async () => {
      await goNarrow();

      cardEl(1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      expect(component.rowDoubleClicks).toEqual([SERVERS[1]]);
    });

    it('does not emit rowClick when a projected row action is clicked', async () => {
      await goNarrow();

      (cardEl(0).querySelector('.row-action') as HTMLElement).click();
      fixture.detectChanges();

      expect(component.actionClicks).toEqual([SERVERS[0]]);
      expect(component.rowClicks).toEqual([]);
    });

    it('activates the card from a field value folded under More fields', async () => {
      component.cardPrimaryCount = 1;
      fixture.detectChanges();
      await goNarrow();
      await harness.expandCardMoreFields(0);

      const value = cardEl(0).querySelector(
        '.tn-table__card-more .tn-table__card-field-value'
      ) as HTMLElement;
      value.click();
      fixture.detectChanges();

      expect(component.rowClicks).toEqual([SERVERS[0]]);
    });
  });

  // The width floor and the detail row's colspan both have to count the trailing
  // actions column, which `displayedColumns` never mentions. Asserted through the
  // rendered style rather than the protected computed behind it.
  describe('fixedLayout width floor', () => {
    function tableMinWidth(): string {
      const table = fixture.nativeElement.querySelector('.tn-table__table') as HTMLElement;
      return table.style.minWidth;
    }

    beforeEach(() => {
      component.fixedLayout = true;
      // The derived floor is opt-in: `minColumnWidth` defaults to '' and applies none.
      component.minColumnWidth = '120px';
      fixture.detectChanges();
    });

    it('derives the floor from the displayed columns', () => {
      expect(tableMinWidth()).toBe('calc(120px * 5)');
    });

    // The floor is opt-in (#168). The actions column contributes only to a floor that exists — it
    // must not conjure one on its own, or every actions table would silently get a floor back.
    it('applies no floor at all when minColumnWidth is unset, even with an actions column', () => {
      component.minColumnWidth = '';
      component.withActions = true;
      fixture.detectChanges();

      expect(tableMinWidth()).toBe('');
    });

    it('still honours an explicit minWidth over the derivation', () => {
      component.minColumnWidth = '';
      component.minWidth = '900px';
      component.withActions = true;
      fixture.detectChanges();

      expect(tableMinWidth()).toBe('900px');
    });

    // The structural columns have fixed widths, so they contribute those rather than a
    // `minColumnWidth` share each — reserving full shares overstates the floor, and the slack
    // hides shortfalls elsewhere in it.
    it('adds the actions column width to the floor', () => {
      component.withActions = true;
      fixture.detectChanges();

      expect(tableMinWidth()).toBe('calc(120px * 5 + var(--tn-table-actions-width))');
    });

    it('counts the select and expand columns as shares, and adds the actions width', () => {
      component.selectable = true;
      component.expandable = true;
      component.withActions = true;
      fixture.detectChanges();

      // 5 displayed + __select + __expand as shares, plus the actions column's own width.
      expect(tableMinWidth()).toBe('calc(120px * 7 + var(--tn-table-actions-width))');
    });
  });

  // Table mode, deliberately: the cells stop `click`, but nothing stopped `keydown`, so
  // Enter on a projected action button bubbled to the row and was `preventDefault()`d —
  // which is exactly how Enter activates a <button>, so the consumer's handler never ran
  // and `rowClick` fired for the row instead. Card mode had guarded this from the start.
  describe('projected controls under the keyboard (table mode)', () => {
    beforeEach(() => {
      component.clickable = true;
      component.withActions = true;
      fixture.detectChanges();
    });

    function pressKey(el: HTMLElement, key: string): KeyboardEvent {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    }

    it('leaves Enter on a projected row action alone', () => {
      const button = fixture.nativeElement.querySelector(
        '.tn-table__row .row-action'
      ) as HTMLElement;

      const event = pressKey(button, 'Enter');

      // Not cancelled, so the button's own activation still happens...
      expect(event.defaultPrevented).toBe(false);
      // ...and the row doesn't claim the keystroke.
      expect(component.rowClicks).toEqual([]);
    });

    it('leaves Space on the row checkbox alone', () => {
      component.selectable = true;
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector(
        '.tn-table__row .tn-table__select-cell input[type="checkbox"]'
      ) as HTMLElement;

      const event = pressKey(input, ' ');

      expect(event.defaultPrevented).toBe(false);
      expect(component.rowClicks).toEqual([]);
    });

    it('still activates the row when the key lands on the row itself', () => {
      const row = fixture.nativeElement.querySelector('.tn-table__row') as HTMLElement;

      const event = pressKey(row, 'Enter');

      expect(event.defaultPrevented).toBe(true);
      expect(component.rowClicks).toEqual([SERVERS[0]]);
    });
  });

  // The sort icon is aria-hidden, so `aria-sort` is the only thing left telling a screen
  // reader a header is sortable. Binding it to null when unsorted left nothing at all.
  describe('sortable header discoverability (table mode)', () => {
    function th(column: string): HTMLElement {
      return fixture.nativeElement.querySelector(`th[data-column="${column}"]`) as HTMLElement;
    }

    it('marks a sortable but unsorted header aria-sort="none"', () => {
      expect(th('name').getAttribute('aria-sort')).toBe('none');
    });

    it('leaves a non-sortable header with no aria-sort at all', () => {
      expect(th('role').getAttribute('aria-sort')).toBeNull();
    });

    it('reports the direction once sorted, and returns to none when cleared', async () => {
      await harness.clickSortHeader('name');
      expect(th('name').getAttribute('aria-sort')).toBe('ascending');

      await harness.clickSortHeader('name');
      expect(th('name').getAttribute('aria-sort')).toBe('descending');

      await harness.clickSortHeader('name');
      expect(th('name').getAttribute('aria-sort')).toBe('none');
    });

    // The harness keeps "not sorted" a single value for callers, so consumer tests that
    // assert null keep working.
    it('normalises none to null through the harness', async () => {
      expect(await harness.getSortDirection('name')).toBeNull();
      expect(await harness.getSortDirection('role')).toBeNull();

      await harness.clickSortHeader('name');

      expect(await harness.getSortDirection('name')).toBe('ascending');
    });
  });

  // The mouse mirror of the keydown guard. Only the select/expand/actions cells stop
  // `click`; a control projected into an ordinary `tnCellDef` used to activate the row too,
  // while card mode never did — same consumer template, behaviour keyed to container width.
  describe('projected controls under the mouse (table mode)', () => {
    beforeEach(() => {
      component.clickable = true;
      component.withActions = true;
      fixture.detectChanges();
    });

    it('does not activate the row when a projected action is clicked', () => {
      const button = fixture.nativeElement.querySelector(
        '.tn-table__row .row-action'
      ) as HTMLElement;

      button.click();
      fixture.detectChanges();

      expect(component.actionClicks).toEqual([SERVERS[0]]);
      expect(component.rowClicks).toEqual([]);
    });

    it('still activates the row when the click lands on the row itself', () => {
      const cell = fixture.nativeElement.querySelector(
        '.tn-table__row .tn-table__cell'
      ) as HTMLElement;

      cell.click();
      fixture.detectChanges();

      expect(component.rowClicks).toEqual([SERVERS[0]]);
    });

    it('does not activate the row on a projected action double-click', () => {
      const button = fixture.nativeElement.querySelector(
        '.tn-table__row .row-action'
      ) as HTMLElement;

      button.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();

      expect(component.rowDoubleClicks).toEqual([]);
    });
  });

  // The header is an activation surface too. A control projected through tnHeaderCellDef
  // used to break both ways: its click also re-sorted, and Space on it was swallowed by the
  // header's own preventDefault even when the column wasn't sortable at all.
  describe('projected controls in a header cell', () => {
    function th(column: string): HTMLElement {
      return fixture.nativeElement.querySelector(`th[data-column="${column}"]`) as HTMLElement;
    }

    it('does not sort when a control inside a sortable header is clicked', () => {
      const button = th('status').querySelector('.header-filter-sortable') as HTMLElement;

      button.click();
      fixture.detectChanges();

      expect(component.headerFilterClicks).toBe(1);
      expect(component.sortEvents).toEqual([]);
    });

    it('does not sort on Enter pressed on a control in a sortable header', () => {
      const button = th('status').querySelector('.header-filter-sortable') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

      button.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.sortEvents).toEqual([]);
    });

    it('does not swallow Space pressed on a control in a non-sortable header', () => {
      const button = th('role').querySelector('.header-filter') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

      button.dispatchEvent(event);
      fixture.detectChanges();

      // Previously the header's preventDefault ran even though onSortClick had returned
      // early, so the control was simply dead.
      expect(event.defaultPrevented).toBe(false);
      expect(component.sortEvents).toEqual([]);
    });

    it('still sorts when the header itself is activated', () => {
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      th('name').dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
      expect(component.sortEvents.at(-1)).toEqual({ column: 'name', direction: 'asc' });
    });
  });

  describe('loading blocks interaction in both layouts', () => {
    it('marks every rendered surface inert while loading', async () => {
      component.loading = true;
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.tn-table__table') as HTMLElement;
      expect(table.hasAttribute('inert')).toBe(true);

      await goNarrow();

      const cards = fixture.nativeElement.querySelector('.tn-table__cards') as HTMLElement;
      expect(cards.hasAttribute('inert')).toBe(true);
    });

    // `inert` blurs whatever is focused inside it, and the flow that starts most loads is a
    // keyboard user pressing Enter on a sortable header — so without restoring focus they
    // were dropped to <body> and had to tab back from the top of the document.
    it('restores focus to the element inert took it from', async () => {
      const header = fixture.nativeElement.querySelector('th[data-column="name"]') as HTMLElement;
      header.focus();
      expect(document.activeElement).toBe(header);

      component.loading = true;
      fixture.detectChanges();
      // jsdom does not implement inert's blur, so stand in for it.
      (document.activeElement as HTMLElement).blur();
      expect(document.activeElement).toBe(document.body);

      component.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(header);
    });

    // Signals are glitch-free, so a false -> true flip inside one task runs the effect once,
    // seeing only `true` — with focus already on <body>. Overwriting the saved element there
    // loses the focus permanently, which is the symptom the effect exists to prevent.
    it('survives a coalesced loading flip', async () => {
      const header = fixture.nativeElement.querySelector('th[data-column="name"]') as HTMLElement;
      header.focus();

      component.loading = true;
      fixture.detectChanges();
      (document.activeElement as HTMLElement).blur();

      // Second load begins while focus is still parked on <body>.
      component.loading = false;
      component.loading = true;
      fixture.detectChanges();
      expect(document.activeElement).toBe(document.body);

      component.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(header);
    });

    it('falls back to the host when the remembered element is gone', async () => {
      const firstRow = fixture.nativeElement.querySelector('.tn-table__row') as HTMLElement;
      const cell = firstRow.querySelector('.tn-table__cell') as HTMLElement;
      cell.setAttribute('tabindex', '0');
      cell.focus();

      component.loading = true;
      fixture.detectChanges();
      (document.activeElement as HTMLElement).blur();
      // Detached explicitly: the default index `trackBy` reuses row elements, so simply
      // swapping the data would not disconnect it. An id-based `trackBy` would.
      cell.remove();

      component.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();

      const host = fixture.nativeElement.querySelector('tn-table') as HTMLElement;
      expect(document.activeElement).toBe(host);
    });

    it('does not steal focus back if the user moved on during the load', async () => {
      const header = fixture.nativeElement.querySelector('th[data-column="name"]') as HTMLElement;
      const elsewhere = document.createElement('button');
      document.body.appendChild(elsewhere);
      header.focus();

      component.loading = true;
      fixture.detectChanges();
      elsewhere.focus();

      component.loading = false;
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(elsewhere);
      elsewhere.remove();
    });

    it('drops inert again once loading finishes', () => {
      component.loading = true;
      fixture.detectChanges();
      component.loading = false;
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('.tn-table__table') as HTMLElement;
      expect(table.hasAttribute('inert')).toBe(false);
    });
  });

  describe('harness query API in card mode', () => {
    it('counts cards from getRowCount rather than answering zero', async () => {
      await goNarrow();

      expect(await harness.getRowCount()).toBe(2);
    });

    it('counts expanded card details from getExpandedRowCount', async () => {
      component.expandable = true;
      fixture.detectChanges();
      await goNarrow();
      expect(await harness.getExpandedRowCount()).toBe(0);

      await harness.toggleCardDetail(0);

      expect(await harness.getExpandedRowCount()).toBe(1);
    });

    // `hasExpandControl` answered a silent `false` in card mode once `assertRowExists`
    // started counting cards: it cleared the bounds guard, then found no
    // `.tn-table__expand-button` over a card that renders a "Details" button.
    it('throws from hasExpandControl instead of answering a silent false', async () => {
      component.expandable = true;
      fixture.detectChanges();
      await goNarrow();

      await expect(harness.hasExpandControl(0)).rejects.toThrow(/no meaning in the card layout/);
    });

    // These used to fail with a raw CDK locator error naming an internal class, which is
    // worse than the bounds message they replaced.
    it.each([
      ['isRowExpanded', () => harness.isRowExpanded(0)],
      ['toggleRowExpansion', () => harness.toggleRowExpansion(0)],
      ['clickRow', () => harness.clickRow(0)],
      ['doubleClickRow', () => harness.doubleClickRow(0)],
      ['isRowFocusable', () => harness.isRowFocusable(0)],
      ['getDetailRowContent', () => harness.getDetailRowContent(0)],
    ])('names the card API when %s is called in card mode', async (_name, call) => {
      await goNarrow();

      await expect(call()).rejects.toThrow(/no meaning in the card layout/);
    });

    it('still reports row bounds correctly in table mode', async () => {
      await expect(harness.clickRow(99)).rejects.toThrow(/out of bounds \(2 rows\)/);
    });

    // These have no card equivalent. Throwing beats an empty array, which reads as "the
    // table is empty" and greens a test over a rendered card list.
    it.each([
      ['getHeaderTexts', () => harness.getHeaderTexts()],
      ['getRowTexts', () => harness.getRowTexts(0)],
      ['getCellText', () => harness.getCellText(0, 'name')],
      ['getAllRowTexts', () => harness.getAllRowTexts()],
      // The sort block resolves `th[data-column]`, which card mode never renders.
      ['clickSortHeader', () => harness.clickSortHeader('name')],
      ['isSortable', () => harness.isSortable('name')],
      ['getSortDirection', () => harness.getSortDirection('name')],
    ])('throws from %s instead of answering emptily', async (_name, call) => {
      await goNarrow();

      await expect(call()).rejects.toThrow(/no meaning in the card layout/);
    });
  });

  describe('active row', () => {
    // `getActiveRowIndex()` used to answer null in card mode — "nothing is active" — over a
    // visibly active card, which greens a test rather than failing it.
    it('reports the active card index through the harness', async () => {
      component.activeRow = SERVERS[1];
      fixture.detectChanges();
      await goNarrow();

      expect(await harness.getActiveRowIndex()).toBe(1);
      expect(await harness.isRowActive(1)).toBe(true);
      expect(await harness.isRowActive(0)).toBe(false);
    });

    it('reports no active card when none is set', async () => {
      await goNarrow();

      expect(await harness.getActiveRowIndex()).toBeNull();
    });
  });

  // Scroll mode is the default `mobileLayout`. The pinned-column rules are host-scoped CSS,
  // so what's assertable in jsdom is that the host state class lands and the table (not cards)
  // still renders; the pinning geometry itself is verified in a browser by the
  // ScrollModePinnedColumns play function.
  describe('scroll mode', () => {
    beforeEach(() => {
      component.mobileLayout = 'scroll';
      component.selectable = true;
      fixture.detectChanges();
    });

    function host(): HTMLElement {
      return fixture.nativeElement.querySelector('tn-table') as HTMLElement;
    }

    it('marks the host tn-table--scroll below the breakpoint and keeps the table', async () => {
      expect(host().classList.contains('tn-table--scroll')).toBe(false);

      await goNarrow();

      expect(host().classList.contains('tn-table--scroll')).toBe(true);
      expect(host().classList.contains('tn-table--cards')).toBe(false);
      expect(await harness.getLayoutMode()).toBe('table');
      expect(await harness.getRowCount()).toBe(2);
    });

    it('drops the scroll state again above the breakpoint', async () => {
      await goNarrow();
      expect(host().classList.contains('tn-table--scroll')).toBe(true);

      emitContainerWidth(900);
      fixture.detectChanges();

      expect(host().classList.contains('tn-table--scroll')).toBe(false);
    });

    it('never enters card mode while mobileLayout is scroll', async () => {
      await goNarrow();

      expect(await harness.getCardCount()).toBe(0);
      expect(await harness.getLayoutMode()).toBe('table');
    });

    it('renders the select column first, so the pinning rules have their anchor', async () => {
      await goNarrow();

      const firstCell = fixture.nativeElement.querySelector(
        '.tn-table__row > .tn-table__cell'
      ) as HTMLElement;
      expect(firstCell.classList.contains('tn-table__select-cell')).toBe(true);
    });
  });

  describe('selection across the breakpoint', () => {
    beforeEach(() => {
      component.selectable = true;
      fixture.detectChanges();
    });

    it('keeps the selection when the layout switches to cards', async () => {
      await harness.toggleRowSelection(0);
      expect(await harness.getSelectedRowCount()).toBe(1);

      await goNarrow();

      // Asserted through the harness, not a raw DOM poke: the row-based locators used
      // to answer 0 here, so a "selection survived" check could pass vacuously.
      expect(await harness.getSelectedRowCount()).toBe(1);
      expect(await harness.isRowSelected(0)).toBe(true);
      expect(await harness.isRowSelected(1)).toBe(false);
    });

    it('selects and counts through the harness in card mode', async () => {
      await goNarrow();

      await harness.toggleRowSelection(1);

      expect(await harness.isRowSelected(1)).toBe(true);
      expect(await harness.getSelectedRowCount()).toBe(1);
    });

    it('selects every card through the harness select-all', async () => {
      await goNarrow();

      await harness.toggleSelectAll();

      expect(await harness.getSelectedRowCount()).toBe(2);
      expect(await harness.isRowSelected(0)).toBe(true);
      expect(await harness.isRowSelected(1)).toBe(true);
    });
  });
});
