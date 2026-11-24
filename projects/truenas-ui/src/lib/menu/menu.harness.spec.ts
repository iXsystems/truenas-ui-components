import { OverlayModule } from '@angular/cdk/overlay';
import type { HarnessLoader } from '@angular/cdk/testing';
import { Component, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnMenuTesting } from './menu-testing';
import { TnMenuTriggerDirective } from './menu-trigger.directive';
import type { TnMenuItem } from './menu.component';
import { TnMenuComponent } from './menu.component';
import { TnMenuHarness } from './menu.harness';
import { TnIconTesting } from '../icon/icon-testing';
import { TnTooltipHarness } from '../tooltip/tooltip.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnMenuComponent, TnMenuTriggerDirective, OverlayModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <button data-testid="trigger" [tnMenuTriggerFor]="menu">Open</button>
    <tn-menu #menu [items]="items()" />
  `
})
class TestHostComponent {
  menuRef = viewChild<TnMenuComponent>('menu');
  items = signal<TnMenuItem[]>([
    { id: 'edit', label: 'Edit', action: jest.fn() },
    { id: 'delete', label: 'Delete', action: jest.fn() },
    { id: 'disabled-item', label: 'Locked', disabled: true, action: jest.fn() },
  ]);
}

describe('TnMenuHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let rootLoader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    rootLoader = TnMenuTesting.rootLoader(fixture);
  });

  function openMenu() {
    const trigger = fixture.nativeElement.querySelector('[data-testid="trigger"]') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
  }

  it('should find menu after opening', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(menu).toBeTruthy();
  });

  it('should get item labels', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    const labels = await menu.getItemLabels();
    expect(labels).toEqual(['Edit', 'Delete', 'Locked']);
  });

  it('should get item count', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(await menu.getItemCount()).toBe(3);
  });

  it('should click a menu item by label', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    await menu.clickItem({ label: 'Edit' });
    expect(hostComponent.items()[0].action).toHaveBeenCalled();
  });

  it('should click a menu item by regex', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    await menu.clickItem({ label: /del/i });
    expect(hostComponent.items()[1].action).toHaveBeenCalled();
  });

  it('should throw when clicking non-existent item', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    await expect(menu.clickItem({ label: 'NonExistent' })).rejects.toThrow(
      'Could not find menu item matching label "NonExistent"'
    );
  });

  it('should check if item is disabled', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(await menu.isItemDisabled({ label: 'Edit' })).toBe(false);
    expect(await menu.isItemDisabled({ label: 'Locked' })).toBe(true);
  });

  it('reports isItemSelected for items marked selected', async () => {
    hostComponent.items.set([
      { id: 'csv', label: 'CSV' },
      { id: 'json', label: 'JSON', selected: true },
    ]);
    fixture.detectChanges();
    openMenu();

    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(await menu.isItemSelected({ label: 'JSON' })).toBe(true);
    expect(await menu.isItemSelected({ label: 'CSV' })).toBe(false);
  });

  it('returns the label of the currently-selected item', async () => {
    hostComponent.items.set([
      { id: 'csv', label: 'CSV' },
      { id: 'json', label: 'JSON', selected: true },
    ]);
    fixture.detectChanges();
    openMenu();

    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(await menu.getSelectedItemLabel()).toBe('JSON');
  });

  it('returns null from getSelectedItemLabel when no item is selected', async () => {
    openMenu();
    const menu = await rootLoader.getHarness(TnMenuHarness);
    expect(await menu.getSelectedItemLabel()).toBeNull();
  });

  describe('suffix icon and tooltip', () => {
    beforeEach(() => {
      hostComponent.items.set([
        { id: 'edit', label: 'Edit', tooltip: 'Edit this dataset' },
        {
          id: 'delete',
          label: 'Delete',
          disabled: true,
          suffixIcon: 'lock',
          suffixIconLibrary: 'mdi',
          tooltip: 'Missing permissions for this action',
        },
        { id: 'plain', label: 'Plain' },
      ]);
      fixture.detectChanges();
      openMenu();
    });

    it('reads the suffix icon, or null without one', async () => {
      const menu = await rootLoader.getHarness(TnMenuHarness);
      expect(await menu.getItemSuffixIcon({ label: 'Delete' })).toBe('lock');
      expect(await menu.getItemSuffixIcon({ label: 'Plain' })).toBeNull();
    });

    it('reads the tooltip of an enabled and of a disabled item, or null without one', async () => {
      const menu = await rootLoader.getHarness(TnMenuHarness);
      expect(await menu.getItemTooltip({ label: 'Edit' })).toBe('Edit this dataset');
      expect(await menu.getItemTooltip({ label: 'Delete' })).toBe('Missing permissions for this action');
      expect(await menu.getItemTooltip({ label: 'Plain' })).toBeNull();
    });

    it('shows a disabled item\'s tooltip on hoverItem', async () => {
      const menu = await rootLoader.getHarness(TnMenuHarness);
      await menu.hoverItem({ label: 'Delete' });
      // The tooltip opens from a setTimeout, which zoneless stabilisation does not wait for.
      await new Promise<void>((resolve) => setTimeout(resolve));

      const tooltip = await rootLoader.getHarness(TnTooltipHarness);
      expect(await tooltip.getText()).toBe('Missing permissions for this action');
    });

    it('throws for an item that does not exist', async () => {
      const menu = await rootLoader.getHarness(TnMenuHarness);
      await expect(menu.getItemTooltip({ label: 'Nope' })).rejects.toThrow(
        'Could not find menu item with label "Nope"'
      );
    });
  });
});
