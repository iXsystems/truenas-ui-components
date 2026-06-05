import { Component, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnMenuTriggerDirective } from './menu-trigger.directive';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';

@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuTriggerDirective],
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu [items]="items" />
  `,
})
class HostComponent {
  items: TnMenuItem[] = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo' },
    { id: 'c', label: 'Charlie' },
  ];
  trigger = viewChild.required(TnMenuTriggerDirective);
}

function items(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'));
}

const KEY_CODES: Record<string, number> = {
  ArrowUp: 38,
  ArrowDown: 40,
  ArrowLeft: 37,
  ArrowRight: 39,
};

/**
 * Dispatch a real arrow keydown. CDK's menu key handling switches on the
 * legacy `keyCode`, which jsdom does NOT derive from `key`, so we define it
 * explicitly (mirroring CDK's own test helpers).
 */
function press(key: keyof typeof KEY_CODES, target?: Element): void {
  const el = target ?? document.activeElement ?? document.querySelector('.tn-menu')!;
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'keyCode', { get: () => KEY_CODES[key] });
  el.dispatchEvent(event);
}

function arrow(key: 'ArrowDown' | 'ArrowUp'): void {
  press(key);
}

describe('tn-menu arrow-key navigation', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('.trigger');
  });

  afterEach(() => host.trigger().closeMenu());

  it('focuses the first item when the menu opens', () => {
    trigger.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);
  });

  it('moves focus to the next item on ArrowDown', () => {
    trigger.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);

    arrow('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[1]);

    arrow('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[2]);
  });

  it('moves focus to the previous item on ArrowUp', () => {
    trigger.click();
    fixture.detectChanges();
    arrow('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[1]);

    arrow('ArrowUp');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);
  });

  it('wraps from the last item back to the first on ArrowDown', () => {
    trigger.click();
    fixture.detectChanges();
    arrow('ArrowDown');
    arrow('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[2]);

    arrow('ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);
  });
});

// ---------------------------------------------------------------------------
// Nested submenu keyboard navigation
// ---------------------------------------------------------------------------
@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuTriggerDirective],
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu [items]="items" />
  `,
})
class NestedHostComponent {
  items: TnMenuItem[] = [
    { id: 'a', label: 'Alpha' },
    {
      id: 'more',
      label: 'More',
      children: [
        { id: 'c1', label: 'Child 1' },
        { id: 'c2', label: 'Child 2' },
      ],
    },
  ];
  trigger = viewChild.required(TnMenuTriggerDirective);
}

describe('tn-menu nested submenu arrow-key navigation', () => {
  let fixture: ComponentFixture<NestedHostComponent>;
  let host: NestedHostComponent;
  let trigger: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NestedHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(NestedHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('.trigger');
  });

  afterEach(() => host.trigger().closeMenu());

  it('opens a submenu and registers its items for keyboard navigation', () => {
    trigger.click();
    fixture.detectChanges();

    // Focus the "More" trigger (item index 1), then open the submenu.
    arrow('ArrowDown');
    fixture.detectChanges();
    const moreTrigger = items().find((el) => el.textContent?.includes('More'))!;
    expect(document.activeElement).toBe(moreTrigger);

    press('ArrowRight', moreTrigger);
    fixture.detectChanges();

    // CDK opens the submenu and focuses its first item.
    const child1 = Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'))
      .find((el) => el.textContent?.includes('Child 1'))!;
    expect(child1).toBeTruthy();
    expect(document.activeElement).toBe(child1);

    // ArrowDown inside the submenu moves to the next child — proves the
    // submenu's own keyManager has registered items.
    press('ArrowDown', child1);
    fixture.detectChanges();
    const child2 = Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'))
      .find((el) => el.textContent?.includes('Child 2'))!;
    expect(document.activeElement).toBe(child2);
  });
});
