import type { Meta, StoryObj } from '@storybook/angular';
import { TnRadioComponent } from '../lib/radio/radio.component';

const meta: Meta<TnRadioComponent> = {
  title: 'Components/Radio',
  component: TnRadioComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A radio button component that follows Angular Material design patterns. Radio buttons allow users to select one option from a set of mutually exclusive options.

## Usage

Radio buttons are typically used in groups where only one option can be selected at a time. Each radio button in a group should have the same \`name\` attribute but different \`value\` attributes.

## Form Integration

The component implements \`ControlValueAccessor\` and works seamlessly with Angular reactive forms and template-driven forms.

## Accessibility

- Full keyboard navigation support
- Screen reader compatibility with proper ARIA attributes
- Focus management with visual focus indicators
- Error state communication for form validation
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed next to the radio button',
    },
    value: {
      control: 'text',
      description: 'The value of the radio button when selected',
    },
    name: {
      control: 'text',
      description: 'Name attribute for grouping radio buttons',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio button is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the radio button is required in forms',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the radio button',
    },
    testId: {
      control: 'text',
      description: 'Test ID for automated testing',
    },
  },
};

export default meta;
type Story = StoryObj<TnRadioComponent>;

export const Default: Story = {
  args: {
    label: 'Option 1',
    value: 'option1',
    name: 'example',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Option',
    value: 'disabled',
    name: 'example',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Option with Error',
    value: 'error',
    name: 'example',
    error: 'This field is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Option',
    value: 'required',
    name: 'example',
    required: true,
  },
};

export const RadioGroup: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <h3>Select your favorite color:</h3>
        <tn-radio 
          label="Red" 
          value="red" 
          name="color"
          [disabled]="false">
        </tn-radio>
        <tn-radio 
          label="Blue" 
          value="blue" 
          name="color"
          [disabled]="false">
        </tn-radio>
        <tn-radio 
          label="Green" 
          value="green" 
          name="color"
          [disabled]="false">
        </tn-radio>
        <tn-radio 
          label="Yellow (Disabled)" 
          value="yellow" 
          name="color"
          [disabled]="true">
        </tn-radio>
      </div>
    `,
  }),
  args: {},
};

