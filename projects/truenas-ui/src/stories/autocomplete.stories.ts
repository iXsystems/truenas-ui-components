import { signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnAutocompleteComponent } from '../lib/autocomplete/autocomplete.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const harnessDoc = loadHarnessDoc('autocomplete');

interface Country {
  code: string;
  name: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
];

const countryOptions = countries.map((country) => ({ label: country.name, value: country.code }));

const simpleFruits = [
  'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry',
  'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon',
  'Mango', 'Nectarine', 'Orange', 'Papaya', 'Quince',
];

const simpleOptions = simpleFruits.map((fruit) => ({ label: fruit, value: fruit }));

const manyOptions = Array.from(
  { length: 150 },
  (_, i) => {
    const name = `Option ${String(i + 1).padStart(3, '0')}`;
    return { label: name, value: name };
  }
);

const meta: Meta<TnAutocompleteComponent<unknown>> = {
  title: 'Components/Autocomplete',
  component: TnAutocompleteComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        height: '350px',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the autocomplete is disabled',
    },
    requireSelection: {
      control: 'boolean',
      description: 'Require the user to select from the dropdown',
    },
    noResultsText: {
      control: 'text',
      description: 'Text shown when no options match',
    },
    maxResults: {
      control: 'number',
      description: 'Maximum number of options to render (defaults to Infinity)',
    },
    panelMaxHeight: {
      control: 'text',
      description:
        'Max height of the dropdown panel before it scrolls (number = px, or any CSS length)',
    },
    loading: {
      control: 'boolean',
      description: 'Show a loading row in the panel while options are being fetched',
    },
    loadingText: {
      control: 'text',
      description: 'Text shown next to the spinner while loading',
    },
    allowCustomValue: {
      control: 'boolean',
      description: 'Commit unmatched free text as the value on blur or Enter',
    },
    optionSelected: { action: 'optionSelected' },
    searchChange: { action: 'searchChange' },
    loadMore: { action: 'loadMore' },
    opened: { action: 'opened' },
  },
};

export default meta;
type Story = StoryObj<TnAutocompleteComponent<unknown>>;

export const Default: Story = {
  render: (args) => ({
    // The committed value lives on the form control (custom commits flow
    // through the CVA, not optionSelected) — bind one and mirror it into a
    // signal so the story can show what actually landed.
    props: (() => {
      const control = new FormControl<string | null>(null);
      const committed = signal<string | null>(control.value);
      control.valueChanges.subscribe((value) => committed.set(value));
      return {
        ...args,
        options: simpleOptions,
        control,
        committed,
      };
    })(),
    template: `
      <tn-form-field
        label="Favorite fruit"
        hint="Start typing to search">
        <tn-autocomplete
          [options]="options"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [requireSelection]="requireSelection"
          [allowCustomValue]="allowCustomValue"
          [loading]="loading"
          [loadingText]="loadingText"
          [noResultsText]="noResultsText"
          [maxResults]="maxResults"
          [formControl]="control"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
      @if (committed() !== null) {
        <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ committed() }}</code></p>
      }
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    placeholder: 'Type to search fruits...',
    disabled: false,
    requireSelection: false,
    allowCustomValue: false,
    loading: false,
    loadingText: 'Loading...',
    noResultsText: 'No fruits found',
    maxResults: 100,
  },
};

export const LabelValuePairs: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: countryOptions,
    },
    template: `
      <tn-form-field
        label="Country"
        hint="Displays the name, commits the ISO code"
        [required]="true">
        <tn-autocomplete
          [options]="options"
          [placeholder]="placeholder"
          [requireSelection]="requireSelection"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    placeholder: 'Type to search countries...',
    requireSelection: true,
  },
};

/**
 * **Disabled options.** Options carrying `disabled: true` stay visible but are
 * non-selectable — dimmed, skipped by keyboard navigation, and ignored by
 * click and text-match commits.
 */
export const DisabledOptions: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleFruits.map((fruit, i) => ({
        label: fruit,
        value: fruit,
        disabled: i % 3 === 1,
      })),
    },
    template: `
      <tn-form-field
        label="Fruit"
        hint="Every third fruit is unavailable">
        <tn-autocomplete
          [options]="options"
          placeholder="Type to search fruits..."
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  parameters: {
    controls: { disable: true },
  },
};

export const RequireSelection: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleOptions,
    },
    template: `
      <tn-form-field
        label="Fruit (required selection)"
        hint="Must pick from the list — invalid input reverts on blur">
        <tn-autocomplete
          [options]="options"
          [placeholder]="placeholder"
          [requireSelection]="true"
          [noResultsText]="noResultsText"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    placeholder: 'Type to search...',
    noResultsText: 'No match — selection required',
  },
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleOptions,
    },
    template: `
      <tn-form-field label="Fruit (disabled)">
        <tn-autocomplete
          [options]="options"
          placeholder="Cannot interact"
          [disabled]="true">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
};

export const CustomFilter: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: countryOptions,
      startsWithFilter: (option: { label: string }, term: string) =>
        option.label.toLowerCase().startsWith(term.toLowerCase()),
    },
    template: `
      <tn-form-field
        label="Country (starts-with filter)"
        hint="Only matches from the beginning of the name">
        <tn-autocomplete
          [options]="options"
          [filterFn]="startsWithFilter"
          placeholder="Type to search..."
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
};

