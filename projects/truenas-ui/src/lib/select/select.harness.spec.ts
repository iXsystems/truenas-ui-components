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

  handleSelection(value: string | null): void {
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
      [allowEmpty]="true"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestMultiHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]);
  selectedValues: (string | null)[] = [];

  handleSelection(value: string | null): void {
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

  handleSelection(value: { id: number; name: string } | null): void {
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

  handleSelection(value: string | null): void {
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

@Component({
  selector: 'tn-test-allow-empty-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      testId="fruit"
      placeholder="Select a fruit"
      [options]="options()"
      [allowEmpty]="allowEmpty()"
      [emptyLabel]="emptyLabel()"
      (selectionChange)="handleSelection($event)" />
  `
})
class TestAllowEmptyHostComponent {
  options = signal<TnSelectOption<string>[]>([
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ]);
  allowEmpty = signal(true);
  emptyLabel = signal('--');
  selections: (string | null)[] = [];

  handleSelection(value: string | null): void {
    this.selections.push(value);
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

    it('should render the dropdown into the overlay container when opened', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      // Dropdown is rendered via CDK overlay into document.body, not the host
      // subtree. Positioning is delegated to CDK's flexibleConnectedTo strategy
      // (flip above when there's no room below), which doesn't add a custom
      // class for us to assert on — covered by CDK's own tests.
      expect(document.querySelector('.tn-select-dropdown')).not.toBeNull();
    });

    it('should close when the backdrop (outside click) is clicked', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await select.open();
      expect(await select.isOpen()).toBe(true);

      // A click anywhere outside the panel lands on the transparent backdrop
      // that CDK renders over the viewport. This is the dismiss path that was
      // previously broken: the backdrop-less overlay only closed on clicks
      // strictly outside the (oversized) pane, so clicks in the empty area
      // beside a narrow panel never dismissed it.
      const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop');
      expect(backdrop).not.toBeNull();
      backdrop!.click();

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

  describe('clear', () => {
    it('should throw when the select has no empty option', async () => {
      const select = await loader.getHarness(TnSelectHarness);
      await expect(select.clear()).rejects.toThrow(
        'Select has no empty option — set `allowEmpty` to make it clearable.'
      );
      // The probe open must not leak past the error.
      expect(await select.isOpen()).toBe(false);
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

  it('should ignore allowEmpty in multiple mode', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    expect(await select.getOptions()).toEqual(['Apple', 'Banana', 'Cherry']);
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

@Component({
  selector: 'tn-test-twin-host',
  standalone: true,
  imports: [TnSelectComponent],
  template: `
    <tn-select [options]="options" />
    <tn-select [options]="options" />
  `,
})
class TestTwinHostComponent {
  options: TnSelectOption<string>[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ];
}

describe('TnSelectComponent — id uniqueness without testId', () => {
  it('should give each select instance a distinct option-id namespace', async () => {
    await TestBed.configureTestingModule({ imports: [TestTwinHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TestTwinHostComponent);
    fixture.detectChanges();

    // Open each select in turn and collect the option ids it produces.
    // (Opening one closes the other via outside-click semantics in real DOM;
    // we don't rely on both being open simultaneously — we just need to verify
    // the id namespaces don't collide across instances.)
    const triggers = fixture.nativeElement.querySelectorAll('.tn-select-trigger') as NodeListOf<HTMLElement>;
    const idsPerInstance: string[][] = [];
    for (const trigger of Array.from(triggers)) {
      trigger.click();
      fixture.detectChanges();
      idsPerInstance.push(
        Array.from(document.querySelectorAll('.tn-select-option') as NodeListOf<HTMLElement>)
          .map((el) => el.id),
      );
      trigger.click(); // close so the next iteration starts clean
      fixture.detectChanges();
    }

    const [first, second] = idsPerInstance;
    expect(first).toHaveLength(2);
    expect(second).toHaveLength(2);
    // No id appears in both instances' namespaces.
    expect(first.some((id) => second.includes(id))).toBe(false);
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

// ===========================================================================
// Per-option test ids (data-driven children scoped by the select's testId)
// ===========================================================================
@Component({
  selector: 'tn-test-optionid-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select
      [testId]="testId()"
      [options]="options()"
      [optionGroups]="groups()"
      [optionTestIdKey]="keyFn()" />
  `,
})
class OptionTestIdHostComponent {
  testId = signal<string>('quick-filters');
  options = signal<TnSelectOption<string>[]>([
    { value: 'ssd', label: 'SSD' },
    { value: 'hdd', label: 'Spinning Disk' },
  ]);
  groups = signal<TnSelectOptionGroup<string>[]>([]);
  keyFn = signal<((o: TnSelectOption<string>) => string | number) | undefined>(undefined);
}

describe('TnSelectComponent — per-option test ids', () => {
  let fixture: ComponentFixture<OptionTestIdHostComponent>;
  let host: OptionTestIdHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OptionTestIdHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(OptionTestIdHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function openAndGetOptionTestIds(): (string | null)[] {
    (fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement).click();
    fixture.detectChanges();
    return Array.from(document.querySelectorAll<HTMLElement>('.tn-select-option'))
      .map((el) => el.getAttribute('data-testid'));
  }

  it('applies the select test id to the interactive trigger, not the container wrapper', () => {
    const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
    const container = fixture.nativeElement.querySelector('.tn-select-container') as HTMLElement;
    expect(trigger.getAttribute('data-testid')).toBe('select-quick-filters');
    expect(container.hasAttribute('data-testid')).toBe(false);
  });

  it('scopes each option with the select base: option-<base>-<value>', () => {
    expect(openAndGetOptionTestIds()).toEqual(['option-quick-filters-ssd', 'option-quick-filters-hdd']);
  });

  it('falls back to option-<value> when the select has no base', () => {
    host.testId.set('');
    fixture.detectChanges();
    expect(openAndGetOptionTestIds()).toEqual(['option-ssd', 'option-hdd']);
  });

  it('uses optionTestIdKey to pick the discriminator (e.g. label over value)', () => {
    host.keyFn.set((o) => o.label);
    fixture.detectChanges();
    expect(openAndGetOptionTestIds()).toEqual([
      'option-quick-filters-ssd',
      'option-quick-filters-spinning-disk',
    ]);
  });

  it('scopes grouped options the same way', () => {
    host.options.set([]);
    host.groups.set([
      { label: 'Local', options: [{ value: 'ssd', label: 'SSD' }, { value: 'hdd', label: 'HDD' }] },
    ]);
    fixture.detectChanges();
    expect(openAndGetOptionTestIds()).toEqual(['option-quick-filters-ssd', 'option-quick-filters-hdd']);
  });
});

// ===========================================================================
// allowEmpty — synthetic clear option
// ===========================================================================
describe('TnSelectComponent - allowEmpty', () => {
  let fixture: ComponentFixture<TestAllowEmptyHostComponent>;
  let hostComponent: TestAllowEmptyHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAllowEmptyHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestAllowEmptyHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should render the empty option first', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    expect(await select.getOptions()).toEqual(['--', 'Apple', 'Banana']);
  });

  it('should not render the empty option when allowEmpty is false', async () => {
    hostComponent.allowEmpty.set(false);

    const select = await loader.getHarness(TnSelectHarness);
    expect(await select.getOptions()).toEqual(['Apple', 'Banana']);
  });

  it('should use a custom emptyLabel', async () => {
    hostComponent.emptyLabel.set('(none)');

    const select = await loader.getHarness(TnSelectHarness);
    expect(await select.getOptions()).toEqual(['(none)', 'Apple', 'Banana']);
  });

  it('should clear the selection and emit null via harness clear()', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Banana');
    expect(await select.getDisplayText()).toBe('Banana');

    await select.clear();

    expect(await select.getDisplayText()).toBe('Select a fruit');
    expect(hostComponent.selections).toEqual(['banana', null]);
    expect(await select.isOpen()).toBe(false);
  });

  it('should clear the selection when the empty option is picked by label', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Apple');
    await select.selectOption('--');

    expect(await select.getDisplayText()).toBe('Select a fruit');
    expect(hostComponent.selections).toEqual(['apple', null]);
  });

  it('should mark the empty option as selected when no value is set', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.open();

    const empty = document.querySelector('.tn-select-empty-option');
    expect(empty?.classList.contains('selected')).toBe(true);
    expect(empty?.getAttribute('aria-selected')).toBe('true');
  });

  it('should emit a stable test id for the empty option', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.open();

    const empty = document.querySelector('.tn-select-empty-option');
    expect(empty?.getAttribute('data-testid')).toBe('option-fruit-empty');
  });

  it('should seed keyboard focus on the empty option when nothing is selected', () => {
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const focused = document.querySelector('.tn-select-option.focused');
    expect(focused?.classList.contains('tn-select-empty-option')).toBe(true);
  });

  it('should clear the selection with Enter on the empty option', async () => {
    const select = await loader.getHarness(TnSelectHarness);
    await select.selectOption('Apple');

    const trigger = fixture.nativeElement.querySelector('.tn-select-trigger') as HTMLElement;
    const press = (key: string) => {
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };

    press('ArrowDown'); // open, focus seeded at the selected option (Apple)
    press('Home');      // jump to the empty option
    press('Enter');

    expect(await select.getDisplayText()).toBe('Select a fruit');
    expect(hostComponent.selections).toEqual(['apple', null]);
  });
});
