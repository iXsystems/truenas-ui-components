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
  render: (args: { ariaLabel: string }) => ({
    template: `<tn-branded-spinner [ariaLabel]="ariaLabel"></tn-branded-spinner>`,
    props: args,
    moduleMetadata: {
      imports: [TnBrandedSpinnerComponent],
    },
  }),
  args: {
    ariaLabel: 'Loading system...',
  },
  argTypes: {
    // Only show controls relevant to branded spinner
    ariaLabel: {
      control: 'text',
    },
    // Hide controls that don't apply to branded spinner
    mode: { table: { disable: true } },
    value: { table: { disable: true } },
    diameter: { table: { disable: true } },
    strokeWidth: { table: { disable: true } },
    ariaLabelledby: { table: { disable: true } },
  },
};

