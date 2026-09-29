import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TnSidePanelComponent } from './side-panel.component';
import { TnAutocompleteComponent } from '../autocomplete/autocomplete.component';
import { TnChipInputComponent } from '../chip-input/chip-input.component';
import { TnDateInputComponent } from '../date-range-input/date-input.component';
import { TnDateRangeInputComponent } from '../date-range-input/date-range-input.component';
import { TnDrawerComponent } from '../drawer/drawer.component';
import { TnFilePickerComponent } from '../file-picker/file-picker.component';
import { TnMenuComponent } from '../menu/menu.component';
import { TnSelectComponent } from '../select/select.component';

/**
 * Escape inside a popup that is open OVER a `tn-side-panel` (#324).
 *
 * WHAT WAS WRONG
 * --------------
 * #322 made `tn-side-panel` a CDK overlay that subscribes to `keydownEvents()`.
 * CDK's `OverlayKeyboardDispatcher` listens on `<body>` and walks the attached
 * overlays from the top down, delivering the key to the first one that HAS
 * subscribers and stopping there — an overlay with none is skipped rather than
 * treated as having consumed the key. Every popup in this library was such an
 * overlay, so Escape inside an open file picker or calendar went past it to the
 * panel underneath, which closed the whole form.
 *
 * THE OTHER HALF, WHICH THE TICKET DID NOT NAME
 * ---------------------------------------------
 * `tn-select`, `tn-autocomplete` and `tn-chip-input` also closed their popup
 * from a keydown handler on the trigger or input, which is inside the PANEL's
 * DOM rather than the popup's. That handler runs while the event is still
 * bubbling towards `<body>`, and closing disposes the popup's overlay — so by
 * the time the dispatcher looked, the popup was gone from the stack and the
 * panel was the top-most subscriber. The popup closed AND the panel closed.
 * `tn-select` was measured doing this, so "the way tn-select does it" was not a
 * shape worth copying. Those handlers now call `stopPropagation()` when they
 * consume Escape, so nothing underneath acts on a key they already handled.
 *
 * WHY THOSE THREE CONSUME IT RATHER THAN DEFERRING TO THE DISPATCHER
 * -----------------------------------------------------------------
 * Because the dispatcher cannot route a key it never receives. `tn-drawer` in
 * `over` mode calls `stopPropagation()` on Escape from a handler on its own
 * panel element, which is an ANCESTOR of anything projected into it — so a
 * popup that waited for the dispatcher stayed open while the drawer closed
 * underneath it. The second `describe` below is that case.
 *
 * WHAT THESE SPECS DISPATCH
 * -------------------------
 * A bubbling `keydown`, because that is what a real key press is. Where it is
 * dispatched FROM is the difference between the two shapes above: from inside
 * the popup for the ones that take focus into their overlay, and from the input
 * for the comboboxes that leave focus in the field.
 */

@Component({
  selector: 'tn-escape-file-picker-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnFilePickerComponent],
  template: `
    <tn-side-panel title="Add SMB share" [(open)]="open">
      <tn-file-picker />
    </tn-side-panel>
  `,
})
class FilePickerPanelHostComponent {
  open = signal(false);
}

@Component({
  selector: 'tn-escape-date-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnDateInputComponent],
  template: `
    <tn-side-panel title="Add API key" [(open)]="open">
      <tn-date-input />
    </tn-side-panel>
  `,
})
class DateInputPanelHostComponent {
  open = signal(false);
}

@Component({
  selector: 'tn-escape-date-range-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnDateRangeInputComponent],
  template: `
    <tn-side-panel title="Filter" [(open)]="open">
      <tn-date-range-input />
    </tn-side-panel>
  `,
})
class DateRangeInputPanelHostComponent {
  open = signal(false);
}

@Component({
  selector: 'tn-escape-autocomplete-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnAutocompleteComponent],
  template: `
    <tn-side-panel title="Edit dataset" [(open)]="open">
      <tn-autocomplete [options]="options" />
    </tn-side-panel>
  `,
})
class AutocompletePanelHostComponent {
  open = signal(false);
  options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
  ];
}

@Component({
  selector: 'tn-escape-chip-input-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnChipInputComponent],
  template: `
    <tn-side-panel title="Edit ACL" [(open)]="open">
      <tn-chip-input [suggestions]="suggestions" />
    </tn-side-panel>
  `,
})
class ChipInputPanelHostComponent {
  open = signal(false);
  suggestions = ['alpha', 'beta'];
}

