import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnSelectOption } from './select.component';
import { TnSelectComponent } from './select.component';
import { TnSelectHarness } from './select.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      [options]="options()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]);
  placeholder = signal('Select a fruit');
  disabled = signal(false);
  selectedValue: string | null = null;

  handleSelection(value: string): void {
    this.selectedValue = value;
  }
}

describe('TnSelectHarness', () => {
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
    const select = await loader.getHarness(TnSelectHarness);
    expect(select).toBeTruthy();
  });

  describe('getDisplayText', () => {
    it('should return placeholder when no option is selected', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      expect(await select.getDisplayText()).toBe('Select a fruit');
    });

    it('should return selected option label after selection', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.selectOption('Banana');
      expect(await select.getDisplayText()).toBe('Banana');
    });

    it('should reflect updated placeholder', async () => {
      hostComponent.placeholder.set('Pick one');

      const select = await loader.getHarness(TnSelectHarness);
      expect(await select.getDisplayText()).toBe('Pick one');
    });
  });

  describe('isDisabled', () => {
    it('should return false when select is enabled', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      expect(await select.isDisabled()).toBe(false);
    });

    it('should return true when select is disabled', async () => {
      hostComponent.disabled.set(true);

      const select = await loader.getHarness(TnSelectHarness);
      expect(await select.isDisabled()).toBe(true);
    });
  });

  describe('isOpen / open / close', () => {
    it('should be closed initially', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      expect(await select.isOpen()).toBe(false);
    });

    it('should open the dropdown', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      expect(await select.isOpen()).toBe(true);
    });

    it('should close the dropdown', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      expect(await select.isOpen()).toBe(true);

      await select.close();
      expect(await select.isOpen()).toBe(false);
    });

    it('should be a no-op when opening an already open dropdown', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      await select.open();
      expect(await select.isOpen()).toBe(true);
    });

    it('should be a no-op when closing an already closed dropdown', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.close();
      expect(await select.isOpen()).toBe(false);
    });
  });

  describe('selectOption', () => {
    it('should select an option by exact text', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.selectOption('Cherry');

      expect(await select.getDisplayText()).toBe('Cherry');
      expect(hostComponent.selectedValue).toBe('cherry');
    });

    it('should select an option by regex', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.selectOption(/ban/i);

      expect(await select.getDisplayText()).toBe('Banana');
      expect(hostComponent.selectedValue).toBe('banana');
    });

    it('should throw when option is not found', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await expect(select.selectOption('Mango')).rejects.toThrow(
        'Could not find option matching "Mango"'
      );
    });
  });

  describe('getOptions', () => {
    it('should return all option labels', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      const options = await select.getOptions();
      expect(options).toEqual(['Apple', 'Banana', 'Cherry']);
    });

    it('should reflect updated options', async () => {
      hostComponent.options.set([
        { value: 'x', label: 'X' },
        { value: 'y', label: 'Y' },
      ]);

      const select = await loader.getHarness(TnSelectHarness);
      const options = await select.getOptions();
      expect(options).toEqual(['X', 'Y']);
    });
  });

  describe('with() filter', () => {
    it('should filter by exact display text', async () => {
      const select = await loader.getHarness(
        TnSelectHarness.with({ displayText: 'Select a fruit' })
      );
      expect(select).toBeTruthy();
    });

    it('should filter by regex pattern', async () => {
      const select = await loader.getHarness(
        TnSelectHarness.with({ displayText: /fruit/i })
      );
      expect(select).toBeTruthy();
    });

    it('should filter by selected option text', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.selectOption('Apple');

      const filtered = await loader.getHarness(
        TnSelectHarness.with({ displayText: 'Apple' })
      );
      expect(filtered).toBeTruthy();
    });
  });

  describe('hasHarness', () => {
    it('should return true when select exists', async () => {
      expect(await loader.hasHarness(TnSelectHarness)).toBe(true);
    });

    it('should return false when select with display text does not exist', async () => {
      expect(
        await loader.hasHarness(TnSelectHarness.with({ displayText: 'NonExistent' }))
      ).toBe(false);
    });
  });
});
