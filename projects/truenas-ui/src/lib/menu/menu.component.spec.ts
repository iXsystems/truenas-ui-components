import { CdkMenu } from '@angular/cdk/menu';
import { Component, getDebugNode, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { TnMenuItemComponent } from './menu-item.component';
import { TnMenuTriggerDirective } from './menu-trigger.directive';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';
import { TnButtonComponent } from '../button/button.component';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';

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

  it('closes the menu on Tab so the browser can advance focus to the next element', () => {
    triggerButton.click();
    fixture.detectChanges();
    expect(getMenuPanel()).toBeTruthy();

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.querySelector('.tn-menu')!.dispatchEvent(tabEvent);
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    // Trigger should be focused so the Tab default action advances from here.
    expect(document.activeElement).toBe(triggerButton);
    // Tab default should NOT have been preventDefault'd.
    expect(tabEvent.defaultPrevented).toBe(false);
  });

  it('closes the menu and returns focus to the trigger on Escape', () => {
    triggerButton.click();
    fixture.detectChanges();
    expect(getMenuPanel()).toBeTruthy();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    // Dispatch on the overlay so overlayRef.keydownEvents() picks it up.
    document.querySelector('.tn-menu')!.dispatchEvent(escEvent);
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(document.activeElement).toBe(triggerButton);
  });

  it('returns focus to the trigger after a menu item is clicked', () => {
    triggerButton.click();
    fixture.detectChanges();

    const copyButton = getMenuItems().find((el) => el.textContent?.includes('Copy'))!;
    copyButton.click();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(document.activeElement).toBe(triggerButton);
  });


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

  it('marks disabled items with aria-disabled so CDK skips them in arrow-key nav', () => {
    triggerButton.click();
    fixture.detectChanges();

    // CdkMenuItem mirrors its disabled input to aria-disabled. FocusKeyManager
    // walks the same disabled flag, so this attribute is a reliable proxy for
    // "this item will be skipped during ArrowUp/Down navigation."
    const item = Array.from(getMenuItems()).find(
      (el) => el.textContent?.includes('Disabled'),
    )!;
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  // Guard against CDK API changes: TnMenuActivateHoverDirective reaches into
  // the (protected) `keyManager` field on CdkMenu to install a skip-disabled
  // predicate. If a CDK upgrade renames or removes the field, the cast in the
  // directive will silently degrade skip-disabled navigation. This test fails
  // loudly in that case so the upgrade surfaces the break immediately.
  it('exposes CdkMenu.keyManager with skipPredicate (required by tnMenuActivateHover)', () => {
    triggerButton.click();
    fixture.detectChanges();

    const menuEl = document.querySelector('.tn-menu') as HTMLElement;
    expect(menuEl).toBeTruthy();

    const cdkMenu = getDebugNode(menuEl)?.injector.get(CdkMenu, null);
    expect(cdkMenu).toBeTruthy();

    const km = (cdkMenu as unknown as { keyManager?: { skipPredicate?: unknown } }).keyManager;
    expect(km).toBeTruthy();
    expect(typeof km!.skipPredicate).toBe('function');
  });

  // -- data-testid forwarding --------------------------------------------

  it('should render default data-testid as "menu-item-<id>" for each item', () => {
    triggerButton.click();
    fixture.detectChanges();

    const ids = getMenuItems().map(el => el.getAttribute('data-testid'));
    expect(ids).toEqual(
      expect.arrayContaining([
        'menu-item-cut',
        'menu-item-copy',
        'menu-item-disabled',
        'menu-item-more',
      ]),
    );
  });

  it('should use the item.testId override when provided', () => {
    host.items = [
      { id: 'cut', label: 'Cut', testId: 'custom-cut' },
      { id: 'copy', label: 'Copy' },
    ];
    fixture.detectChanges();

    triggerButton.click();
    fixture.detectChanges();

    const ids = getMenuItems().map(el => el.getAttribute('data-testid'));
    expect(ids).toContain('custom-cut');
    expect(ids).toContain('menu-item-copy');
    expect(ids).not.toContain('menu-item-cut');
  });

  it('should render data-testid on nested child items', () => {
    triggerButton.click();
    fixture.detectChanges();

    const moreButton = getMenuItems().find(
      el => el.textContent?.includes('More'),
    )!;
    moreButton.click();
    fixture.detectChanges();

    const ids = getMenuItems().map(el => el.getAttribute('data-testid'));
    expect(ids).toEqual(
      expect.arrayContaining(['menu-item-child-1', 'menu-item-child-2']),
    );
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

// ===========================================================================
// Selected state (TnMenuItem.selected)
// ===========================================================================
/* eslint-disable @angular-eslint/component-max-inline-declarations */
@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuTriggerDirective],
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu [items]="items" />
  `,
})
class SelectedItemsHostComponent {
  items: TnMenuItem[] = [
    { id: 'csv', label: 'CSV' },
    { id: 'json', label: 'JSON', selected: true },
    { id: 'yaml', label: 'YAML' },
  ];
  trigger = viewChild.required(TnMenuTriggerDirective);
}

describe('tn-menu selected items', () => {
  let fixture: ComponentFixture<SelectedItemsHostComponent>;
  let host: SelectedItemsHostComponent;
  let triggerButton: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedItemsHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedItemsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    triggerButton = fixture.nativeElement.querySelector('.trigger');
  });

  afterEach(() => host.trigger().closeMenu());

  it('applies the tn-menu-item--selected class to the selected item only', () => {
    triggerButton.click();
    fixture.detectChanges();

    const selected = document.querySelectorAll('.tn-menu-item--selected');
    expect(selected.length).toBe(1);
    expect(selected[0].textContent?.trim()).toBe('JSON');
  });

  it('applies aria-current="true" on the selected item', () => {
    triggerButton.click();
    fixture.detectChanges();

    const currentItems = Array.from(getMenuItems()).filter(
      (el) => el.getAttribute('aria-current') === 'true',
    );
    expect(currentItems.length).toBe(1);
    expect(currentItems[0].textContent).toContain('JSON');
  });

  it('does not set aria-current on unselected items', () => {
    triggerButton.click();
    fixture.detectChanges();

    const items = getMenuItems();
    const withoutCurrent = items.filter((el) => !el.hasAttribute('aria-current'));
    expect(withoutCurrent.length).toBe(2);
  });
});

// ===========================================================================
// Projected <tn-menu-item> items
// ===========================================================================
@Component({
  standalone: true,
  imports: [TnMenuComponent, TnMenuItemComponent, TnMenuTriggerDirective],
  template: `
    <button class="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu (menuItemClick)="menuClicked = true">
      <tn-menu-item
        id="csv"
        label="CSV"
        [selected]="format() === 'csv'"
        (itemClick)="setFormat('csv')"
      />
      <tn-menu-item
        id="json"
        label="JSON"
        [selected]="format() === 'json'"
        (itemClick)="setFormat('json')"
      />
      <tn-menu-item id="disabled-item" label="Disabled" [disabled]="true" />
      <tn-menu-item id="custom">
        <span class="custom-content">Custom <strong>Badge</strong></span>
      </tn-menu-item>
    </tn-menu>
  `,
})
class ProjectedItemsHostComponent {
  format = signal<'csv' | 'json'>('json');
  menuClicked = false;

  setFormat(value: 'csv' | 'json'): void {
    this.format.set(value);
  }

  trigger = viewChild.required(TnMenuTriggerDirective);
}

describe('tn-menu with projected <tn-menu-item>', () => {
  let fixture: ComponentFixture<ProjectedItemsHostComponent>;
  let host: ProjectedItemsHostComponent;
  let triggerButton: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectedItemsHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectedItemsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    triggerButton = fixture.nativeElement.querySelector('.trigger');
  });

  afterEach(() => host.trigger().closeMenu());

  it('renders projected items in the overlay', () => {
    triggerButton.click();
    fixture.detectChanges();

    const labels = getMenuItems().map((el) => el.textContent?.trim());
    expect(labels).toEqual(expect.arrayContaining(['CSV', 'JSON', 'Disabled']));
  });

  it('renders custom content when label is omitted', () => {
    triggerButton.click();
    fixture.detectChanges();

    const custom = document.querySelector('.custom-content');
    expect(custom).toBeTruthy();
    expect(custom?.textContent?.trim()).toBe('Custom Badge');
  });

  it('marks the selected projected item with aria-current and modifier class', () => {
    triggerButton.click();
    fixture.detectChanges();

    const selectedEl = document.querySelector('.tn-menu-item--selected');
    expect(selectedEl?.getAttribute('aria-current')).toBe('true');
    expect(selectedEl?.textContent).toContain('JSON');
  });

  it('emits per-item itemClick and updates the selection', () => {
    triggerButton.click();
    fixture.detectChanges();

    const csvItem = getMenuItems().find((el) => el.textContent?.includes('CSV'))!;
    csvItem.click();
    fixture.detectChanges();

    expect(host.format()).toBe('csv');
  });

  it('closes the trigger overlay after projected-item click (via menuItemClick re-emit)', () => {
    triggerButton.click();
    fixture.detectChanges();
    expect(getMenuPanel()).toBeTruthy();

    const jsonItem = getMenuItems().find((el) => el.textContent?.trim() === 'JSON')!;
    jsonItem.click();
    fixture.detectChanges();

    expect(getMenuPanel()).toBeFalsy();
    expect(host.menuClicked).toBe(true);
  });

  it('does not emit itemClick when a disabled projected item is clicked', () => {
    triggerButton.click();
    fixture.detectChanges();

    const initialFormat = host.format();
    const disabledItem = getMenuItems().find((el) => el.textContent?.includes('Disabled'))!;
    disabledItem.click();
    fixture.detectChanges();

    expect(host.format()).toBe(initialFormat);
  });

  it('renders default data-testid based on id input', () => {
    triggerButton.click();
    fixture.detectChanges();

    const ids = getMenuItems().map((el) => el.getAttribute('data-testid'));
    expect(ids).toEqual(
      expect.arrayContaining(['menu-item-csv', 'menu-item-json', 'menu-item-disabled-item']),
    );
  });

  it('marks disabled projected items with aria-disabled so CDK skips them', () => {
    triggerButton.click();
    fixture.detectChanges();

    const disabledItem = getMenuItems().find(
      (el) => el.textContent?.includes('Disabled'),
    )!;
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
  });
});

// ===========================================================================
// Focus restoration with a wrapper-element trigger (e.g. <tn-button>)
// ===========================================================================
@Component({
  standalone: true,
  imports: [TnButtonComponent, TnMenuComponent, TnMenuTriggerDirective],
  template: `
    <tn-button label="Open" [tnMenuTriggerFor]="menu" />
    <tn-menu #menu [items]="items" />
  `,
})
class WrapperTriggerHostComponent {
  items: TnMenuItem[] = [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }];
  trigger = viewChild.required(TnMenuTriggerDirective);
}

@Component({
  standalone: true,
  imports: [TnIconButtonComponent, TnMenuComponent, TnMenuItemComponent, TnMenuTriggerDirective],
  template: `
    <tn-icon-button name="menu-down" library="mdi" ariaLabel="Open menu" [tnMenuTriggerFor]="menu" />
    <tn-menu #menu>
      <tn-menu-item label="CSV" (itemClick)="selected = 'csv'" />
      <tn-menu-item label="JSON" (itemClick)="selected = 'json'" />
    </tn-menu>
  `,
})
class IconButtonTriggerHostComponent {
  selected: string | null = null;
  trigger = viewChild.required(TnMenuTriggerDirective);
}

describe('tn-menu focus restoration with <tn-button> trigger', () => {
  let fixture: ComponentFixture<WrapperTriggerHostComponent>;
  let host: WrapperTriggerHostComponent;
  let innerButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperTriggerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperTriggerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    innerButton = fixture.nativeElement.querySelector('tn-button button');
  });

  afterEach(() => host.trigger().closeMenu());

  it('restores focus to the inner <button> after an item is clicked', () => {
    // The directive's elementRef is on <tn-button>, which is not focusable.
    // The fix should drill into the inner native <button>.
    innerButton.click();
    fixture.detectChanges();

    const xItem = Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'))
      .find((el) => el.textContent?.includes('X'))!;
    xItem.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(innerButton);
  });

  it('restores focus to the inner <button> on Escape', () => {
    innerButton.click();
    fixture.detectChanges();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.querySelector('.tn-menu')!.dispatchEvent(escEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(innerButton);
  });
});

describe('tn-menu focus restoration with <tn-icon-button> trigger', () => {
  let fixture: ComponentFixture<IconButtonTriggerHostComponent>;
  let host: IconButtonTriggerHostComponent;
  let innerButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonTriggerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonTriggerHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    innerButton = fixture.nativeElement.querySelector('tn-icon-button button');
  });

  afterEach(() => host.trigger().closeMenu());

  it('restores focus to the inner <button> after a projected item is clicked', () => {
    innerButton.click();
    fixture.detectChanges();

    const csvItem = Array.from(document.querySelectorAll<HTMLElement>('.tn-menu-item'))
      .find((el) => el.textContent?.includes('CSV'))!;
    csvItem.click();
    fixture.detectChanges();

    expect(host.selected).toBe('csv');
    expect(document.activeElement).toBe(innerButton);
  });

  it('restores focus to the inner <button> on Escape', () => {
    innerButton.click();
    fixture.detectChanges();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.querySelector('.tn-menu')!.dispatchEvent(escEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(innerButton);
  });
});
