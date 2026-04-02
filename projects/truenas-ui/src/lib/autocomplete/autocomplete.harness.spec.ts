import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnAutocompleteComponent } from './autocomplete.component';
import { TnAutocompleteHarness } from './autocomplete.harness';

interface Fruit {
  id: string;
  name: string;
}

const displayFruit = (fruit: Fruit): string => fruit.name;

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [options]="options()"
      [displayWith]="displayFruit"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [requireSelection]="requireSelection()"
      [filterFn]="customFilter()"
      [formControl]="control"
      (optionSelected)="handleSelection($event)" />
  `
})
class TestHostComponent {
  options = signal<Fruit[]>([
    { id: 'apple', name: 'Apple' },
    { id: 'banana', name: 'Banana' },
    { id: 'cherry', name: 'Cherry' },
    { id: 'date', name: 'Date' },
    { id: 'elderberry', name: 'Elderberry' },
  ]);
  placeholder = signal('Search fruits...');
  disabled = signal(false);
  requireSelection = signal(false);
  customFilter = signal<((option: Fruit, term: string) => boolean) | undefined>(undefined);
  control = new FormControl<Fruit | null>(null);
  selectedValue: Fruit | null = null;
  displayFruit = displayFruit;

  handleSelection(value: Fruit): void {
    this.selectedValue = value;
  }
}

describe('TnAutocompleteHarness', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness', async () => {
    const autocomplete = await loader.getHarness(TnAutocompleteHarness);
    expect(autocomplete).toBeTruthy();
  });

  describe('getInputValue / setInputValue', () => {
    it('should return empty string initially', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      expect(await ac.getInputValue()).toBe('');
    });

    it('should set and read input value', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.setInputValue('Ban');
      expect(await ac.getInputValue()).toBe('Ban');
    });
  });

  describe('isOpen', () => {
    it('should be closed initially', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      expect(await ac.isOpen()).toBe(false);
    });

    it('should open on focus', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.focus();
      expect(await ac.isOpen()).toBe(true);
    });
  });

  describe('isDisabled', () => {
    it('should return false when enabled', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      expect(await ac.isDisabled()).toBe(false);
    });

    it('should return true when disabled', async () => {
      hostComponent.disabled.set(true);
      const ac = await loader.getHarness(TnAutocompleteHarness);
      expect(await ac.isDisabled()).toBe(true);
    });
  });

  describe('getOptions', () => {
    it('should return all options when input is empty', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.focus();
      const options = await ac.getOptions();
      expect(options).toEqual(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']);
    });

    it('should return filtered options after typing', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.setInputValue('an');
      const options = await ac.getOptions();
      expect(options).toEqual(['Banana']);
    });
  });

  describe('selectOption', () => {
    it('should select an option by exact text', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.selectOption('Cherry');

      expect(await ac.getInputValue()).toBe('Cherry');
      expect(hostComponent.selectedValue).toEqual({ id: 'cherry', name: 'Cherry' });
    });

    it('should select an option by regex', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.selectOption(/ban/i);

      expect(await ac.getInputValue()).toBe('Banana');
      expect(hostComponent.selectedValue).toEqual({ id: 'banana', name: 'Banana' });
    });

    it('should throw when option is not found', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await expect(ac.selectOption('Mango')).rejects.toThrow(
        'Could not find autocomplete option matching "Mango"'
      );
    });

    it('should update form control value on selection', async () => {
      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.selectOption('Apple');

      expect(hostComponent.control.value).toEqual({ id: 'apple', name: 'Apple' });
    });
  });

  describe('with() filter', () => {
    it('should filter by placeholder', async () => {
      const ac = await loader.getHarness(
        TnAutocompleteHarness.with({ placeholder: 'Search fruits...' })
      );
      expect(ac).toBeTruthy();
    });
  });

  describe('filtering', () => {
    it('should use custom filterFn when provided', async () => {
      hostComponent.customFilter.set(
        (option: Fruit, term: string) => option.name.startsWith(term)
      );

      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.setInputValue('B');
      const options = await ac.getOptions();
      expect(options).toEqual(['Banana']);

      // Lowercase 'b' should NOT match since startsWith is case-sensitive
      await ac.setInputValue('b');
      const options2 = await ac.getOptions();
      expect(options2).toEqual([]);
    });
  });

  describe('requireSelection', () => {
    it('should revert to last valid selection on blur with invalid input', async () => {
      hostComponent.requireSelection.set(true);

      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.selectOption('Apple');
      expect(await ac.getInputValue()).toBe('Apple');

      // Type invalid text and blur
      await ac.setInputValue('xyz');
      await ac.blur();

      expect(await ac.getInputValue()).toBe('Apple');
    });

    it('should clear when no prior selection and invalid input', async () => {
      hostComponent.requireSelection.set(true);

      const ac = await loader.getHarness(TnAutocompleteHarness);
      await ac.setInputValue('xyz');
      await ac.blur();

      expect(await ac.getInputValue()).toBe('');
    });
  });
});
