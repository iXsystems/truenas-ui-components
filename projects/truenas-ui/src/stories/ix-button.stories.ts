import type { Meta, StoryObj } from '@storybook/angular';
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
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
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'warn', 'default'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outline'],
    },
    primary: {
      control: 'boolean',
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<IxButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    color: 'primary',
    variant: 'filled',
    label: 'Primary',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const primaryButton = canvas.getByRole('button');

    await expect(primaryButton.classList.contains('button-primary')).toBe(true);
    await userEvent.click(primaryButton);
  },
};

export const Default: Story = {
  args: {
    color: 'default',
    variant: 'filled',
    label: 'Default',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button');

    await expect(defaultButton.classList.contains('button-default')).toBe(true);
    await userEvent.click(defaultButton);
  },
};

export const OutlinePrimary: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Outline Primary',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineButton = canvas.getByRole('button');

    await expect(outlineButton.classList.contains('button-outline-primary')).toBe(true);
    await userEvent.click(outlineButton);
  },
};

export const OutlineDefault: Story = {
  args: {
    color: 'default',
    variant: 'outline',
    label: 'Outline Default',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineButton = canvas.getByRole('button');

    await expect(outlineButton.classList.contains('button-outline-default')).toBe(true);
    await userEvent.click(outlineButton);
  },
};

export const Warn: Story = {
  args: {
    color: 'warn',
    variant: 'filled',
    label: 'Warning',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const warnButton = canvas.getByRole('button');

    await expect(warnButton.classList.contains('button-warn')).toBe(true);
    await userEvent.click(warnButton);
  },
};

export const OutlineWarn: Story = {
  args: {
    color: 'warn',
    variant: 'outline',
    label: 'Outline Warning',
  },
  play: async ({ canvasElement, args: _args }) => {
    const canvas = within(canvasElement);
    const outlineWarnButton = canvas.getByRole('button');

    await expect(outlineWarnButton.classList.contains('button-outline-warn')).toBe(true);
    await userEvent.click(outlineWarnButton);
  },
};
