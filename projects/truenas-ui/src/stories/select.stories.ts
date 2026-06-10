import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import type { TnSelectOption, TnSelectOptionGroup } from '../lib/select/select.component';
import { TnSelectComponent } from '../lib/select/select.component';

// Load harness documentation
const harnessDoc = loadHarnessDoc('select');

const meta: Meta<TnSelectComponent> = {
  title: 'Components/Select',
  component: TnSelectComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        height: '300px',
      },
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of select options',
    },
    optionGroups: {
      control: 'object',
      description: 'Array of option groups with labels and nested options',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    allowEmpty: {
      control: 'boolean',
      description: 'Prepends an empty option that clears the selection (single mode only)',
    },
    emptyLabel: {
      control: 'text',
      description: 'Label of the empty option shown when allowEmpty is set',
    },
    testId: {
      control: 'text',
      description: 'Test ID for the select component',
    },
    selectionChange: { action: 'selectionChange' },
  },
};

export default meta;
type Story = StoryObj<TnSelectComponent>;

const defaultOptions: TnSelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4', disabled: true },
  { value: 'option5', label: 'Option 5' },
];

const fruitOptions: TnSelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'strawberry', label: 'Strawberry' },
];

const animalGroups: TnSelectOptionGroup[] = [
  {
    label: 'Mammals',
    options: [
      { value: 'dog', label: 'Dog' },
      { value: 'cat', label: 'Cat' },
      { value: 'elephant', label: 'Elephant' },
      { value: 'whale', label: 'Whale' },
    ]
  },
  {
    label: 'Birds',
    options: [
      { value: 'eagle', label: 'Eagle' },
      { value: 'penguin', label: 'Penguin' },
      { value: 'parrot', label: 'Parrot' },
    ]
  },
  {
    label: 'Reptiles',
    options: [
      { value: 'snake', label: 'Snake' },
      { value: 'lizard', label: 'Lizard' },
      { value: 'turtle', label: 'Turtle' },
    ]
  }
];

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {
      }
    },
    template: `
      <tn-form-field 
        label="Choose an option"
        hint="Select from the available options"
        [required]="required">
        <tn-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: defaultOptions,
    optionGroups: [],
    placeholder: 'Select an option',
    disabled: false,
  },
};

export const WithOptionGroups: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {
      }
    },
    template: `
      <tn-form-field 
        label="Choose an animal"
        hint="Select from the categorized options">
        <tn-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: [],
    optionGroups: animalGroups,
    placeholder: 'Select an animal',
    disabled: false,
  },
};

export const MixedOptionsAndGroups: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {
      }
    },
    template: `
      <tn-form-field 
        label="Choose your favorite"
        hint="Mix of individual options and grouped options">
        <tn-select
          [options]="options"
          [optionGroups]="optionGroups"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: fruitOptions,
    optionGroups: animalGroups,
    placeholder: 'Select your favorite',
    disabled: false,
  },
};

export const MultipleSelection: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {
      }
    },
    template: `
      <tn-form-field
        label="Select fruits"
        hint="You can select multiple options">
        <tn-select
          placeholder="Choose fruits"
          [options]="options"
          [multiple]="true"
          (multiSelectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: fruitOptions,
  },
};

export const MultipleWithGroups: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {
      }
    },
    template: `
      <tn-form-field
        label="Select animals"
        hint="Choose one or more from each category">
        <tn-select
          placeholder="Choose animals"
          [optionGroups]="optionGroups"
          [multiple]="true"
          (multiSelectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    optionGroups: animalGroups,
  },
};

// Object values demand a custom comparator — the built-in fallback uses
// JSON.stringify, which is key-order dependent and can produce false negatives.
interface AnimalValue {
  id: number;
  species: string;
}

const animalObjectOptions: TnSelectOption<AnimalValue>[] = [
  { value: { id: 1, species: 'dog' }, label: 'Dog' },
  { value: { id: 2, species: 'cat' }, label: 'Cat' },
  { value: { id: 3, species: 'parrot' }, label: 'Parrot' },
];

export const CustomCompareWith: Story = {
  render: (args) => ({
    props: {
      ...args,
      // Compare object values by `id` so selections survive reference changes
      // (a fresh fetch returns new object identities for the same logical row).
      compareById: (a: AnimalValue | null, b: AnimalValue | null) => a?.id === b?.id,
      logSelection: (_value: unknown) => {},
    },
    template: `
      <tn-form-field
        label="Choose an animal"
        hint="Option values are objects — compareWith matches them by id">
        <tn-select
          [options]="options"
          [compareWith]="compareById"
          placeholder="Pick an animal"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: animalObjectOptions,
  },
};