@Component({
  selector: 'tn-escape-select-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnSelectComponent],
  template: `
    <tn-side-panel title="Edit share" [(open)]="open">
      <tn-select [options]="options" />
    </tn-side-panel>
  `,
})
class SelectPanelHostComponent {
  open = signal(false);
  options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
  ];
}

@Component({
  selector: 'tn-escape-context-menu-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnMenuComponent],
  template: `
    <tn-side-panel title="Datasets" [(open)]="open">
      <tn-menu [contextMenu]="true" [items]="items" />
    </tn-side-panel>
  `,
})
class ContextMenuPanelHostComponent {
  open = signal(false);
  items = [{ id: 'edit', label: 'Edit' }];
}

interface PanelHost {
  open: ReturnType<typeof signal<boolean>>;
}

interface PopupCase {
  /** The element selector, used as the spec name. */
  name: string;
  host: Type<PanelHost>;
  /** Opens the popup, from the state a user would have opened it from. */
  openPopup: (fixture: ComponentFixture<PanelHost>) => void;
  /** Matches the popup's pane inside the overlay container while it is open. */
  popup: string;
  /**
   * Where Escape is dispatched from. Defaults to the popup itself — a
   * file-picker or calendar takes focus into its own overlay. A combobox
   * leaves focus in its input, which is inside the panel.
   */
  escapeFrom?: (fixture: ComponentFixture<PanelHost>) => Element;
}

/**
 * The panel's content, which is NOT under the fixture's own element while the
 * panel is open — `tn-side-panel` portals its overlay element into the CDK
 * overlay container (#322), and the projected form goes with it.
 */
function inPanel(selector: string): Element {
  const panel = document.querySelector('.tn-side-panel__overlay') as Element;
  return panel.querySelector(selector) as Element;
}

function input(_fixture: ComponentFixture<PanelHost>): Element {
  return inPanel('input');
}

function focusInput(fixture: ComponentFixture<PanelHost>): void {
  input(fixture).dispatchEvent(new Event('focus'));
  fixture.detectChanges();
}

const CASES: PopupCase[] = [
  {
    name: 'tn-file-picker',
    host: FilePickerPanelHostComponent,
    openPopup: (fixture) => {
      fixture.debugElement
        .query(By.directive(TnFilePickerComponent))
        .componentInstance.openFilePicker();
      fixture.detectChanges();
    },
    popup: '.tn-file-picker-overlay',
  },
  {
    name: 'tn-date-input',
    host: DateInputPanelHostComponent,
    openPopup: (fixture) => {
      fixture.debugElement
        .query(By.directive(TnDateInputComponent))
        .componentInstance.openDatepicker();
      fixture.detectChanges();
    },
    popup: '.tn-datepicker-overlay',
  },
  {
    name: 'tn-date-range-input',
    host: DateRangeInputPanelHostComponent,
    openPopup: (fixture) => {
      fixture.debugElement
        .query(By.directive(TnDateRangeInputComponent))
        .componentInstance.openDatepicker();
      fixture.detectChanges();
    },
    popup: '.tn-datepicker-overlay',
  },
  {
    name: 'tn-autocomplete',
    host: AutocompletePanelHostComponent,
    openPopup: focusInput,
    popup: '.tn-autocomplete__dropdown',
    escapeFrom: input,
  },
  {
    name: 'tn-chip-input',
    host: ChipInputPanelHostComponent,
    openPopup: focusInput,
    popup: '.tn-chip-input__dropdown',
    escapeFrom: input,
  },
  {
    name: 'tn-select',
    host: SelectPanelHostComponent,
    openPopup: (fixture) => {
      fixture.debugElement
        .query(By.directive(TnSelectComponent))
        .componentInstance.openDropdown();
      fixture.detectChanges();
    },
    popup: '.tn-select-dropdown',
    escapeFrom: () => inPanel('.tn-select-trigger'),
  },
  {
    // Not one of the five the ticket names — found by the audit its last
    // acceptance criterion asks for, as the only other overlay in the library
    // with no `keydownEvents()` subscriber. Escape did nothing to it at all
    // before, so this is the first Escape handling it has had.
    name: 'tn-menu (context menu)',
    host: ContextMenuPanelHostComponent,
    openPopup: (fixture) => {
      fixture.debugElement
        .query(By.directive(TnMenuComponent))
        .componentInstance.openContextMenuAt(10, 10);
      fixture.detectChanges();
    },
    popup: '.tn-menu',
  },
];

