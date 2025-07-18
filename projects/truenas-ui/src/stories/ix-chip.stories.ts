import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxChipComponent } from '../lib/ix-chip/ix-chip.component';

const meta: Meta<IxChipComponent> = {
  title: 'Components/Chip',
  component: IxChipComponent,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent'],
    },
    closable: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'text' },
    },
    label: {
      control: { type: 'text' },
    },
    onClose: { action: 'closed' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A versatile chip component for displaying tags, filters, or selections with optional icons and close functionality.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<IxChipComponent>;

export const Default: Story = {
  args: {
    label: 'Default Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'default-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('ix-chip--primary');
    await userEvent.click(chip);
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Tagged Item',
    icon: '🏷️',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'icon-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    const icon = chip.querySelector('.ix-chip__icon');
    
    await expect(chip).toBeInTheDocument();
    await expect(icon).toBeInTheDocument();
    await expect(icon).toHaveTextContent('🏷️');
  },
};

export const NotClosable: Story = {
  args: {
    label: 'Read-only Chip',
    color: 'secondary',
    closable: false,
    disabled: false,
    testId: 'readonly-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    const closeButton = chip.querySelector('.ix-chip__close');
    
    await expect(chip).toBeInTheDocument();
    await expect(closeButton).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Chip',
    color: 'primary',
    closable: true,
    disabled: true,
    testId: 'disabled-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('ix-chip--disabled');
    await expect(chip).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'primary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--primary');
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Chip',
    color: 'secondary',
    closable: true,
    disabled: false,
    testId: 'secondary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--secondary');
  },
};

export const Accent: Story = {
  args: {
    label: 'Accent Chip',
    color: 'accent',
    closable: true,
    disabled: false,
    testId: 'accent-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--accent');
  },
};

export const CloseInteraction: Story = {
  args: {
    label: 'Closable Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'closable-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    const closeButton = chip.querySelector('.ix-chip__close') as HTMLElement;
    
    await expect(closeButton).toBeInTheDocument();
    await expect(closeButton).toHaveAttribute('aria-label', 'Remove Closable Chip');
    await userEvent.click(closeButton);
  },
};

export const KeyboardNavigation: Story = {
  args: {
    label: 'Keyboard Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'keyboard-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveAttribute('tabindex', '0');
    await expect(chip).toHaveAttribute('role', 'button');
    
    // Test keyboard interaction
    chip.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Delete}');
  },
};