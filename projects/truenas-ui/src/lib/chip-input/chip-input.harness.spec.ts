import { TestKey } from '@angular/cdk/testing';
import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TnChipInputComponent, type TnChipInputOption } from './chip-input.component';
import { TnChipInputHarness } from './chip-input.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-chip-input
      placeholder="Add a tag"
      testId="tags"
      [formControl]="control"
      [suggestions]="suggestions()"
      [disabled]="disabled()"
      [allowDuplicates]="allowDuplicates()"
      [allowCustomValue]="allowCustomValue()"
      [addOnBlur]="addOnBlur()"
      [separatorKeys]="separatorKeys()"
      [maxChips]="maxChips()" />
  `,
})
class TestHostComponent {
  control = new FormControl<string[]>([]);
  suggestions = signal<string[]>(['Angular', 'React', 'Vue']);
  disabled = signal(false);
  allowDuplicates = signal(false);
  allowCustomValue = signal(true);
  addOnBlur = signal(false);
  separatorKeys = signal<string[]>(['Enter', ',']);
  maxChips = signal<number | undefined>(undefined);
}

describe('TnChipInputHarness', () => {
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

  it('loads the harness', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    expect(chipInput).toBeTruthy();
  });

  it('reflects a written value as chips', async () => {
    hostComponent.control.setValue(['one', 'two']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    expect(await chipInput.getChips()).toEqual(['one', 'two']);
  });

  it('adds a typed value as a chip and updates the form control', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('TypeScript');

    expect(await chipInput.getChips()).toEqual(['TypeScript']);
    expect(hostComponent.control.value).toEqual(['TypeScript']);
  });

  it('does not add duplicate values by default', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('dup');
    await chipInput.addChip('dup');

    expect(await chipInput.getChips()).toEqual(['dup']);
  });

  it('adds duplicate values when allowDuplicates is set', async () => {
    hostComponent.allowDuplicates.set(true);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('dup');
    await chipInput.addChip('dup');

    expect(await chipInput.getChips()).toEqual(['dup', 'dup']);
  });

  it('removes a chip and updates the form control', async () => {
    hostComponent.control.setValue(['keep', 'drop']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.removeChip('drop');

    expect(await chipInput.getChips()).toEqual(['keep']);
    expect(hostComponent.control.value).toEqual(['keep']);
  });

  it('honours maxChips', async () => {
    hostComponent.maxChips.set(1);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('first');
    await chipInput.addChip('second');

    expect(await chipInput.getChips()).toEqual(['first']);
  });

  it('commits a suggestion from the dropdown', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.selectSuggestion('Angular');

    expect(await chipInput.getChips()).toEqual(['Angular']);
    expect(hostComponent.control.value).toEqual(['Angular']);
  });

  it('filters suggestions by typed text and excludes selected values', async () => {
    hostComponent.control.setValue(['Angular']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.selectSuggestion('Vue');

    expect(await chipInput.getChips()).toEqual(['Angular', 'Vue']);
  });

  it('opens the dropdown when async suggestions arrive after typing', async () => {
    hostComponent.suggestions.set([]);
    const chipInput = await loader.getHarness(TnChipInputHarness);

    await chipInput.typeText('an');
    expect(await chipInput.getSuggestions()).toEqual([]);

    // Results land a tick later — the panel should re-open on its own.
    hostComponent.suggestions.set(['Angular', 'Vue']);
    fixture.detectChanges();

    expect(await chipInput.getSuggestions()).toEqual(['Angular']);
  });

  it('keeps the dropdown closed once maxChips is reached', async () => {
    hostComponent.maxChips.set(1);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('Angular');
    await chipInput.typeText('Vue');

    expect(await chipInput.getSuggestions()).toEqual([]);
  });

  it('returns focus to the field after removing a chip', async () => {
    hostComponent.control.setValue(['one', 'two']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.removeChip('one');

    expect(await chipInput.isInputFocused()).toBe(true);
  });

  it('removes the last chip on Backspace when the field is empty', async () => {
    hostComponent.control.setValue(['one', 'two']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.focus();
    await chipInput.pressKey(TestKey.BACKSPACE);

    expect(await chipInput.getChips()).toEqual(['one']);
  });

  it('commits a pending value on blur when addOnBlur is set', async () => {
    hostComponent.addOnBlur.set(true);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.typeText('committed');
    await chipInput.blur();

    expect(await chipInput.getChips()).toEqual(['committed']);
  });

  it('commits on a configured separator key', async () => {
    hostComponent.separatorKeys.set(['Enter', ' ']);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.typeText('spaced');
    await chipInput.pressKey(' ');

    expect(await chipInput.getChips()).toEqual(['spaced']);
  });

  it('commits the highlighted suggestion via ArrowDown + Enter', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.typeText('e'); // matches React and Vue
    await chipInput.pressKey(TestKey.DOWN_ARROW);
    await chipInput.pressKey(TestKey.ENTER);

    expect(await chipInput.getChips()).toEqual(['React']);
  });

  it('rejects free text not in suggestions when allowCustomValue is false', async () => {
    hostComponent.allowCustomValue.set(false);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('NotASuggestion');

    expect(await chipInput.getChips()).toEqual([]);
  });

  it('commits a matching suggestion (canonical casing) when allowCustomValue is false', async () => {
    hostComponent.allowCustomValue.set(false);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('angular');

    expect(await chipInput.getChips()).toEqual(['Angular']);
  });

  it('reflects the disabled state', async () => {
    hostComponent.disabled.set(true);
    const chipInput = await loader.getHarness(TnChipInputHarness);

    expect(await chipInput.isDisabled()).toBe(true);
  });
});

@Component({
  selector: 'tn-value-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-chip-input
      testId="groups"
      [formControl]="control"
      [options]="options()"
      [allowCustomValue]="false" />
  `,
})
class ValueHostComponent {
  control = new FormControl<number[]>([]);
  options = signal<TnChipInputOption<number>[]>([
    { label: 'Admins', value: 1 },
    { label: 'Users', value: 2 },
    { label: 'Guests', value: 3 },
  ]);
}

