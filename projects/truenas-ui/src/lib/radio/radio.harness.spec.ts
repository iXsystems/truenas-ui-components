import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TnRadioComponent } from './radio.component';
import { TnRadioHarness } from './radio.harness';

@Component({
  selector: 'tn-radio-harness-test',
  standalone: true,
  imports: [TnRadioComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-radio
      label="Option A"
      value="a"
      name="test-group"
      testId="radio-a" />
    <tn-radio
      label="Option B"
      value="b"
      name="test-group" />
    <tn-radio
      label="Disabled Option"
      value="c"
      name="test-group"
      testId="radio-disabled"
      [disabled]="true" />
  `,
})
class RadioHarnessTestComponent {}

describe('TnRadioHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioHarnessTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(RadioHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('with()', () => {
    it('should find radio by label', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      expect(await radio.getLabelText()).toBe('Option A');
    });

    it('should find radio by label regex', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: /option b/i }));
      expect(await radio.getLabelText()).toBe('Option B');
    });

    it('should find radio by testId', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ testId: 'radio-a' }));
      expect(await radio.getLabelText()).toBe('Option A');
    });

    it('should find all radios', async () => {
      const radios = await loader.getAllHarnesses(TnRadioHarness);
      expect(radios.length).toBe(3);
    });
  });

  describe('getLabelText()', () => {
    it('should return the label text', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      expect(await radio.getLabelText()).toBe('Option A');
    });
  });

  describe('isChecked()', () => {
    it('should return false when unchecked', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      expect(await radio.isChecked()).toBe(false);
    });

    it('should return true after checking', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      await radio.check();
      expect(await radio.isChecked()).toBe(true);
    });
  });

  describe('isDisabled()', () => {
    it('should return false for enabled radio', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      expect(await radio.isDisabled()).toBe(false);
    });

    it('should return true for disabled radio', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Disabled Option' }));
      expect(await radio.isDisabled()).toBe(true);
    });
  });

  describe('getTestId()', () => {
    it('should return the test ID', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      expect(await radio.getTestId()).toBe('radio-a');
    });

    it('should return null when no test ID is set', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option B' }));
      expect(await radio.getTestId()).toBeNull();
    });
  });

  describe('check()', () => {
    it('should select the radio button', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      await radio.check();
      expect(await radio.isChecked()).toBe(true);
    });

    it('should be a no-op if already checked', async () => {
      const radio = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      await radio.check();
      expect(await radio.isChecked()).toBe(true);

      // Check again - should still be checked
      await radio.check();
      expect(await radio.isChecked()).toBe(true);
    });

    it('should allow selecting different radio in same group', async () => {
      const radioA = await loader.getHarness(TnRadioHarness.with({ label: 'Option A' }));
      const radioB = await loader.getHarness(TnRadioHarness.with({ label: 'Option B' }));

      await radioA.check();
      expect(await radioA.isChecked()).toBe(true);

      await radioB.check();
      expect(await radioB.isChecked()).toBe(true);
      expect(await radioA.isChecked()).toBe(false);
    });
  });
});
