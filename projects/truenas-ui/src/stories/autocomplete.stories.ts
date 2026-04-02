import type { Meta, StoryObj } from '@storybook/angular';
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

const displayCountry = (country: Country): string => country.name;

const simpleOptions = [
  'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry',
  'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon',
  'Mango', 'Nectarine', 'Orange', 'Papaya', 'Quince',
];

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
      description: 'Maximum number of options to render',
    },
    optionSelected: { action: 'optionSelected' },
  },
};

export default meta;
type Story = StoryObj<TnAutocompleteComponent<unknown>>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: simpleOptions,
    },
    template: `
      <tn-form-field
        label="Favorite fruit"
        hint="Start typing to search">
        <tn-autocomplete
          [options]="options"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [requireSelection]="requireSelection"
          [noResultsText]="noResultsText"
          [maxResults]="maxResults"
          (optionSelected)="optionSelected($event)">
        </tn-autocomplete>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    placeholder: 'Type to search fruits...',
    disabled: false,
    requireSelection: false,
    noResultsText: 'No fruits found',
    maxResults: 100,
  },
};

export const WithDisplayWith: Story = {
  render: (args) => ({
    props: {
      ...args,
      countries,
      displayCountry,
    },
    template: `
      <tn-form-field
        label="Country"
        hint="Search by country name"
        [required]="true">
        <tn-autocomplete
          [options]="countries"
          [displayWith]="displayCountry"
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
      countries,
      displayCountry,
      startsWithFilter: (option: Country, term: string) =>
        option.name.toLowerCase().startsWith(term.toLowerCase()),
    },
    template: `
      <tn-form-field
        label="Country (starts-with filter)"
        hint="Only matches from the beginning of the name">
        <tn-autocomplete
          [options]="countries"
          [displayWith]="displayCountry"
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