describe('TnChipInputComponent value mode', () => {
  let hostComponent: ValueHostComponent;
  let fixture: ComponentFixture<ValueHostComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValueHostComponent);
    hostComponent = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('displays option labels for written values', async () => {
    hostComponent.control.setValue([1, 3]);
    const chipInput = await loader.getHarness(TnChipInputHarness);

    expect(await chipInput.getChips()).toEqual(['Admins', 'Guests']);
  });

  it('commits the option value when its label is typed', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('Users');

    expect(await chipInput.getChips()).toEqual(['Users']);
    expect(hostComponent.control.value).toEqual([2]);
  });

  it('resolves a typed label case-insensitively to its value', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('admins');

    expect(hostComponent.control.value).toEqual([1]);
  });

  it('rejects a typed label that matches no option', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.addChip('Nope');

    expect(hostComponent.control.value).toEqual([]);
  });

  it('commits the value when a suggestion is picked', async () => {
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.selectSuggestion('Guests');

    expect(hostComponent.control.value).toEqual([3]);
  });

  it('excludes already-selected values from the suggestions', async () => {
    hostComponent.control.setValue([1]);
    const chipInput = await loader.getHarness(TnChipInputHarness);
    await chipInput.typeText('s');

    // Admins (value 1) is selected; only Users and Guests remain matching "s".
    expect(await chipInput.getSuggestions()).toEqual(['Users', 'Guests']);
  });
});

@Component({
  selector: 'tn-control-name-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <form [formGroup]="form">
      <tn-chip-input
        formControlName="isnsServers"
        [suggestions]="suggestions"
        [allowCustomValue]="true" />
    </form>
  `,
})
class ControlNameHostComponent {
  form = new FormGroup({ isnsServers: new FormControl<string[]>(['alpha']) });
  suggestions = ['bravo'];
}

@Component({
  selector: 'tn-explicit-test-id-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-chip-input testId="tags" formControlName="isnsServers" [allowCustomValue]="true" />
    </form>
  `,
})
class ExplicitTestIdHostComponent {
  form = new FormGroup({ isnsServers: new FormControl<string[]>([]) });
}

interface Group { id: string; }