// Spacer pushes the trigger near the bottom of the viewport so the dropdown's
// flip-up heuristic kicks in. Resize the docs canvas to see the effect.
export const FlipUpDropdown: Story = {
  parameters: {
    docs: { story: { height: '500px' } },
  },
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {},
    },
    template: `
      <div style="height: 440px;"></div>
      <tn-form-field
        label="Page size"
        hint="Trigger sits near the viewport bottom — the dropdown opens upward">
        <tn-select
          [options]="options"
          placeholder="Choose a page size"
          ariaLabel="Items per page"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: [10, 20, 50, 100].map((n) => ({ value: n, label: String(n) })),
  },
};

export const EmptyWithCustomMessage: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {},
    },
    template: `
      <tn-form-field
        label="Filter results"
        hint="No options are available — the dropdown shows the custom message">
        <tn-select
          [options]="[]"
          placeholder="No filters configured"
          noOptionsLabel="No filters match your query"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
};

/**
 * `allowEmpty` prepends a synthetic empty option (`--` by default, override
 * with `emptyLabel`) so users can unset a chosen value. Picking it resets the
 * field to the placeholder and emits `null` via `selectionChange` / the bound
 * form control. Ignored in `multiple` mode.
 */
export const ClearableWithAllowEmpty: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {},
    },
    template: `
      <tn-form-field
        label="Choose a fruit"
        hint="Pick the -- option to clear the selection">
        <tn-select
          [options]="options"
          [allowEmpty]="allowEmpty"
          [emptyLabel]="emptyLabel"
          [placeholder]="placeholder"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: fruitOptions,
    allowEmpty: true,
    emptyLabel: '--',
    placeholder: 'No fruit selected',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // Select a value, then clear it through the empty option.
    await userEvent.click(trigger);
    const banana = await waitFor(() => {
      const option = document.querySelector('[data-testid="option-banana"]');
      if (!option) {throw new Error('option not rendered yet');}
      return option as HTMLElement;
    });
    await userEvent.click(banana);
    await waitFor(() => expect(trigger.textContent?.trim()).toContain('Banana'));

    await userEvent.click(trigger);
    const empty = await waitFor(() => {
      const option = document.querySelector('[data-testid="option-empty"]');
      if (!option) {throw new Error('empty option not rendered yet');}
      return option as HTMLElement;
    });
    await userEvent.click(empty);
    await waitFor(() => expect(trigger.textContent?.trim()).toContain('No fruit selected'));
  },
};

export const KeyboardNavigation: Story = {
  render: (args) => ({
    props: {
      ...args,
      logSelection: (_value: unknown) => {},
    },
    template: `
      <tn-form-field
        label="Choose a fruit"
        hint="Open with the keyboard (Enter / ArrowDown), navigate with arrows, select with Enter">
        <tn-select
          [options]="options"
          placeholder="Pick one"
          (selectionChange)="logSelection($event)">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    options: fruitOptions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'));

    // Opening the dropdown should expose the focused option to AT.
    await waitFor(() => expect(trigger.getAttribute('aria-activedescendant')).not.toBeNull());

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('false'));

    // Trigger now displays the third option's label.
    await expect(trigger.textContent?.trim()).toContain('Orange');
  },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      story: { height: 'auto' },
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};

/**
 * **Test IDs.** The select **trigger** (the `role="combobox"` element) emits
 * `select-<base>` — shown live in the table below. Each **option** lives in a
 * portaled overlay (so it's not in the table until the dropdown is open) and
 * emits `option-<base>-<value>`:
 *
 * | Element | Emitted id (base `disk-type`) |
 * |---|---|
 * | trigger | `select-disk-type` |
 * | option (value `ssd`) | `option-disk-type-ssd` |
 * | option (value `hdd`) | `option-disk-type-hdd` |
 *
 * The option discriminator defaults to the option's `value` (else `label`);
 * override it with `[optionTestIdKey]="(o) => o.value.id"`. Under `data-testid`
 * by default / `data-test`. Open the dropdown to see the option ids in the DOM.
 */
export const TestIds: Story = {
  render: () => ({
    props: {
      options: [
        { value: 'ssd', label: 'SSD' },
        { value: 'hdd', label: 'Spinning Disk' },
      ] as TnSelectOption[],
    },
    template: `
      <tn-testid-inspector>
        <tn-select testId="disk-type" [options]="options" placeholder="Select a disk type" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnSelectComponent, TestIdInspectorComponent] },
  }),
};

