import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';

// Load harness documentation
const harnessDoc = loadHarnessDoc('button');

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<TnButtonComponent> = {
  title: 'Components/Button',
  component: TnButtonComponent,
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
    href: {
      control: 'text',
      description: 'When set, renders as <a> with this href',
    },
    routerLink: {
      control: 'text',
      description: 'When set, renders as <a routerLink>. Takes precedence over href.',
    },
    target: {
      control: 'text',
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<TnButtonComponent>;

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

export const AsLink: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Audit Settings',
    href: 'https://www.truenas.com/docs/',
    target: '_blank',
    rel: 'noopener',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Audit Settings/i });

    await expect(link.tagName.toLowerCase()).toBe('a');
    await expect(link.getAttribute('href')).toBe('https://www.truenas.com/docs/');
  },
};

export const AsRouterLink: Story = {
  args: {
    color: 'primary',
    variant: 'filled',
    label: 'Open audit page',
    routerLink: '/audit/settings',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Open audit page/i });

    await expect(link.tagName.toLowerCase()).toBe('a');
    await expect(link.getAttribute('href')).toBe('/audit/settings');
  },
};

export const DisabledLink: Story = {
  args: {
    color: 'primary',
    variant: 'outline',
    label: 'Audit Settings (disabled)',
    href: 'https://www.truenas.com/docs/',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /Audit Settings/i });

    await expect(link.getAttribute('aria-disabled')).toBe('true');
    await expect(link.hasAttribute('href')).toBe(false);
  },
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
