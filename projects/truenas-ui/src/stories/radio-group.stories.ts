import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnRadioGroupComponent } from '../lib/radio/radio-group.component';
import { TnRadioComponent } from '../lib/radio/radio.component';

const harnessDoc = loadHarnessDoc('radio-group');

const colorOptions = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow', disabled: true },
];

const meta: Meta<TnRadioGroupComponent> = {
  title: 'Components/Radio Group',
  component: TnRadioGroupComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, TnRadioComponent, TnFormFieldComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Groups a set of \`tn-radio\`s into one \`role="radiogroup"\` control with a single value.

## Why a group

A \`tn-radio\` on its own is a \`ControlValueAccessor\` per option. Binding the same form control to
several of them looks like it works, but goes stale: Angular suppresses the model→view write on
whichever accessor originated a change, so the previously checked option keeps rendering as checked.
The group owns the value instead, and every option derives its checked state from it.

It also gives the set the things a loose pile of radios can't have: one accessible name, one native
\`name\` (so arrow keys move within the group and nowhere else), one disabled state, and — inside a
\`tn-form-field\` — an inferred required indicator and a rendered validation message.

## Options

Pass an \`options\` array, or project \`<tn-radio>\` children when an option needs custom markup.
Both resolve the group through DI, so they behave identically and can be mixed.
        `,
      },
    },
  },
  argTypes: {
    options: {
      control: 'object',
      description: 'Options to render. Omit to project `<tn-radio>` children instead.',
    },
    inline: {
      control: 'boolean',
      description: 'Lays the options out in a wrapping row instead of stacking them',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables every option in the group',
    },
    required: {
      control: 'boolean',
      description: 'Propagated to each option\'s native `required`',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible name — unnecessary inside a labelled `tn-form-field`',
    },
    name: {
      control: 'text',
      description:
        'Native `name` shared by the options — what makes arrow keys move within the group. '
        + 'Defaults to a per-instance generated name. Never set `name` on a projected `<tn-radio>`: '
        + 'its own name wins, dropping it out of the group.',
    },
    testId: {
      control: 'text',
      description: 'Test-id base for the group and, scoped by option label, for each option',
    },
  },
};

export default meta;
type Story = StoryObj<TnRadioGroupComponent>;

export const Default: Story = {
  args: {
    options: colorOptions,
    ariaLabel: 'Favorite color',
  },
};

export const Inline: Story = {
  args: {
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
    inline: true,
    ariaLabel: 'Confirm',
  },
};

export const Disabled: Story = {
  args: {
    options: colorOptions,
    disabled: true,
    ariaLabel: 'Favorite color',
  },
};

/**
 * Project `<tn-radio>` children when an option needs markup of its own. They read the group's
 * value, name and disabled state over DI, exactly like the `options`-rendered ones.
 */
export const ProjectedOptions: Story = {
  render: () => ({
    props: { control: new FormControl('passphrase') },
    template: `
      <tn-radio-group ariaLabel="Encryption" [formControl]="control">
        <tn-radio label="None" value="none" />
        <tn-radio label="Passphrase" value="passphrase" />
        <tn-radio label="Key file" value="key" />
      </tn-radio-group>
      <p>Selected: {{ control.value }}</p>
    `,
  }),
};

/**
 * Inside a `tn-form-field` the group is a normal control: the field names it via
 * `aria-labelledby`, infers the required asterisk from `Validators.required`, and renders the
 * validation message once the group is touched.
 */
export const InsideFormField: Story = {
  render: () => ({
    props: { control: new FormControl(null, Validators.required) },
    template: `
      <tn-form-field label="Encryption standard" hint="Applies to every dataset in the pool">
        <tn-radio-group [formControl]="control" [options]="[
          { value: 'aes-128', label: 'AES-128-GCM' },
          { value: 'aes-256', label: 'AES-256-GCM' }
        ]" />
      </tn-form-field>
      <button type="button" (click)="control.markAsTouched(); control.updateValueAndValidity()">
        Touch the group
      </button>
    `,
  }),
};

/**
 * **Keyboard navigation.** Arrow keys move the selection between options and skip the rest of the
 * page, because every option shares one native `name`. Nothing implements that — the browser does,
 * given a well-formed group — so the play function guards the wiring it depends on: split the
 * generated name across options and this story fails.
 */
export const KeyboardNavigation: Story = {
  render: () => ({
    props: {
      control: new FormControl('red'),
      options: colorOptions.filter((option) => !option.disabled),
    },
    template: `
      <tn-radio-group ariaLabel="Favorite color" [formControl]="control" [options]="options" />
      <p data-testid="selected">Selected: {{ control.value }}</p>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio') as HTMLInputElement[];
    const selected = canvas.getByTestId('selected');

    radios[0].focus();
    await userEvent.keyboard('{ArrowDown}');

    // Roving focus follows the selection, and the pick reaches the bound control — the arrow key
    // is a real selection, not just a focus move.
    await waitFor(() => expect(selected).toHaveTextContent('Selected: blue'));
    await expect(radios[1]).toHaveFocus();
    await expect(radios[1].checked).toBe(true);
    await expect(radios[0].checked).toBe(false);

    // And it wraps at the end rather than escaping the group.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(selected).toHaveTextContent('Selected: red'));
  },
};

/**
 * **Test IDs.** The base lands on the group root under the `radio-group-` prefix and is scoped by
 * each option's label for the options themselves: `testId="color"` → `radio-group-color` plus
 * `radio-button-color-red`, `radio-button-color-blue`, … With no `testId`, the bound control name
 * is used.
 */
export const TestIds: Story = {
  args: { testId: 'color', options: colorOptions, ariaLabel: 'Favorite color' },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-radio-group [options]="options" [testId]="testId" [ariaLabel]="ariaLabel" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnRadioGroupComponent, TestIdInspectorComponent] },
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