export const MaxResults: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleOptions,
    },
    template: `
      <tn-form-field
        label="Fruit (max 3 results)"
        hint="Dropdown limited to 3 options at a time">
        <tn-autocomplete
          [options]="options"
          placeholder="Type to search..."
          [maxResults]="3"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
};

export const LongList: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: manyOptions,
    },
    template: `
      <tn-form-field
        label="Item (150 options)"
        hint="Open without typing — every option renders and the panel scrolls">
        <tn-autocomplete
          [options]="options"
          [placeholder]="placeholder"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    placeholder: 'Type or scroll through 150 options...',
  },
};

/**
 * **CVA round-tripping with written values.** The bound `FormControl` starts at
 * `'DE'`, so the input renders "Germany" on load: a written value resolves
 * back to its option's label (falling back to the raw value until options
 * load), and selections commit the option's `value`.
 */
export const ValueMapping: Story = {
  render: () => ({
    props: (() => {
      const control = new FormControl<string | null>('DE');
      const committed = signal<string | null>(control.value);
      control.valueChanges.subscribe((value) => committed.set(value));
      return {
        options: countryOptions,
        control,
        committed,
      };
    })(),
    template: `
      <tn-form-field label="Country" hint="Commits the ISO code, displays the name">
        <tn-autocomplete
          [options]="options"
          [requireSelection]="true"
          [formControl]="control"
          placeholder="Type to search countries...">
        </tn-autocomplete>
      </tn-form-field>
      <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ committed() }}</code></p>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  parameters: {
    controls: { disable: true },
  },
};

/**
 * **Server-driven options with pagination and custom values.** The component
 * emits `opened` when the panel opens (prime the first page before any typing),
 * `searchChange` as the user types, and `loadMore` when the open panel is
 * scrolled to the bottom; the consumer fetches and updates `[options]`, holding
 * `[loading]` while a request is in flight. `[filterFn]` returns `true` because
 * the server already filtered the page. `allowCustomValue` commits free text
 * (e.g. \`/my-custom-port\`) as the value on blur or Enter — for pickers where
 * known entries are suggested but any value is acceptable.
 *
 * This story simulates a 600 ms backend with 100 entries served in pages of 20.
 */
export const AsyncOptions: Story = {
  render: () => ({
    // Signal-driven so async mutations render under zoneless change detection.
    props: (() => {
      const options = signal<{ label: string; value: string }[]>([]);
      const loading = signal(false);
      const value = signal<string | null>(null);
      let term = '';
      let page = 0;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const fetchPage = (newTerm: string, newPage: number) => {
        term = newTerm;
        page = newPage;
        loading.set(true);
        clearTimeout(timer);
        timer = setTimeout(() => {
          const all = Array.from({ length: 100 }, (unused, i) => `device-${String(i).padStart(3, '0')}`);
          const matches = all.filter((name) => name.includes(term));
          options.set(matches.slice(0, (page + 1) * 20).map((name) => ({ label: name, value: name })));
          loading.set(false);
        }, 600);
      };

      // Custom commits flow through the CVA (onChange), not optionSelected —
      // bind a real FormControl so they are observable in the story.
      const control = new FormControl<string | null>(null);
      control.valueChanges.subscribe((committed) => value.set(committed));

      return {
        options,
        loading,
        value,
        control,
        passthroughFilter: () => true,
        onOpened: () => {
          // Click-to-suggest: prime the first page before the user types.
          if (options().length === 0 && !loading()) {
            fetchPage(term, 0);
          }
        },
        onSearch: (newTerm: string) => fetchPage(newTerm, 0),
        onLoadMore: () => fetchPage(term, page + 1),
      };
    })(),
    template: `
      <tn-form-field
        label="Port or Hostname"
        hint="Pick a detected device or type a custom path (committed on blur or Enter)">
        <tn-autocomplete
          [options]="options()"
          [loading]="loading()"
          [allowCustomValue]="true"
          [filterFn]="passthroughFilter"
          [formControl]="control"
          placeholder="Type to search devices..."
          (opened)="onOpened()"
          (searchChange)="onSearch($event)"
          (loadMore)="onLoadMore()">
        </tn-autocomplete>
      </tn-form-field>
      @if (value()) {
        <p style="margin-top: 1rem; font-size: 0.875rem;">Committed value: <code>{{ value() }}</code></p>
      }
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  parameters: {
    controls: { disable: true },
  },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: {
        hidden: true,
        sourceState: 'none',
      },
      description: {
        story: harnessDoc || '',
      },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};

/**
 * **Test IDs.** The autocomplete **input** (`role="combobox"`) emits
 * `autocomplete-<base>` — shown live in the table. Suggestion options render in
 * a portaled overlay while typing. `testId="country"` → `autocomplete-country`,
 * under `data-testid` (default) / `data-test`.
 */
export const TestIds: Story = {
  render: () => ({
    template: `
      <tn-testid-inspector>
        <tn-autocomplete testId="country" placeholder="Search countries" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnAutocompleteComponent, TestIdInspectorComponent] },
  }),
};