/**
 * The same three comboboxes inside a `tn-drawer`, which is NOT a CDK overlay
 * and which swallows Escape on its own panel element
 * (`drawer.component.ts#onKeydown` calls `stopPropagation`).
 *
 * This is why the fix cannot simply hand Escape to CDK's dispatcher and let it
 * route: an ancestor that stops propagation means the dispatcher never runs at
 * all, and a popup relying on it would stay open with the drawer closing
 * underneath. The component consumes the key itself instead, which works
 * whatever sits above it.
 */
@Component({
  selector: 'tn-escape-drawer-host',
  standalone: true,
  imports: [TnDrawerComponent, TnAutocompleteComponent, TnChipInputComponent, TnSelectComponent],
  template: `
    <tn-drawer mode="over" ariaLabel="Filters" [(opened)]="opened">
      <tn-select [options]="options" /><tn-autocomplete [options]="options" /><tn-chip-input [suggestions]="suggestions" />
    </tn-drawer>
  `,
})
class DrawerHostComponent {
  opened = signal(true);
  options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
  ];
  suggestions = ['alpha', 'beta'];
}

describe('Escape in a popup opened over a tn-side-panel (#324)', () => {
  let overlayEl: HTMLElement;

  describe.each(CASES)('$name', (testCase) => {
    let fixture: ComponentFixture<PanelHost>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [testCase.host],
      }).compileComponents();

      fixture = TestBed.createComponent(testCase.host);
      overlayEl = TestBed.inject(OverlayContainer).getContainerElement();
      fixture.detectChanges();

      fixture.componentInstance.open.set(true);
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.destroy();
    });

    function popupIsOpen(): boolean {
      return overlayEl.querySelector(testCase.popup) !== null;
    }

    function pressEscape(): void {
      const from = testCase.escapeFrom
        ? testCase.escapeFrom(fixture)
        : (overlayEl.querySelector(testCase.popup) as Element);
      from.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
    }

    it('closes its own popup', () => {
      testCase.openPopup(fixture);
      expect(popupIsOpen()).toBe(true);

      pressEscape();

      expect(popupIsOpen()).toBe(false);
    });

    it('leaves the panel open', () => {
      testCase.openPopup(fixture);
      expect(popupIsOpen()).toBe(true);

      pressEscape();

      expect(fixture.componentInstance.open()).toBe(true);
    });

    it('closes the panel when no popup is open', () => {
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();

      expect(fixture.componentInstance.open()).toBe(false);
    });
  });
});

describe('Escape in a combobox inside a tn-drawer (#324)', () => {
  let fixture: ComponentFixture<DrawerHostComponent>;
  let overlayEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerHostComponent);
    overlayEl = TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  function escapeFrom(element: Element): void {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
  }

  /**
   * An `over` drawer portals its panel to `document.body` to avoid clipping, so
   * the projected comboboxes are not under the fixture's element — the same
   * lookup `drawer-a11y.spec.ts` uses for that mode.
   */
  function inDrawer(selector: string): Element {
    const panel = document.body.querySelector('.tn-drawer__panel--over') as Element;
    return panel.querySelector(selector) as Element;
  }

  it('closes the tn-select dropdown and leaves the drawer open', () => {
    fixture.debugElement.query(By.directive(TnSelectComponent)).componentInstance.openDropdown();
    fixture.detectChanges();
    expect(overlayEl.querySelector('.tn-select-dropdown')).not.toBeNull();

    escapeFrom(inDrawer('.tn-select-trigger'));

    expect(overlayEl.querySelector('.tn-select-dropdown')).toBeNull();
    expect(fixture.componentInstance.opened()).toBe(true);
  });

  it('closes the tn-autocomplete panel and leaves the drawer open', () => {
    const field = inDrawer('tn-autocomplete input');
    field.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(overlayEl.querySelector('.tn-autocomplete__dropdown')).not.toBeNull();

    escapeFrom(field);

    expect(overlayEl.querySelector('.tn-autocomplete__dropdown')).toBeNull();
    expect(fixture.componentInstance.opened()).toBe(true);
  });

  it('closes the tn-chip-input panel and leaves the drawer open', () => {
    const field = inDrawer('tn-chip-input input');
    field.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(overlayEl.querySelector('.tn-chip-input__dropdown')).not.toBeNull();

    escapeFrom(field);

    expect(overlayEl.querySelector('.tn-chip-input__dropdown')).toBeNull();
    expect(fixture.componentInstance.opened()).toBe(true);
  });

  it('closes the drawer when no popup is open', () => {
    escapeFrom(inDrawer('.tn-select-trigger'));

    expect(fixture.componentInstance.opened()).toBe(false);
  });
});
