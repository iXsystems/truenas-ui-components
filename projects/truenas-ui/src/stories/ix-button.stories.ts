import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxButtonComponent } from '../lib/ix-button/ix-button.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<IxButtonComponent> = {
  title: 'Components/Button',
  component: IxButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<IxButtonComponent>;

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
    await userEvent.click(primaryButton);
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

    await expect(defaultButton.classList.contains('button-default')).toBe(true);
    await userEvent.click(defaultButton);
  },
};
