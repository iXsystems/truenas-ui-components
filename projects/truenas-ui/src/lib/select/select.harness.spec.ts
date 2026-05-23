import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import type { TnSelectOption, TnSelectOptionGroup } from './select.component';
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

@Component({
  selector: 'tn-test-multi-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      placeholder="Select fruits"
      [options]="options()"
      [multiple]="true"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestMultiHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]);
  selectedValues: string[] = [];

  handleSelection(value: string): void {
    this.selectedValues.push(value);
  }
}

@Component({
  selector: 'tn-test-compare-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      [options]="options()"
      [compareWith]="compareFn"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestCompareHostComponent {
  options = signal<TnSelectOption<{ id: number; name: string }>[]>([
    { value: { id: 1, name: 'One' }, label: 'Option 1' },
    { value: { id: 2, name: 'Two' }, label: 'Option 2' },
  ]);
  selectedValue: { id: number; name: string } | null = null;

  compareFn = (a: { id: number } | null, b: { id: number } | null) =>
    a?.id === b?.id;

  handleSelection(value: { id: number; name: string }): void {
    this.selectedValue = value;
  }
}

@Component({
  selector: 'tn-test-group-disabled-host',
  standalone: true,
  imports: [TnSelectComponent],
   
  template: `
    <tn-select
      [optionGroups]="groups()"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestGroupDisabledHostComponent {
  groups = signal<TnSelectOptionGroup<string>[]>([
    {
      label: 'Enabled',
      options: [
        { value: 'a', label: 'Option A' },
      ]
    },
    {
      label: 'Disabled Group',
      disabled: true,
      options: [
        { value: 'b', label: 'Option B' },
      ]
    },
  ]);
  selectedValue: string | null = null;

  handleSelection(value: string): void {
    this.selectedValue = value;
  }
}

@Component({
  selector: 'tn-test-multi-output-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      placeholder="Pick"
      [options]="options()"
      [multiple]="true"
      (selectionChange)="lastItem = $event"
      (multiSelectionChange)="lastArray = $event" />
  `
})
class TestMultiOutputHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'x', label: 'X' },
    { value: 'y', label: 'Y' },
  ]);
  lastItem: string | null = null;
  lastArray: string[] = [];
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

    it('should open below by default when there is room', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      // jsdom defaults to a tall enough viewport that there's plenty of room.
      await select.open();
      const dropdown = fixture.nativeElement.querySelector('.tn-select-dropdown');
      expect(dropdown).not.toBeNull();
      expect(dropdown.classList.contains('tn-select-dropdown--above')).toBe(false);
    });

    it('should flip above when there is no room below', async () => {
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger');
      // Pin the trigger to the bottom of the viewport so spaceBelow is ~0.
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: window.innerHeight - 30,
        bottom: window.innerHeight - 5,
        left: 0,
        right: 200,
        width: 200,
        height: 25,
        x: 0,
        y: window.innerHeight - 30,
        toJSON: () => ({}),
      } as DOMRect);

      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      const dropdown = fixture.nativeElement.querySelector('.tn-select-dropdown');
      expect(dropdown.classList.contains('tn-select-dropdown--above')).toBe(true);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      // The outer beforeEach intentionally skips this for the harness suites
      // (the harness `open()` runs CD internally). Keyboard tests dispatch raw
      // events instead, so we need inputs propagated upfront.
      fixture.detectChanges();
    });

    function pressKey(key: string): void {
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    }

    function focusedOptionLabel(): string | null {
      const focused = fixture.nativeElement.querySelector('.tn-select-option.focused');
      return focused?.textContent?.trim() ?? null;
    }

    it('should open on ArrowDown and focus the first option', () => {
      pressKey('ArrowDown');
      expect(fixture.nativeElement.querySelector('.tn-select-dropdown')).not.toBeNull();
      expect(focusedOptionLabel()).toBe('Apple');
    });

    it('should focus the selected option when opening with a current value', () => {
      hostComponent.selectedValue = 'cherry';
      // Simulate writeValue via setting selected via component public API by
      // toggling through the trigger after picking from the existing options.
      // Easier: directly drive via host's options + open.
      const inst = fixture.debugElement.children[0].componentInstance as { writeValue: (v: string) => void };
      inst.writeValue('cherry');
      fixture.detectChanges();

      pressKey('Enter'); // open
      expect(focusedOptionLabel()).toBe('Cherry');
    });

    it('should move focus with ArrowDown / ArrowUp', () => {
      pressKey('ArrowDown'); // opens, focuses Apple
      pressKey('ArrowDown'); // Banana
      expect(focusedOptionLabel()).toBe('Banana');
      pressKey('ArrowDown'); // Cherry
      expect(focusedOptionLabel()).toBe('Cherry');
      pressKey('ArrowUp');   // Banana
      expect(focusedOptionLabel()).toBe('Banana');
    });

    it('should wrap when moving past the ends', () => {
      pressKey('ArrowDown');
      pressKey('ArrowUp'); // wraps to last
      expect(focusedOptionLabel()).toBe('Cherry');
      pressKey('ArrowDown'); // wraps back to first
      expect(focusedOptionLabel()).toBe('Apple');
    });

    it('should jump with Home / End', () => {
      pressKey('ArrowDown'); // open + Apple
      pressKey('End');
      expect(focusedOptionLabel()).toBe('Cherry');
      pressKey('Home');
      expect(focusedOptionLabel()).toBe('Apple');
    });

    it('should select the focused option on Enter and close', () => {
      pressKey('ArrowDown'); // open + Apple
      pressKey('ArrowDown'); // Banana
      pressKey('Enter');

      expect(fixture.nativeElement.querySelector('.tn-select-dropdown')).toBeNull();
      expect(hostComponent.selectedValue).toBe('banana');
    });

    it('should close and restore focus on Escape', () => {
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
      const focusSpy = jest.spyOn(trigger, 'focus');

      pressKey('ArrowDown'); // open
      expect(fixture.nativeElement.querySelector('.tn-select-dropdown')).not.toBeNull();

      pressKey('Escape');
      expect(fixture.nativeElement.querySelector('.tn-select-dropdown')).toBeNull();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should restore focus to trigger after option selection', () => {
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
      const focusSpy = jest.spyOn(trigger, 'focus');

      pressKey('ArrowDown');
      pressKey('Enter');

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should expose the focused option via aria-activedescendant', () => {
      pressKey('ArrowDown'); // open + Apple
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger');
      const activeId = trigger.getAttribute('aria-activedescendant');
      expect(activeId).not.toBeNull();
      const target = fixture.nativeElement.querySelector(`#${activeId}`);
      expect(target?.textContent?.trim()).toBe('Apple');
    });

    it('should close (without restoring focus) on Tab so the next element gets it', () => {
      const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
      const focusSpy = jest.spyOn(trigger, 'focus');

      pressKey('ArrowDown');
      pressKey('Tab');

      expect(fixture.nativeElement.querySelector('.tn-select-dropdown')).toBeNull();
      expect(focusSpy).not.toHaveBeenCalled();
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

describe('TnSelectHarness - multiple mode', () => {
  let fixture: ComponentFixture<TestMultiHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestMultiHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestMultiHostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should show placeholder when nothing selected', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    expect(await select.getDisplayText()).toBe('Select fruits');
  });

  it('should allow selecting multiple options', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Apple');
    expect(await select.getDisplayText()).toBe('Apple');

    await select.selectOption('Cherry');
    expect(await select.getDisplayText()).toBe('Apple, Cherry');
  });

  it('should toggle option off when clicked again', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Apple');
    await select.selectOption('Banana');
    expect(await select.getDisplayText()).toBe('Apple, Banana');

    // Deselect Apple
    await select.selectOption('Apple');
    expect(await select.getDisplayText()).toBe('Banana');
  });

  it('should keep dropdown open after selecting in multiple mode', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.open();
    await select.selectOption('Apple');
    expect(await select.isOpen()).toBe(true);
  });

  it('should show checkboxes for options in multi-select mode', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Apple');
    await select.open();
    const checkboxes = await select.locatorForAll('tn-checkbox')();
    expect(checkboxes.length).toBe(3);
  });
});

