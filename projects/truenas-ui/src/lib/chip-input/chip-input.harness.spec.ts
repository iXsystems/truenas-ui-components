import { TestKey } from '@angular/cdk/testing';
import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnChipInputComponent } from './chip-input.component';
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
