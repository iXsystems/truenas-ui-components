import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TnButtonToggleGroupComponent } from './button-toggle-group.component';
import { TnButtonToggleComponent } from './button-toggle.component';
import { TnButtonToggleHarness, TnButtonToggleGroupHarness } from './button-toggle.harness';

@Component({
  selector: 'tn-button-toggle-harness-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group>
      <tn-button-toggle value="bold">Bold</tn-button-toggle>
      <tn-button-toggle value="italic">Italic</tn-button-toggle>
      <tn-button-toggle value="underline" [disabled]="true">Underline</tn-button-toggle>
    </tn-button-toggle-group>

    <tn-button-toggle value="standalone">Standalone</tn-button-toggle>
  `,
})
class ButtonToggleHarnessTestComponent {}

describe('TnButtonToggleHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleHarnessTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonToggleHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('with()', () => {
    it('should find toggle by label', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
      expect(await toggle.getLabelText()).toContain('Bold');
    });

    it('should find toggle by label regex', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /italic/i }));
      expect(await toggle.getLabelText()).toContain('Italic');
    });

    it('should find all toggles', async () => {
      const toggles = await loader.getAllHarnesses(TnButtonToggleHarness);
      expect(toggles.length).toBe(4);
    });
  });

  describe('getLabelText()', () => {
    it('should return the label text', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.getLabelText()).toContain('Standalone');
    });
  });

  describe('isChecked()', () => {
    it('should return false when unchecked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should return true after toggling', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(true);
    });
  });

  describe('isDisabled()', () => {
    it('should return false for enabled toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
      expect(await toggle.isDisabled()).toBe(false);
    });

    it('should return true for disabled toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Underline/ }));
      expect(await toggle.isDisabled()).toBe(true);
    });
  });

  describe('toggle()', () => {
    it('should toggle the state', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);

      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(false);
    });
  });

  describe('check()', () => {
    it('should check the toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);
    });

    it('should be a no-op if already checked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);
    });
  });

  describe('uncheck()', () => {
    it('should uncheck the toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.uncheck();
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should be a no-op if already unchecked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);

      await toggle.uncheck();
      expect(await toggle.isChecked()).toBe(false);
    });
  });
});

describe('TnButtonToggleGroupHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleHarnessTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonToggleHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('getToggles()', () => {
    it('should return all toggles in the group', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const toggles = await group.getToggles();
      expect(toggles.length).toBe(3);
    });
  });

  describe('getCheckedToggle()', () => {
    it('should return null when no toggle is checked', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const checked = await group.getCheckedToggle();
      expect(checked).toBeNull();
    });

    it('should return the checked toggle', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const toggles = await group.getToggles();
      await toggles[0].toggle();

      const checked = await group.getCheckedToggle();
      expect(checked).not.toBeNull();
      expect(await checked!.getLabelText()).toContain('Bold');
    });
  });
});
