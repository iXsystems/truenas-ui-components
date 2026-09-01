import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnCheckboxGroupComponent } from '../lib/checkbox/checkbox-group.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const harnessDoc = loadHarnessDoc('checkbox-group');

const trainOptions = [
  { value: 'stable', label: 'Stable' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'community', label: 'Community' },
  { value: 'test', label: 'Test', disabled: true },
];

const meta: Meta<TnCheckboxGroupComponent> = {
  title: 'Components/Checkbox Group',
  component: TnCheckboxGroupComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, TnFormFieldComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Groups a set of \`tn-checkbox\`es into one \`role="group"\` control whose value is the ARRAY of
checked option values.

## Why a group

\`tn-checkbox\` is a boolean \`ControlValueAccessor\` — one control per box. A multi-select field
("which USB devices to pass through", "which catalog trains to offer") has a single array-valued
control instead, and nothing in the library spoke that shape: consumers either exploded it into one
boolean control per option and reassembled the array by hand on submit, or kept a bespoke component
outside the library.

It also gives the set the things a loose pile of checkboxes can't have: one accessible name, one
disabled state, and — inside a \`tn-form-field\` — an inferred required indicator and a rendered
validation message.

## Options

Pass an \`options\` array. Unlike \`tn-radio\`, \`tn-checkbox\` is not group-aware, so a projected
child would render as an independent boolean control silently ignoring the group's value; the group
projects nothing rather than accepting content it cannot drive.

## Value order

The emitted array is rebuilt in \`options\` order rather than appended to in click order, so the
same checked set always produces the same array however the user got there.
        `,
      },
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Options to render, one checkbox each',
    },
    inline: {
      control: 'boolean',
      description:
        'Lays the options out in a wrapping row of equal columns instead of stacking them. '
        + 'Column width comes from `--tn-checkbox-group-inline-basis` (default `50%`).',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every option in the group',
    },
    required: {
      control: 'boolean',
      description:
        'Announced via `aria-required`. Deliberately NOT propagated to the options\' native '
        + '`required`, which would have the browser demand every box rather than one of the set.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name — unnecessary inside a labelled `tn-form-field`',
    },
    testId: {
      control: 'text',
      description: 'Test-id base for the group and, scoped by option label, for each option',
    },
  },
};

export default meta;
type Story = StoryObj<TnCheckboxGroupComponent>;

export const Default: Story = {
  args: {
    options: trainOptions,
    ariaLabel: 'Preferred trains',
  },
};

/**
 * `inline` lays the options out as equal columns rather than letting them hug their labels: a
 * multi-select list is read down a column, and ragged widths make an option easy to miss.
 */
export const Inline: Story = {
  args: {
    options: trainOptions,
    inline: true,
    ariaLabel: 'Preferred trains',
  },
};

export const Disabled: Story = {
  args: {
    options: trainOptions,
    disabled: true,
    ariaLabel: 'Preferred trains',
  },
};

/**
 * Inside a `tn-form-field` the group is a normal control: the field names it via
 * `aria-labelledby`, infers the required asterisk from `Validators.required`, and renders the
 * validation message once the group is touched.
 */
export const InsideFormField: Story = {
  render: () => ({
    props: {
      control: new FormControl<string[]>([], Validators.required),
      options: trainOptions,
    },
    template: `
      <tn-form-field label="Preferred trains" tooltip="Trains offered when installing an app">
        <tn-checkbox-group [formControl]="control" [options]="options" />
      </tn-form-field>
      <p>Selected: {{ control.value?.join(', ') || 'none' }}</p>
      <button type="button" (click)="control.markAsTouched(); control.updateValueAndValidity()">
        Touch the group
      </button>
    `,
  }),
};

/**
 * **Value order.** The array is rebuilt in `options` order on every toggle, so checking Community
 * before Stable still yields `['stable', 'community']`. That is what keeps a payload diff (and a
 * spec asserting one) stable across click sequences.
 */
export const ValueOrder: Story = {
  render: () => ({
    props: {
      control: new FormControl<string[]>([]),
      options: trainOptions,
    },
    template: `
      <tn-checkbox-group ariaLabel="Preferred trains" [formControl]="control" [options]="options" />
      <p data-testid="selected">Selected: {{ control.value?.join(', ') }}</p>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox') as HTMLInputElement[];
    const selected = canvas.getByTestId('selected');

    // Community (index 2) first, Stable (index 0) second.
    await userEvent.click(boxes[2]);
    await userEvent.click(boxes[0]);

    await waitFor(() => expect(selected).toHaveTextContent('Selected: stable, community'));
  },
};

/**
 * **Test IDs.** The base lands on the group root under the `checkbox-group-` prefix and is scoped
 * by each option's label for the options themselves: `testId="trains"` → `checkbox-group-trains`
 * plus `checkbox-trains-stable`, `checkbox-trains-enterprise`, … With no `testId`, the bound
 * control name is used.
 */
export const TestIds: Story = {
  args: { testId: 'trains', options: trainOptions, ariaLabel: 'Preferred trains' },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-checkbox-group [options]="options" [testId]="testId" [ariaLabel]="ariaLabel" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnCheckboxGroupComponent, TestIdInspectorComponent] },
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
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
