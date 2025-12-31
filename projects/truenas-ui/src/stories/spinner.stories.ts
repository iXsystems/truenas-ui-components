import type { Meta, StoryObj } from '@storybook/angular';
import { IxBrandedSpinnerComponent } from '../lib/spinner/branded-spinner.component';
import { IxSpinnerComponent } from '../lib/spinner/spinner.component';

const meta: Meta<IxSpinnerComponent> = {
  title: 'Components/Spinner',
  component: IxSpinnerComponent,
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
type Story = StoryObj<IxSpinnerComponent>;

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
    template: `<ix-branded-spinner [ariaLabel]="ariaLabel"></ix-branded-spinner>`,
    props: args,
    moduleMetadata: {
      imports: [IxBrandedSpinnerComponent],
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

