import { Component, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnMenuItemComponent } from './menu-item.component';
import { TnMenuTriggerDirective } from './menu-trigger.directive';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';

const LOCK_TOOLTIP = 'Missing permissions for this action';

@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuItemComponent, TnMenuTriggerDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  // One host holds projected and array items together, as a consumer would.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu [items]="items()">
      <tn-menu-item
        id="projected-lock"
        label="Projected locked"
        suffixIcon="lock"
        suffixIconLibrary="mdi"
        tooltip="Projected reason"
        [disabled]="true"
      />
    </tn-menu>
  `,
})
class HostComponent {
  items = signal<TnMenuItem[]>([
    { id: 'alpha', label: 'Alpha', tooltip: 'Alpha help' },
    {
      id: 'locked',
      label: 'Locked',
      disabled: true,
      shortcut: '⌘L',
      suffixIcon: 'lock',
      suffixIconLibrary: 'mdi',
      tooltip: LOCK_TOOLTIP,
    },
    { id: 'charlie', label: 'Charlie' },
    {
      id: 'more',
      label: 'More',
      shortcut: '⌘M',
      suffixIcon: 'lock',
      suffixIconLibrary: 'mdi',
      children: [{ id: 'child', label: 'Child' }],
    },
  ]);
  trigger = viewChild.required(TnMenuTriggerDirective);
}

function items(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'));
}

function item(label: string): HTMLElement {
  return items().find((el) => el.querySelector('.tn-menu-item-label')?.textContent?.trim() === label)!;
}

function row(label: string): HTMLElement {
  return item(label).parentElement!;
}

function tooltipText(): string | null {
  return document.querySelector('.tn-tooltip__message')?.textContent?.trim() ?? null;
}

/** The trailing classes of a button, in DOM order. */
function trailingParts(button: HTMLElement): string[] {
  const parts = ['tn-menu-item-label', 'tn-menu-item-shortcut', 'tn-menu-item-suffix-icon', 'tn-menu-item-arrow', 'tn-menu-item-arrow-spacer'];
  return Array.from(button.children)
    .map((child) => parts.find((part) => child.classList.contains(part)))
    .filter((part): part is string => !!part);
}

/** CDK's menu key handling switches on the legacy `keyCode`, which jsdom does not derive. */
function arrowDown(): void {
  const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
  Object.defineProperty(event, 'keyCode', { get: () => 40 });
  (document.activeElement ?? document.body).dispatchEvent(event);
}

describe('tn-menu suffix icon and tooltip', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // The tooltip opens and closes from a setTimeout.
    jest.useFakeTimers();

    (fixture.nativeElement.querySelector('.trigger') as HTMLElement).click();
    fixture.detectChanges();
  });

  afterEach(() => {
    host.trigger().closeMenu();
    jest.advanceTimersByTime(0);
    jest.useRealTimers();
  });

  describe('layout', () => {
    it('draws the suffix icon after the label and the shortcut', () => {
      expect(trailingParts(item('Locked'))).toEqual([
        'tn-menu-item-label', 'tn-menu-item-shortcut', 'tn-menu-item-suffix-icon', 'tn-menu-item-arrow-spacer',
      ]);
      const icon = item('Locked').querySelector('.tn-menu-item-suffix-icon')!;
      expect(icon.getAttribute('name')).toBe('lock');
      expect(icon.getAttribute('library')).toBe('mdi');
    });

    it('draws the suffix icon before the submenu caret', () => {
      expect(trailingParts(item('More'))).toEqual([
        'tn-menu-item-label', 'tn-menu-item-shortcut', 'tn-menu-item-suffix-icon', 'tn-menu-item-arrow',
      ]);
    });

    it('reserves the caret column only on leaf rows with a suffix icon, in a panel with submenus', () => {
      expect(item('Locked').querySelector('.tn-menu-item-arrow-spacer')).not.toBeNull();
      expect(item('Projected locked').querySelector('.tn-menu-item-arrow-spacer')).not.toBeNull();
      expect(item('Charlie').querySelector('.tn-menu-item-arrow-spacer')).toBeNull();
      expect(document.querySelectorAll('.tn-menu-item-arrow')).toHaveLength(1);
    });

    it('reserves no caret column in a panel without submenus', () => {
      host.trigger().closeMenu();
      host.items.set([{ id: 'locked', label: 'Locked', suffixIcon: 'lock' }]);
      fixture.detectChanges();
      (fixture.nativeElement.querySelector('.trigger') as HTMLElement).click();
      fixture.detectChanges();

      expect(item('Locked').querySelector('.tn-menu-item-suffix-icon')).not.toBeNull();
      expect(document.querySelector('.tn-menu-item-arrow-spacer')).toBeNull();
    });

    it('draws a suffix icon on a projected <tn-menu-item>', () => {
      const icon = item('Projected locked').querySelector('.tn-menu-item-suffix-icon')!;
      expect(icon.getAttribute('name')).toBe('lock');
    });

    it('draws nothing extra on an item without a suffix icon', () => {
      expect(trailingParts(item('Charlie'))).toEqual(['tn-menu-item-label']);
    });
  });

  describe('tooltip', () => {
    it('shows on hovering the row of a disabled item', () => {
      row('Locked').dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(tooltipText()).toBe(LOCK_TOOLTIP);

      row('Locked').dispatchEvent(new MouseEvent('mouseleave'));
      jest.advanceTimersByTime(0);
      expect(tooltipText()).toBeNull();
    });

    it('shows on hovering a disabled projected <tn-menu-item>', () => {
      row('Projected locked').dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(tooltipText()).toBe('Projected reason');
    });

    it('marks only a disabled item\'s row with the class that passes the pointer to it', () => {
      expect(row('Locked').classList).toContain('tn-menu-item-row--disabled');
      expect(row('Alpha').classList).not.toContain('tn-menu-item-row--disabled');
    });

    it('describes the button itself, disabled or not, so assistive tech reads it', () => {
      const describedBy = item('Locked').getAttribute('aria-describedby')!;
      expect(document.getElementById(describedBy)?.textContent).toBe(LOCK_TOOLTIP);
      expect(item('Alpha').getAttribute('aria-describedby')).not.toBeNull();
      expect(item('Charlie').getAttribute('aria-describedby')).toBeNull();
      expect(row('Locked').getAttribute('aria-describedby')).toBeNull();
    });

    it('shows on keyboard focus of an enabled item', () => {
      // The projected item comes first but is disabled, so Alpha takes focus on open.
      expect(document.activeElement).toBe(item('Alpha'));
      arrowDown();
      fixture.detectChanges();
      jest.advanceTimersByTime(0);
      expect(document.activeElement).toBe(item('Charlie'));
      expect(tooltipText()).toBeNull();

      arrowDown();
      fixture.detectChanges();
      expect(document.activeElement).toBe(item('More'));

      // Back round to Alpha, arriving by keyboard.
      arrowDown();
      fixture.detectChanges();
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(document.activeElement).toBe(item('Alpha'));
      expect(tooltipText()).toBe('Alpha help');
    });
  });

  describe('unchanged behaviour', () => {
    it('still skips a disabled item that carries a tooltip and suffix icon', () => {
      expect(document.activeElement).toBe(item('Alpha'));
      arrowDown();
      fixture.detectChanges();
      expect(document.activeElement).toBe(item('Charlie'));
    });

    it('keeps the test id on the button, not on the row', () => {
      expect(item('Locked').getAttribute('data-testid')).toBe('button-locked');
      expect(item('Projected locked').getAttribute('data-testid')).toBe('button-projected-lock');
      expect(row('Locked').hasAttribute('data-testid')).toBe(false);
    });

    it('keeps the native disabled state and aria-disabled on the button', () => {
      expect((item('Locked') as HTMLButtonElement).disabled).toBe(true);
      expect(item('Locked').getAttribute('aria-disabled')).toBe('true');
    });
  });
});
