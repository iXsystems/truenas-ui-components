import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnChipInputComponent } from '../lib/chip-input/chip-input.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const harnessDoc = loadHarnessDoc('chip-input');

const frameworks = ['React', 'Vue', 'Svelte', 'Angular', 'Solid', 'Qwik', 'Node.js', 'Deno'];

const meta: Meta<TnChipInputComponent> = {
  title: 'Components/Chip Input',
  component: TnChipInputComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      story: { height: '320px' },
      description: {
        component:
          'An editable, multi-value chip input — the composite Material\'s `mat-chip-grid` '
          + 'provided, built from `tn-chip`s plus an inline field. A `ControlValueAccessor` over '
          + '`string[]`; commits on Enter (or a configurable separator), removes the last chip on '
          + 'Backspace, and offers optional (static or async) suggestions in a dropdown.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder for the empty field' },
    disabled: { control: 'boolean', description: 'Disables the whole control' },
    addOnBlur: { control: 'boolean', description: 'Commit a pending value when the field loses focus' },
    allowDuplicates: { control: 'boolean', description: 'Allow the same value to be added more than once' },
    maxChips: { control: 'number', description: 'Maximum number of chips (undefined = no limit)' },
    chipAdded: { action: 'chipAdded' },
    chipRemoved: { action: 'chipRemoved' },
    searchChange: { action: 'searchChange' },
  },
};

export default meta;
type Story = StoryObj<TnChipInputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: (() => {
      const control = new FormControl<string[]>(['TypeScript', 'Angular']);
      const committed = signal<string[]>(control.value ?? []);
      control.valueChanges.subscribe((value) => committed.set(value ?? []));
      return { ...args, control, committed, suggestions: frameworks };
    })(),
    template: `
      <tn-form-field
        label="Skills and Technologies"
        hint="Type a skill and press Enter, or pick from the suggestions">
        <tn-chip-input
          [formControl]="control"
          [suggestions]="suggestions"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [addOnBlur]="addOnBlur"
          [allowDuplicates]="allowDuplicates"
          [maxChips]="maxChips"
          (chipAdded)="chipAdded($event)"
          (chipRemoved)="chipRemoved($event)"
          (searchChange)="searchChange($event)" />
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">Value: <code>{{ committed() | json }}</code></p>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    placeholder: 'Add a skill…',
    disabled: false,
    addOnBlur: false,
    allowDuplicates: false,
  },
};

/** No suggestion list — a free-form tag entry that accepts any typed value. */
export const FreeFormTags: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['alpha', 'beta']) },
    template: `
      <tn-form-field label="Tags" hint="Type anything and press Enter">
        <tn-chip-input [formControl]="control" placeholder="Add a tag…" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

export const Disabled: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>({ value: ['locked', 'readonly'], disabled: true }) },
    template: `
      <tn-form-field label="Tags (disabled)">
        <tn-chip-input [formControl]="control" placeholder="Cannot interact" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

/** `maxChips` caps the list; the suggestion dropdown stays closed once the cap is hit. */
export const MaxChips: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['one', 'two']), suggestions: frameworks },
    template: `
      <tn-form-field label="Up to 3 chips" hint="Adding is blocked at the cap">
        <tn-chip-input [formControl]="control" [suggestions]="suggestions" [maxChips]="3" placeholder="Add…" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

/** Commit a pending value on blur, not just on Enter. */
export const AddOnBlur: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]) },
    template: `
      <tn-form-field label="Add on blur" hint="Type a value then click away — it is committed">
        <tn-chip-input [formControl]="control" [addOnBlur]="true" placeholder="Type then blur…" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

/** Commit on space or comma as well as Enter — handy for token-style entry. */
export const CustomSeparators: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]), separators: ['Enter', ',', ' '] },
    template: `
      <tn-form-field label="Space or comma separated" hint="Press space, comma, or Enter to commit">
        <tn-chip-input [formControl]="control" [separatorKeys]="separators" placeholder="word word word…" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Async suggestions.** Listen to `(searchChange)`, fetch, then update
 * `[suggestions]`. The panel re-opens itself when results land while the field
 * is focused. This story simulates a ~350 ms backend over a list of languages —
 * type any letter (e.g. `a`, `s`, `ty`) and matches appear after a short delay.
 */
export const AsyncSuggestions: Story = {
  render: () => ({
    props: (() => {
      const suggestions = signal<string[]>([]);
      const control = new FormControl<string[]>([]);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const all = [
        'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Kotlin',
        'Swift', 'Ruby', 'Scala', 'Elixir', 'Haskell', 'Clojure', 'C#', 'C++',
        'Dart', 'Lua', 'Perl', 'PHP', 'Zig',
      ];
      return {
        suggestions,
        control,
        onSearch: (term: string) => {
          clearTimeout(timer);
          const query = term.trim().toLowerCase();
          if (!query) {
            suggestions.set([]);
            return;
          }
          timer = setTimeout(() => {
            suggestions.set(all.filter((name) => name.toLowerCase().includes(query)));
          }, 350);
        },
      };
    })(),
    template: `
      <tn-form-field label="Languages" hint="Type to search — results arrive asynchronously">
        <tn-chip-input
          [formControl]="control"
          [suggestions]="suggestions()"
          placeholder="Search languages…"
          (searchChange)="onSearch($event)" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: { hidden: true, sourceState: 'none' },
      description: { story: harnessDoc || '' },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};

/**
 * **Test IDs.** The field emits `chip-input-<base>`; each chip and suggestion is
 * scoped beneath it (`option-<base>-<value>`). `testId="tags"` →
 * `chip-input-tags`, under `data-testid` (default) / `data-test`.
 */
export const TestIds: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>(['one']) },
    template: `
      <tn-testid-inspector>
        <tn-chip-input [formControl]="control" testId="tags" placeholder="Add a tag" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnChipInputComponent, TestIdInspectorComponent, ReactiveFormsModule] },
  }),
};
