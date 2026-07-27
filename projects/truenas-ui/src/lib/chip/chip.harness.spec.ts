import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnChipComponent } from './chip.component';
import type { ChipColor } from './chip.component';
import { TnChipHarness } from './chip.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnChipComponent],
  template: `<tn-chip [label]="label()" [icon]="icon()" [color]="color()" [closable]="closable()"
    [disabled]="disabled()" (onClick)="handleClick()" (onClose)="handleClose()" />`
})
class TestHostComponent {
  label = signal('Test Chip');
  icon = signal<string | undefined>(undefined);
  color = signal<ChipColor>('primary');
  closable = signal(true);
  disabled = signal(false);
  clickCount = 0;
  closeCount = 0;

  handleClick(): void {
    this.clickCount++;
  }

  handleClose(): void {
    this.closeCount++;
  }
}

describe('TnChipHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const chip = await loader.getHarness(TnChipHarness);
    expect(chip).toBeTruthy();
  });

  describe('getLabel', () => {
    it('should get the chip label', async () => {
      hostComponent.label.set('Active');

      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.getLabel()).toBe('Active');
    });

    it('should reflect an updated label', async () => {
      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.getLabel()).toBe('Test Chip');

      hostComponent.label.set('Updated');
      expect(await chip.getLabel()).toBe('Updated');
    });
  });

  describe('getColor', () => {
    it('should default to primary', async () => {
      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.getColor()).toBe('primary');
    });

    it('should read the configured color', async () => {
      hostComponent.color.set('accent');

      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.getColor()).toBe('accent');
    });
  });

  describe('isDisabled', () => {
    it('should return false when enabled', async () => {
      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.isDisabled()).toBe(false);
    });

    it('should return true when disabled', async () => {
      hostComponent.disabled.set(true);

      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.isDisabled()).toBe(true);
    });
  });

  describe('isClosable', () => {
    it('should return true when closable', async () => {
      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.isClosable()).toBe(true);
    });

    it('should return false when not closable', async () => {
      hostComponent.closable.set(false);

      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.isClosable()).toBe(false);
    });
  });

  describe('hasIcon', () => {
    it('should return false with no icon', async () => {
      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.hasIcon()).toBe(false);
    });

    it('should return true when an icon is set', async () => {
      hostComponent.icon.set('plus');

      const chip = await loader.getHarness(TnChipHarness);
      expect(await chip.hasIcon()).toBe(true);
    });
  });

  describe('click', () => {
    it('should trigger the onClick handler', async () => {
      expect(hostComponent.clickCount).toBe(0);

      const chip = await loader.getHarness(TnChipHarness);
      await chip.click();

      expect(hostComponent.clickCount).toBe(1);
    });

    it('should not trigger onClick when disabled', async () => {
      hostComponent.disabled.set(true);

      const chip = await loader.getHarness(TnChipHarness);
      await chip.click();

      expect(hostComponent.clickCount).toBe(0);
    });
  });

  describe('close', () => {
    it('should trigger the onClose handler', async () => {
      expect(hostComponent.closeCount).toBe(0);

      const chip = await loader.getHarness(TnChipHarness);
      await chip.close();

      expect(hostComponent.closeCount).toBe(1);
    });

    it('should throw when the chip is not closable', async () => {
      hostComponent.closable.set(false);

      const chip = await loader.getHarness(TnChipHarness);
      await expect(chip.close()).rejects.toThrow(/not closable/);
    });
  });

  describe('with() filter', () => {
    it('should filter by exact label', async () => {
      hostComponent.label.set('Production');

      const chip = await loader.getHarness(TnChipHarness.with({ label: 'Production' }));
      expect(chip).toBeTruthy();
    });

    it('should filter by case-insensitive regex', async () => {
      hostComponent.label.set('Has SSH Access');

      const chip = await loader.getHarness(TnChipHarness.with({ label: /ssh/i }));
      expect(chip).toBeTruthy();
    });
  });

  describe('hasHarness', () => {
    it('should return true when a matching chip exists', async () => {
      expect(await loader.hasHarness(TnChipHarness)).toBe(true);
    });

    it('should return false when no chip with the label exists', async () => {
      hostComponent.label.set('Active');

      expect(await loader.hasHarness(TnChipHarness.with({ label: 'NonExistent' }))).toBe(false);
    });
  });
});
