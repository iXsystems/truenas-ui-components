import type { Meta, StoryObj } from '@storybook/angular';
import { TnBrandedSpinnerComponent } from '../lib/spinner/branded-spinner.component';
import { TnSpinnerComponent } from '../lib/spinner/spinner.component';

const meta: Meta<TnSpinnerComponent> = {
  title: 'Components/Spinner',
  component: TnSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    diameter: {
      control: { type: 'range', min: 20, max: 100, step: 5 },
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
    },
    ariaLabel: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<TnSpinnerComponent>;

export const Determinate: Story = {
  args: {
    mode: 'determinate',
    value: 50,
    diameter: 40,
    strokeWidth: 4,
    ariaLabel: 'Progress: 50%',
  },
};

export const Indeterminate: Story = {
  args: {
    mode: 'indeterminate',
    diameter: 40,
    strokeWidth: 4,
    ariaLabel: 'Loading...',
  },
};

// Branded Spinner Stories
export const Branded = {
  render: (args: { ariaLabel: string; ariaLabelledby: string | null }) => ({
    template: `<tn-branded-spinner [ariaLabel]="ariaLabel"
      [ariaLabelledby]="ariaLabelledby"></tn-branded-spinner>`,
    props: args,
    moduleMetadata: {
      imports: [TnBrandedSpinnerComponent],
    },
  }),
  args: {
    ariaLabel: 'Loading system...',
    ariaLabelledby: null,
  },
  argTypes: {
    // Only show controls relevant to branded spinner. `ariaLabelledby` joined
    // them in #206, when this spinner gained the input the other two already
    // had — it was hidden below, as a control that did not apply.
    ariaLabel: {
      control: 'text',
    },
    ariaLabelledby: {
      control: 'text',
    },
    // Hide controls that don't apply to branded spinner
    mode: { table: { disable: true } },
    value: { table: { disable: true } },
    diameter: { table: { disable: true } },
    strokeWidth: { table: { disable: true } },
  },
};

