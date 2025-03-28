import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { ButtonComponent } from '../lib/ix-button/ix-button.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Primary',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const primaryButton = canvas.getByRole('button');

    await expect(primaryButton.classList.contains('button-primary')).toBe(true);
  },
};

export const Default: Story = {
  args: {
    primary: false,
    label: 'Default',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button');

    await expect(defaultButton.classList.contains('button-primary')).toBe(true);
  },
};