describe('TnSelectHarness - compareWith', () => {
  let fixture: ComponentFixture<TestCompareHostComponent>;
  let loader: HarnessLoader;
  let hostComponent: TestCompareHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCompareHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestCompareHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should select option using custom compareWith', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Option 1');
    expect(hostComponent.selectedValue?.id).toBe(1);
    expect(await select.getDisplayText()).toBe('Option 1');
  });

  it('should correctly identify selected option with compareWith', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Option 2');
    expect(await select.getDisplayText()).toBe('Option 2');

    // Select a different option
    await select.selectOption('Option 1');
    expect(await select.getDisplayText()).toBe('Option 1');
  });
});

describe('TnSelectHarness - group disabled', () => {
  let fixture: ComponentFixture<TestGroupDisabledHostComponent>;
  let loader: HarnessLoader;
  let hostComponent: TestGroupDisabledHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestGroupDisabledHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestGroupDisabledHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should not select an option from a disabled group', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.open();
    const options = await select.locatorForAll('.tn-select-option')();
    // Click the disabled group option (Option B)
    await options[1].click();
    expect(hostComponent.selectedValue).toBeNull();
  });

  it('should select an option from an enabled group', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Option A');
    expect(hostComponent.selectedValue).toBe('a');
  });
});

describe('TnSelectHarness - multiSelectionChange output', () => {
  let fixture: ComponentFixture<TestMultiOutputHostComponent>;
  let loader: HarnessLoader;
  let hostComponent: TestMultiOutputHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestMultiOutputHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestMultiOutputHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should not emit selectionChange in multiple mode', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('X');
    expect(hostComponent.lastItem).toBeNull();
  });

  it('should emit full array via multiSelectionChange', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('X');
    expect(hostComponent.lastArray).toEqual(['x']);

    await select.selectOption('Y');
    expect(hostComponent.lastArray).toEqual(['x', 'y']);
  });

  it('should emit updated array when deselecting', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('X');
    await select.selectOption('Y');
    expect(hostComponent.lastArray).toEqual(['x', 'y']);

    await select.selectOption('X');
    expect(hostComponent.lastArray).toEqual(['y']);
  });
});
