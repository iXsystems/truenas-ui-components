import { signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { Observable } from 'rxjs';
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
          'An editable, multi-value chip input — tokenized entry where typed text becomes '
          + 'removable `tn-chip`s alongside an inline field. A `ControlValueAccessor` over '
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
    allowCustomValue: { control: 'boolean', description: 'Allow free text not in the suggestion list (off = pick-from-list)' },
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

/**
 * **Pick from list (`allowCustomValue=false`).** Only values from `suggestions`
 * can be committed — typing something off-list and pressing Enter discards it; a
 * matching entry commits with the suggestion's canonical casing.
 */
export const RestrictedToSuggestions: Story = {
  render: () => ({
    props: { control: new FormControl<string[]>([]), suggestions: frameworks },
    template: `
      <tn-form-field label="Frameworks" hint="Choose from the list — custom values are rejected">
        <tn-chip-input
          [formControl]="control"
          [suggestions]="suggestions"
          [allowCustomValue]="false"
          placeholder="Pick a framework…" />
      </tn-form-field>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
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

/**
 * **The same suggestions, as a `[dataSource]`.** Binding a `(query, page)`
 * function replaces the story above's subject-and-timer entirely: the component
 * owns the debounce, cancels the in-flight request when the term changes, and
 * recovers from a failure without the field going dead. Unlike the hand-rolled
 * version it also primes on focus, so an empty field already shows the first
 * page rather than waiting for a keystroke.
 *
 * The chip dropdown is not paged, so `page` is always 0 — the parameter exists
 * only so one source function can feed this and `tn-autocomplete` alike.
 *
 * The 350 ms latency is deliberate: it makes the in-flight state visible. While
 * a lookup is out, the panel keeps showing the previous term's rows — a
 * `dataSource` is trusted to have applied the query, so they are not re-filtered
 * on the label — and says so with a spinner row and `aria-busy` on the listbox.
 *
 * Every fourth lookup fails on purpose, to show the field stays usable.
 */
export const DataSource: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string[]>([]);
      const lastError = signal<string | null>(null);
      let lookups = 0;
      const all = [
        'JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Kotlin',
        'Swift', 'Ruby', 'Scala', 'Elixir', 'Haskell', 'Clojure', 'C#', 'C++',
        'Dart', 'Lua', 'Perl', 'PHP', 'Zig',
      ];

      return {
        control,
        lastError,
        languages: (query: string) => new Observable<{ label: string; value: string }[]>((subscriber) => {
          lookups++;
          const timer = setTimeout(() => {
            if (lookups % 4 === 0) {
              subscriber.error(new Error(`Lookup failed for "${query}"`));
              return;
            }
            const term = query.trim().toLowerCase();
            subscriber.next(
              all.filter((name) => name.toLowerCase().includes(term))
                .map((name) => ({ label: name, value: name })),
            );
            subscriber.complete();
          }, 350);
          return () => clearTimeout(timer);
        }),
        onError: (error: unknown) => lastError.set((error as Error).message),
      };
    })(),
    template: `
      <tn-form-field label="Languages" hint="Focus to see the first page; every fourth lookup fails">
        <tn-chip-input
          [formControl]="control"
          [dataSource]="languages"
          placeholder="Search languages…"
          (dataSourceError)="onError($event)" />
      </tn-form-field>
      @if (lastError()) {
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">Last error: <code>{{ lastError() }}</code></p>
      }
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, ReactiveFormsModule] },
  }),
  parameters: { controls: { disable: true } },
};

/**
 * **Value mode (`[options]`).** Chips display each option's `label` while the
 * form control holds its `value` — here, group names are shown but numeric ids
 * are committed. A written value resolves back to its label; pair with
 * `[compareWith]` when values are objects. `allowCustomValue=false` keeps the
 * field restricted to the option list.
 */
export const ValueMode: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<number[]>([1]);
      const committed = signal<number[]>(control.value ?? []);
      control.valueChanges.subscribe((value) => committed.set(value ?? []));
      return {
        control,
        committed,
        options: [
          { label: 'Administrators', value: 1 },
          { label: 'Users', value: 2 },
          { label: 'Guests', value: 3 },
          { label: 'Operators', value: 4 },
        ],
      };
    })(),
    template: `
      <tn-form-field label="Groups" hint="Shows names, commits ids">
        <tn-chip-input
          [formControl]="control"
          [options]="options"
          [allowCustomValue]="false"
          placeholder="Add a group…" />
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ committed() | json }}</code></p>
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
 * **Test IDs.** The field emits `chip-input-<base>`; chips and suggestion rows are
 * scoped beneath it by the text they show — `chip-<base>-<label>` and
 * `option-<base>-<label>`, falling back to the value for a free-text chip.
 * `testId="tags"` → `chip-input-tags`, under `data-testid` (default) /
 * `data-test`. With no `testId`, the base falls back to the bound control name,
 * so `formControlName="isnsServers"` → `chip-input-isns-servers`; a control-less
 * input with no `testId` emits nothing. The second field below takes that path —
 * its field, chips and suggestion rows are all named from the control.
 *
 * A discriminator that normalizes to nothing (`*`, `**`, a CJK-only tag) would
 * collapse a chip's id back to the bare base. An option-backed chip falls back to
 * the value behind the label there; a chip with nothing else to be named by stays
 * attribute-free rather than sharing one id.
 *
 * Where two options share a display name, or ids must survive a locale change,
 * `[optionTestIdKey]="(o) => o.value.id"` picks the discriminator instead — for
 * the chip and its suggestion row alike.
 */
export const TestIds: Story = {
  render: () => ({
    props: {
      control: new FormControl<string[]>(['one']),
      // The second field is deliberately testId-less: the inspector reads ids live, so
      // the control-name fallback is demonstrated rather than only described above.
      form: new FormGroup({ isnsServers: new FormControl<string[]>(['10.0.0.1']) }),
    },
    template: `
      <tn-testid-inspector>
        <tn-chip-input [formControl]="control" testId="tags" placeholder="Add a tag" />
        <form [formGroup]="form">
          <tn-chip-input formControlName="isnsServers" placeholder="Add a server" />
        </form>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnChipInputComponent, TestIdInspectorComponent, ReactiveFormsModule] },
  }),
};
