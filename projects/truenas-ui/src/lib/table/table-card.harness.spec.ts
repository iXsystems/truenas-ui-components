import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTableComponent } from './table.component';
import { TnTableHarness } from './table.harness';
import {
  TnCellDefDirective,
  TnDetailRowDefDirective,
  TnHeaderCellDefDirective,
  TnRowActionsDefDirective,
  TnTableColumnDirective,
} from '../table-column/table-column.directive';

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

// jsdom has no ResizeObserver, so the table can't measure its own container. This
// stand-in lets a test push a width through the real callback path.
class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  constructor(private cb: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }
  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
  emitWidth(width: number): void {
    this.cb(
      [{ contentRect: { width } } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

/**
 * Exercises card mode with real `tnColumnDef` inputs — `cardTitle`, `cardHidden`,
 * `priority` and `cardLabel` — driven through the public harness rather than raw
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
      (rowClick)="rowClicks.push($event)"
      (rowDoubleClick)="rowDoubleClicks.push($event)">
      <!-- id is displayed in table mode but deliberately kept off the card. -->
      <ng-container tnColumnDef="id" label="ID" [cardHidden]="true">
        <ng-template tnHeaderCellDef>ID</ng-template>
        <ng-template let-row tnCellDef>{{ row.id }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="name" label="Name" [cardTitle]="titleOnName" [sortable]="true">
        <ng-template tnHeaderCellDef>Name</ng-template>
        <ng-template let-row tnCellDef>{{ row.name }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="status" label="Status" [priority]="100" [sortable]="true">
        <ng-template tnHeaderCellDef>Status</ng-template>
        <ng-template let-row tnCellDef>{{ row.status }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="role" label="Role" [priority]="80">
        <ng-template tnHeaderCellDef>Role</ng-template>
        <ng-template let-row tnCellDef>{{ row.role }}</ng-template>
      </ng-container>

      <ng-container tnColumnDef="email" label="Email" cardLabel="Email address" [priority]="10">
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
  titleOnName = true;
  cardPrimaryCount = 3;
  rowClicks: Server[] = [];
  rowDoubleClicks: Server[] = [];
  actionClicks: Server[] = [];
  detailButtonClicks = 0;
}

describe('TnTable card layout', () => {
  let fixture: ComponentFixture<TableCardTestComponent>;
  let component: TableCardTestComponent;
  let loader: HarnessLoader;
  let harness: TnTableHarness;
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(async () => {
    originalResizeObserver = globalThis.ResizeObserver;
    MockResizeObserver.instances = [];
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

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
    globalThis.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
  });

  /** Pushes a sub-breakpoint width so the table switches to cards. */
  async function goNarrow(): Promise<void> {
    MockResizeObserver.instances.forEach((o) => o.emitWidth(320));
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

    it('returns to the table layout when the container grows past the breakpoint', async () => {
      await goNarrow();
      expect(await harness.getLayoutMode()).toBe('cards');

      MockResizeObserver.instances.forEach((o) => o.emitWidth(900));
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

    it('flips direction from the card toolbar', async () => {
      await harness.clickSortHeader('name');
      await goNarrow();
      expect(await harness.getCardSortDirection()).toBe('asc');

      await harness.toggleCardSortDirection();

      expect(await harness.getCardSortDirection()).toBe('desc');
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
      fixture.detectChanges();
    });

    it('derives the floor from the displayed columns', () => {
      expect(tableMinWidth()).toBe('calc(120px * 5)');
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

  // Scroll mode is the default `mobileLayout`, and had no coverage at all — the pinned-column
  // rules are host-scoped CSS, so what's assertable in jsdom is that the host state class lands
  // and the table (not cards) still renders. The pinning geometry itself is verified in a browser.
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

      MockResizeObserver.instances.forEach((o) => o.emitWidth(900));
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

      const checkbox = cardEl(0).querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });
});
