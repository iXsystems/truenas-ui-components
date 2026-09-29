import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTableComponent } from './table.component';

/**
 * Destroying a table with a non-empty selection is silent (#327).
 *
 * WHAT BROKE
 * ----------
 * `ngOnInit` registers `destroyRef.onDestroy(() => this.clearSelection())`, and #313 gave
 * `clearSelection()` a trailing `emitSelectionIfChanged()` so a consumer mirroring the
 * selection in its own toolbar hears about a programmatic clear. On teardown those two
 * combine into an emit on an `OutputRef` Angular has already destroyed, which warns
 * `NG0953` in dev mode — 32 times in one CI `Run Tests` log, and in a consumer's dev build
 * every time a table with a selection goes away.
 *
 * WHY THE WARNING IS ASSERTED ON RATHER THAN JUST THE EMIT
 * -------------------------------------------------------
 * The emit and the warning are not the same observation. A destroyed `OutputRef` drops the
 * value, so a subscriber registered before teardown sees nothing either way and a spec
 * watching only `selectionChange` would have passed against the bug. `NG0953` is the part
 * that was actually visible, so it is the part pinned here.
 *
 * WHY BOTH THE KEYED AND UNKEYED CASES ARE HERE
 * --------------------------------------------
 * `emitSelectionIfChanged()` compares against `emittedSelection()`, which reads the keyed
 * store when `selectionKey` is set and the `SelectionModel` when it is not. Those are two
 * different sources, and a fix that silenced one would not necessarily silence the other.
 */
describe('TnTableComponent teardown', () => {
  const rows = [{ id: 1 }, { id: 2 }];

  let fixture: ComponentFixture<TnTableComponent>;
  let component: TnTableComponent;
  let warn: jest.SpyInstance;
  let selectionChange: jest.Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnTableComponent],
    }).compileComponents();

    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  /**
   * Build a selectable table with one row selected, subscribed to.
   *
   * The subscription is taken AFTER the toggle so the emit that the toggle itself produces
   * is not in the spy: what these tests count is what teardown adds.
   *
   * @param selectionKey Passed through to the input, or omitted for the unkeyed table.
   */
  function createTableWithSelection(selectionKey?: (row: { id: number }) => unknown): void {
    fixture = TestBed.createComponent(TnTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataSource', rows);
    fixture.componentRef.setInput('selectable', true);
    if (selectionKey) {
      fixture.componentRef.setInput('selectionKey', selectionKey);
    }
    fixture.detectChanges();

    component.toggleRowSelection(rows[0]);
    expect(component.selection.selected).toHaveLength(1);

    selectionChange = jest.fn();
    component.selectionChange.subscribe(selectionChange);
  }

  /** The `console.warn` calls that are Angular's destroyed-output warning, if any. */
  function ng0953Warnings(): unknown[][] {
    return warn.mock.calls.filter((args) => String(args[0]).includes('NG0953'));
  }

  it('emits no selectionChange and warns nothing when destroyed with a selection', () => {
    createTableWithSelection();

    fixture.destroy();

    expect(selectionChange).not.toHaveBeenCalled();
    expect(ng0953Warnings()).toEqual([]);
  });

  it('is equally silent when the selection is retained under a selectionKey', () => {
    createTableWithSelection((row) => row.id);

    fixture.destroy();

    expect(selectionChange).not.toHaveBeenCalled();
    expect(ng0953Warnings()).toEqual([]);
  });

  it('still drops the selection state on teardown', () => {
    createTableWithSelection();

    fixture.destroy();

    expect(component.selection.selected).toHaveLength(0);
  });

  // The other half of the fix: teardown is silent because it no longer goes through
  // `clearSelection()`, and `clearSelection()` itself has to keep emitting for the #313
  // toolbar. A fix that silenced the method rather than the hook passes every test above.
  it('still emits from clearSelection() while the table is alive', () => {
    createTableWithSelection();

    component.clearSelection();

    expect(selectionChange).toHaveBeenCalledTimes(1);
    expect(selectionChange).toHaveBeenCalledWith([]);
    expect(ng0953Warnings()).toEqual([]);
  });
});
