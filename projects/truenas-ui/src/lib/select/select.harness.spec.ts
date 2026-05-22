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
    // Checkboxes live inside the overlay panel (rendered into document.body
    // via CDK Overlay), not inside the select's host subtree.
    const checkboxes = document.querySelectorAll('tn-checkbox');
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
    // Options live in the overlay container; query the document directly.
    const options = document.querySelectorAll<HTMLElement>('.tn-select-option');
    // Click the disabled group option (Option B)
    options[1].click();
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

describe('TnSelectComponent - keyboard navigation', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let trigger: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
  });

  function press(key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    trigger.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function focusedOptionLabel(): string | null {
    // Options live in the CDK overlay container, not the fixture subtree.
    const focused = document.querySelector('.tn-select-option.focused');
    return focused ? (focused.textContent ?? '').trim() : null;
  }

  it('opens the dropdown on ArrowDown when closed', () => {
    expect(document.querySelector('.tn-select-dropdown')).toBeNull();

    press('ArrowDown');

    expect(document.querySelector('.tn-select-dropdown')).toBeTruthy();
    expect(focusedOptionLabel()).toBe('Apple');
  });

  it('opens with last option focused on ArrowUp', () => {
    press('ArrowUp');
    expect(focusedOptionLabel()).toBe('Cherry');
  });

  it('moves focus down with ArrowDown and wraps at the end', () => {
    press('ArrowDown'); // Apple
    press('ArrowDown'); // Banana
    expect(focusedOptionLabel()).toBe('Banana');
    press('ArrowDown'); // Cherry
    expect(focusedOptionLabel()).toBe('Cherry');
    press('ArrowDown'); // wraps to Apple
    expect(focusedOptionLabel()).toBe('Apple');
  });

  it('moves focus up with ArrowUp and wraps at the start', () => {
    press('ArrowDown'); // Apple
    press('ArrowUp'); // wraps to Cherry
    expect(focusedOptionLabel()).toBe('Cherry');
    press('ArrowUp');
    expect(focusedOptionLabel()).toBe('Banana');
  });

  it('Home jumps to the first option, End to the last', () => {
    press('ArrowDown');
    press('ArrowDown');
    press('Home');
    expect(focusedOptionLabel()).toBe('Apple');
    press('End');
    expect(focusedOptionLabel()).toBe('Cherry');
  });

  it('Enter selects the focused option', () => {
    press('ArrowDown'); // open + focus Apple
    press('ArrowDown'); // Banana
    press('Enter');

    expect(hostComponent.selectedValue).toBe('banana');
    expect(document.querySelector('.tn-select-dropdown')).toBeNull();
  });

  it('Space selects the focused option', () => {
    press('ArrowDown');
    press('ArrowDown');
    press(' ');
    expect(hostComponent.selectedValue).toBe('banana');
  });

  it('Escape closes the dropdown without selecting', () => {
    press('ArrowDown');
    press('Escape');
    expect(document.querySelector('.tn-select-dropdown')).toBeNull();
    expect(hostComponent.selectedValue).toBeNull();
  });

  it('skips disabled options when moving focus', () => {
    hostComponent.options.set([
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ]);
    fixture.detectChanges();

    press('ArrowDown'); // A
    press('ArrowDown'); // skips B → C
    expect(focusedOptionLabel()).toBe('C');
  });

  it('exposes the focused option via aria-activedescendant on the trigger', () => {
    press('ArrowDown');
    const id = trigger.getAttribute('aria-activedescendant');
    expect(id).toBeTruthy();
    const focused = document.querySelector('.tn-select-option.focused');
    expect(focused?.id).toBe(id);
  });

  it('calls preventDefault on navigation keys so the page does not scroll', () => {
    const event = press('ArrowDown');
    expect(event.defaultPrevented).toBe(true);
  });

  it('does nothing when the select is disabled', () => {
    hostComponent.disabled.set(true);
    fixture.detectChanges();

    press('ArrowDown');
    expect(document.querySelector('.tn-select-dropdown')).toBeNull();
  });

  it('keeps focus on the trigger after Escape closes the dropdown', () => {
    trigger.focus();
    press('ArrowDown'); // open
    expect(document.querySelector('.tn-select-dropdown')).toBeTruthy();

    press('Escape');

    expect(document.querySelector('.tn-select-dropdown')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps focus on the trigger after Enter selects an option', () => {
    trigger.focus();
    press('ArrowDown'); // open + focus Apple
    press('Enter'); // select Apple, close

    expect(hostComponent.selectedValue).toBe('apple');
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab closes the dropdown without refocusing the trigger', () => {
    // Pressing Tab from the trigger should let the natural Tab advance move
    // focus to the next element — closeDropdown must not yank it back.
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    document.body.appendChild(nextBtn);

    try {
      trigger.focus();
      press('ArrowDown'); // open
      press('Tab');

      // Move focus to the next element (Tab's natural behaviour, which we
      // can't simulate via dispatchEvent — just assert closeDropdown didn't
      // re-grab focus, so the natural advance succeeds.)
      nextBtn.focus();

      expect(document.querySelector('.tn-select-dropdown')).toBeNull();
      expect(document.activeElement).toBe(nextBtn);
    } finally {
      nextBtn.remove();
    }
  });
});
