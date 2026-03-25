import { Component, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { TnMenuTriggerDirective } from './menu-trigger.directive';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';

/**
 * Helper: query all menu items currently in the DOM (inside the CDK overlay).
 */
function getMenuItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'));
}

function getMenuPanel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.tn-menu');
}

function getBackdrop(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.cdk-overlay-backdrop');
}

// ---------------------------------------------------------------------------
// Test host for regular menu (trigger-based)
// ---------------------------------------------------------------------------
/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuTriggerDirective],
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu" [tnMenuPosition]="position">Open</button>
    <tn-menu
      #menu
      [items]="items"
      (menuItemClick)="lastClicked = $event"
      (menuOpen)="opened = true"
      (menuClose)="closed = true"
    />
  `,
})
class MenuTestHostComponent {
  items: TnMenuItem[] = [
    { id: 'cut', label: 'Cut', icon: 'content_cut', shortcut: '⌘X' },
    { id: 'copy', label: 'Copy' },
    { id: 'disabled', label: 'Disabled', disabled: true },
    { id: 'sep', label: '', separator: true },
    { id: 'more', label: 'More', children: [
      { id: 'child-1', label: 'Child 1' },
      { id: 'child-2', label: 'Child 2' },
    ]},
  ];
  position: 'above' | 'below' | 'before' | 'after' = 'below';
  lastClicked: TnMenuItem | null = null;
  opened = false;
  closed = false;

  trigger = viewChild.required(TnMenuTriggerDirective);
}

// ---------------------------------------------------------------------------
// Test host for context menu
// ---------------------------------------------------------------------------
@Component({
  standalone: true,
  imports: [TnMenuComponent],
  template: `
    <tn-menu
      #menu
      [items]="items"
      [contextMenu]="true"
      (menuItemClick)="lastClicked = $event"
      (menuOpen)="opened = true"
      (menuClose)="closed = true"
    >
      <div class="context-area" style="width:200px;height:200px;">Right-click me</div>
    </tn-menu>
  `,
})
class ContextMenuTestHostComponent {
  items: TnMenuItem[] = [
    { id: 'cut', label: 'Cut' },
    { id: 'copy', label: 'Copy' },
  ];
  lastClicked: TnMenuItem | null = null;
  opened = false;
  closed = false;

  menu = viewChild.required(TnMenuComponent);
}

// ===========================================================================
// Regular menu tests
// ===========================================================================
describe('tn-menu with trigger', () => {
  let fixture: ComponentFixture<MenuTestHostComponent>;
  let host: MenuTestHostComponent;
  let triggerButton: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    triggerButton = fixture.nativeElement.querySelector('.trigger');
  });

  afterEach(() => {
    host.trigger().closeMenu();
  });

  // -- Opening & closing --------------------------------------------------

  it('should open menu when trigger is clicked', () => {
    triggerButton.click();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeTruthy();
    expect(host.opened).toBe(true);
  });

  it('should close menu when trigger is clicked again', () => {
    triggerButton.click();
    fixture.detectChanges();

    triggerButton.click();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(host.closed).toBe(true);
  });

  it('should close menu when backdrop is clicked', fakeAsync(() => {
    triggerButton.click();
    fixture.detectChanges();

    getBackdrop()!.click();
    flush();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(host.closed).toBe(true);
  }));

  // -- Rendering ----------------------------------------------------------

  it('should render non-separator items as buttons', () => {
    triggerButton.click();
    fixture.detectChanges();

    const items = getMenuItems();
    // 5 items minus 1 separator = 4 buttons (Cut, Copy, Disabled, More)
    expect(items.length).toBe(4);
  });

  it('should render separator elements', () => {
    triggerButton.click();
    fixture.detectChanges();

    const separators = document.querySelectorAll('.tn-menu-separator');
    expect(separators.length).toBe(1);
  });

  it('should render item labels', () => {
    triggerButton.click();
    fixture.detectChanges();

    const labels = Array.from(document.querySelectorAll('.tn-menu-item-label'));
    expect(labels.map(el => el.textContent?.trim())).toContain('Cut');
    expect(labels.map(el => el.textContent?.trim())).toContain('Copy');
  });

  it('should render item shortcuts', () => {
    triggerButton.click();
    fixture.detectChanges();

    const shortcuts = document.querySelectorAll('.tn-menu-item-shortcut');
    expect(shortcuts.length).toBeGreaterThanOrEqual(1);
    expect(shortcuts[0].textContent?.trim()).toBe('⌘X');
  });

  it('should render icons when provided', () => {
    triggerButton.click();
    fixture.detectChanges();

    const icons = document.querySelectorAll('.tn-menu-item-icon');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('should render submenu arrow on items with children', () => {
    triggerButton.click();
    fixture.detectChanges();

    const arrows = document.querySelectorAll('.tn-menu-item-arrow');
    expect(arrows.length).toBe(1);
  });

  it('should mark disabled items with disabled attribute', () => {
    triggerButton.click();
    fixture.detectChanges();

    const disabledItems = document.querySelectorAll('.tn-menu-item[disabled]');
    expect(disabledItems.length).toBe(1);
  });

  // -- Selection ----------------------------------------------------------

  it('should emit selected item and close menu on leaf item click', () => {
    triggerButton.click();
    fixture.detectChanges();

    const copyButton = getMenuItems().find(
      el => el.textContent?.includes('Copy')
    )!;
    copyButton.click();
    fixture.detectChanges();

    expect(host.lastClicked?.id).toBe('copy');
    expect(getMenuPanel()).toBeFalsy();
  });

  it('should not emit click for disabled items', () => {
    triggerButton.click();
    fixture.detectChanges();

    const disabledButton = getMenuItems().find(
      el => el.textContent?.includes('Disabled')
    )!;
    disabledButton.click();
    fixture.detectChanges();

    expect(host.lastClicked).toBeNull();
  });

  it('should not close menu when clicking an item with children', () => {
    triggerButton.click();
    fixture.detectChanges();

    const moreButton = getMenuItems().find(
      el => el.textContent?.includes('More')
    )!;
    moreButton.click();
    fixture.detectChanges();

    // Menu should still be open - "More" has children
    expect(getMenuPanel()).toBeTruthy();
    expect(host.lastClicked).toBeNull();
  });

  // -- Positions ----------------------------------------------------------

  for (const position of ['above', 'below', 'before', 'after'] as const) {
    it(`should open menu with "${position}" position`, () => {
      host.position = position;
      fixture.detectChanges();

      triggerButton.click();
      fixture.detectChanges();

      expect(getMenuPanel()).toBeTruthy();
    });
  }
});

// ===========================================================================
// Context menu tests
// ===========================================================================
describe('tn-menu as context menu', () => {
  let fixture: ComponentFixture<ContextMenuTestHostComponent>;
  let host: ContextMenuTestHostComponent;
  let contextArea: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenuTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    contextArea = fixture.nativeElement.querySelector('.context-area');
  });

  function rightClick(el: HTMLElement, x = 100, y = 100): void {
    el.dispatchEvent(new MouseEvent('contextmenu', {
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
    }));
  }

  it('should open menu on right-click', fakeAsync(() => {
    rightClick(contextArea);
    fixture.detectChanges();
    flush();

    expect(getMenuPanel()).toBeTruthy();
    expect(host.opened).toBe(true);
  }));

  it('should render context menu items', fakeAsync(() => {
    rightClick(contextArea);
    fixture.detectChanges();
    flush();

    const labels = Array.from(document.querySelectorAll('.tn-menu-item-label'))
      .map(el => el.textContent?.trim());
    expect(labels).toContain('Cut');
    expect(labels).toContain('Copy');
  }));

  it('should close context menu and emit on item click', fakeAsync(() => {
    rightClick(contextArea);
    fixture.detectChanges();
    flush();

    const cutButton = getMenuItems().find(
      el => el.textContent?.includes('Cut')
    )!;
    cutButton.click();
    fixture.detectChanges();
    flush();

    expect(host.lastClicked?.id).toBe('cut');
    expect(host.closed).toBe(true);
  }));

  it('should close previous context menu when opening a new one', fakeAsync(() => {
    rightClick(contextArea, 50, 50);
    fixture.detectChanges();
    flush();

    rightClick(contextArea, 150, 150);
    fixture.detectChanges();
    flush();

    // Only one menu panel should exist
    const panels = document.querySelectorAll('.tn-menu');
    expect(panels.length).toBe(1);
  }));

  it('should close context menu on backdrop click', fakeAsync(() => {
    rightClick(contextArea);
    fixture.detectChanges();
    flush();

    getBackdrop()!.click();
    flush();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(host.closed).toBe(true);
  }));
});