@Component({
  selector: 'tn-object-value-test-id-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-chip-input formControlName="groups" [options]="options" [compareWith]="compareWith" />
    </form>
  `,
})
class ObjectValueTestIdHostComponent {
  options: TnChipInputOption<Group>[] = [{ label: 'Admins', value: { id: 'admins' } }];
  form = new FormGroup({ groups: new FormControl<Group[]>([{ id: 'admins' }]) });
  compareWith = (a: Group | null, b: Group | null): boolean => a?.id === b?.id;
}

@Component({
  selector: 'tn-labelled-primitive-value-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-chip-input testId="tags" formControlName="regions" [options]="options" />
    </form>
  `,
})
class LabelledPrimitiveValueHostComponent {
  options: TnChipInputOption<string>[] = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
  ];
  form = new FormGroup({ regions: new FormControl<string[]>(['us']) });
}

@Component({
  selector: 'tn-async-options-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-chip-input testId="tags" formControlName="regions" [options]="options" />
    </form>
  `,
})
class AsyncOptionsHostComponent {
  options: TnChipInputOption<string>[] = [];
  form = new FormGroup({ regions: new FormControl<string[]>(['us']) });
}

@Component({
  selector: 'tn-option-key-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <form [formGroup]="form">
      <tn-chip-input
        testId="users"
        formControlName="members"
        [options]="options"
        [optionTestIdKey]="keyFn" />
    </form>
  `,
})
class OptionTestIdKeyHostComponent {
  options: TnChipInputOption<string>[] = [
    { label: 'Jane Doe', value: 'u-1' },
    { label: 'Jane Doe', value: 'u-2' },
  ];
  keyFn = (option: TnChipInputOption<string>): string => option.value;
  form = new FormGroup({ members: new FormControl<string[]>(['u-1']) });
}

@Component({
  selector: 'tn-unnormalizable-label-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tn-chip-input testId="tags" formControlName="langs" [options]="options" />
    </form>
  `,
})
class UnnormalizableLabelHostComponent {
  options: TnChipInputOption<string>[] = [
    { label: '日本語', value: 'ja' },
    { label: '한국어', value: 'ko' },
  ];
  form = new FormGroup({ langs: new FormControl<string[]>(['ja']) });
}

@Component({
  selector: 'tn-unnormalizable-value-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <form [formGroup]="form">
      <tn-chip-input
        formControlName="hostsAllow"
        [suggestions]="suggestions"
        [allowCustomValue]="true" />
    </form>
  `,
})
class UnnormalizableValueHostComponent {
  form = new FormGroup({ hostsAllow: new FormControl<string[]>(['*', '**', 'alpha']) });
  suggestions = ['***'];
}

