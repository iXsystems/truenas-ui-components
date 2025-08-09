import type { Meta, StoryObj } from '@storybook/angular';
import { IxProgressBarComponent } from '../lib/ix-progress-bar/ix-progress-bar.component';

const meta: Meta<IxProgressBarComponent> = {
  title: 'Components/Progress Bar',
  component: IxProgressBarComponent,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    bufferValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    ariaLabel: {
      control: 'text',
    },
    ariaLabelledby: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<IxProgressBarComponent>;

export const Determinate: Story = {
  args: {
    mode: 'determinate',
    value: 50,
    ariaLabel: 'Progress: 50%',
  },
};

export const Indeterminate: Story = {
  args: {
    mode: 'indeterminate',
    ariaLabel: 'Loading...',
  },
};

export const Buffer: Story = {
  args: {
    mode: 'buffer',
    value: 40,
    bufferValue: 60,
    ariaLabel: 'Progress: 40%, Buffer: 60% of remaining',
  },
};