describe('TnChipInputComponent test ids', () => {
  const getInput = (fixture: ComponentFixture<unknown>): HTMLInputElement =>
    fixture.nativeElement.querySelector('.tn-chip-input__field') as HTMLInputElement;

  it('falls back to the bound control name when testId is unset', async () => {
    await TestBed.configureTestingModule({
      imports: [ControlNameHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ControlNameHostComponent);
    fixture.detectChanges();

    expect(getInput(fixture).getAttribute('data-testid')).toBe('chip-input-isns-servers');

    // tn-chip stamps the id on its inner button element, not the host.
    const chip = fixture.nativeElement.querySelector('.tn-chip-input__chip [role="button"]');
    expect(chip?.getAttribute('data-testid')).toBe('chip-isns-servers-alpha');

    // Suggestions are portaled into a CDK overlay on the document root.
    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(TnChipInputHarness)).typeText('bra');
    const suggestion = document.querySelector('.tn-chip-input__option');
    expect(suggestion?.getAttribute('data-testid')).toBe('option-isns-servers-bravo');
  });

  it('prefers an explicit testId over the bound control name', async () => {
    await TestBed.configureTestingModule({
      imports: [ExplicitTestIdHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExplicitTestIdHostComponent);
    fixture.detectChanges();

    expect(getInput(fixture).getAttribute('data-testid')).toBe('chip-input-tags');
  });

  // Stringifying an object value would stamp `chip-groups-object-object` on every
  // chip — duplicate ids that break automation harder than a missing attribute.
  it('discriminates object-valued chips by their label', async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectValueTestIdHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ObjectValueTestIdHostComponent);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.tn-chip-input__chip [role="button"]');
    expect(chip?.getAttribute('data-testid')).toBe('chip-groups-admins');
  });
  // A chip and the suggestion row that created it show the same text, so they carry the
  // same discriminator — naming one by the label and the other by the value would leave
  // automation unable to assert that the row it clicked is the chip it got.
  it('names a chip and its suggestion by the option label, not the value behind it', async () => {
    await TestBed.configureTestingModule({
      imports: [LabelledPrimitiveValueHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(LabelledPrimitiveValueHostComponent);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.tn-chip-input__chip [role="button"]');
    expect(chip?.getAttribute('data-testid')).toBe('chip-tags-united-states');

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(TnChipInputHarness)).typeText('can');
    const suggestion = document.querySelector('.tn-chip-input__option');
    expect(suggestion?.getAttribute('data-testid')).toBe('option-tags-canada');
  });

  // A pre-populated control renders its chips before an async `[options]` load resolves,
  // so the chip is named by its own value until the option that explains it arrives.
  it('names an option-backed chip by its value until the options load', async () => {
    await TestBed.configureTestingModule({
      imports: [AsyncOptionsHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AsyncOptionsHostComponent);
    fixture.detectChanges();

    const chipId = (): string | null | undefined => fixture.nativeElement
      .querySelector('.tn-chip-input__chip [role="button"]')
      ?.getAttribute('data-testid');
    expect(chipId()).toBe('chip-tags-us');

    fixture.componentInstance.options = [{ label: 'United States', value: 'us' }];
    fixture.detectChanges();
    expect(chipId()).toBe('chip-tags-united-states');
  });

  // Two records can share a display name, and the label default then stamps one id on
  // both; the extractor is the way out, and it has to reach the chip as well as the row
  // or the pair stops agreeing.
  it('lets optionTestIdKey pick the discriminator for both a chip and its suggestion', async () => {
    await TestBed.configureTestingModule({
      imports: [OptionTestIdKeyHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(OptionTestIdKeyHostComponent);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.tn-chip-input__chip [role="button"]');
    expect(chip?.getAttribute('data-testid')).toBe('chip-users-u-1');

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(TnChipInputHarness)).typeText('Jane');
    const suggestion = document.querySelector('.tn-chip-input__option');
    expect(suggestion?.getAttribute('data-testid')).toBe('option-users-u-2');
  });

  // A localized label normalizes to nothing, so keying off it would collapse every such
  // row onto the bare base — the value behind it stands in, and the chip still agrees
  // with its suggestion row.
  it('falls back to the value when the option label normalizes away', async () => {
    await TestBed.configureTestingModule({
      imports: [UnnormalizableLabelHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnnormalizableLabelHostComponent);
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('.tn-chip-input__chip [role="button"]');
    expect(chip?.getAttribute('data-testid')).toBe('chip-tags-ja');

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(TnChipInputHarness)).typeText('한국');
    const suggestion = document.querySelector('.tn-chip-input__option');
    expect(suggestion?.getAttribute('data-testid')).toBe('option-tags-ko');
  });

  // `*` and `**` both normalize to nothing, so scoping them under the base composes
  // the bare `chip-hosts-allow` twice — duplicate ids, the failure the object-value
  // path already guards against, reached through a primitive value instead.
  it('omits the id for chips whose value normalizes away, rather than duplicating the base', async () => {
    await TestBed.configureTestingModule({
      imports: [UnnormalizableValueHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnnormalizableValueHostComponent);
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.tn-chip-input__chip [role="button"]'),
    ) as HTMLElement[];
    expect(chips.map((chip) => chip.getAttribute('data-testid')))
      .toEqual([null, null, 'chip-hosts-allow-alpha']);

    // The field itself keeps its id — only the indistinguishable chips go without.
    expect(getInput(fixture).getAttribute('data-testid')).toBe('chip-input-hosts-allow');
  });

  it('omits the id for a suggestion row whose value normalizes away', async () => {
    await TestBed.configureTestingModule({
      imports: [UnnormalizableValueHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnnormalizableValueHostComponent);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    await (await loader.getHarness(TnChipInputHarness)).typeText('*');

    const suggestion = document.querySelector('.tn-chip-input__option');
    expect(suggestion).not.toBeNull();
    expect(suggestion?.getAttribute('data-testid')).toBeNull();
  });
});
