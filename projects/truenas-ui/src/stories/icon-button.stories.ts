import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnCardComponent } from '../lib/card/card.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconButtonComponent } from '../lib/icon-button/icon-button.component';

// Mark MDI icons for sprite generation (used in story templates)
tnIconMarker('bell', 'mdi');
tnIconMarker('close', 'mdi');
tnIconMarker('cog', 'mdi');
tnIconMarker('content-copy', 'mdi');
tnIconMarker('delete', 'mdi');
tnIconMarker('dots-vertical', 'mdi');
tnIconMarker('heart', 'mdi');
tnIconMarker('home', 'mdi');
tnIconMarker('information', 'mdi');
tnIconMarker('magnify', 'mdi');
tnIconMarker('menu', 'mdi');
tnIconMarker('pencil', 'mdi');
tnIconMarker('refresh', 'mdi');
tnIconMarker('share-variant', 'mdi');
tnIconMarker('star', 'mdi');

// Load harness documentation
const harnessDoc = loadHarnessDoc('icon-button');

const meta: Meta<TnIconButtonComponent> = {
  title: 'Components/Icon Button',
  component: TnIconButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'The name of the icon to display',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
    color: {
      control: 'color',
      description: 'Color of the icon',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    library: {
      control: 'select',
      options: ['material', 'mdi', 'custom'],
      description: 'Icon library to use',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text for the button',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the button',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<TnIconButtonComponent>;

export const Default: Story = {
  args: {
    name: 'home',
    size: 'md',
    library: 'mdi',
    ariaLabel: 'Home',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
  },
};

export const Small: Story = {
  args: {
    name: 'cog',
    size: 'sm',
    library: 'mdi',
    ariaLabel: 'Settings',
  },
};

export const Large: Story = {
  args: {
    name: 'star',
    size: 'lg',
    library: 'mdi',
    ariaLabel: 'Favorite',
  },
};

export const WithTooltip: Story = {
  args: {
    name: 'information',
    size: 'md',
    library: 'mdi',
    tooltip: 'More information',
    ariaLabel: 'Information',
  },
};

export const Disabled: Story = {
  args: {
    name: 'delete',
    size: 'md',
    library: 'mdi',
    disabled: true,
    ariaLabel: 'Delete',
  },
};

export const CustomColor: Story = {
  args: {
    name: 'heart',
    size: 'md',
    library: 'mdi',
    color: '#ef4444',
    ariaLabel: 'Like',
  },
};

export const MenuButtons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <tn-icon-button name="menu" library="mdi" size="md" ariaLabel="Menu"></tn-icon-button>
        <tn-icon-button name="dots-vertical" library="mdi" size="md" ariaLabel="More options"></tn-icon-button>
        <tn-icon-button name="magnify" library="mdi" size="md" ariaLabel="Search"></tn-icon-button>
        <tn-icon-button name="bell" library="mdi" size="md" ariaLabel="Notifications"></tn-icon-button>
        <tn-icon-button name="cog" library="mdi" size="md" ariaLabel="Settings"></tn-icon-button>
      </div>
    `,
  }),
};

export const ActionButtons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <tn-icon-button name="pencil" library="mdi" size="md" ariaLabel="Edit" tooltip="Edit"></tn-icon-button>
        <tn-icon-button name="content-copy" library="mdi" size="md" ariaLabel="Copy" tooltip="Copy"></tn-icon-button>
        <tn-icon-button name="delete" library="mdi" size="md" ariaLabel="Delete" tooltip="Delete"></tn-icon-button>
        <tn-icon-button name="share-variant" library="mdi" size="md" ariaLabel="Share" tooltip="Share"></tn-icon-button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center;">
        <tn-icon-button name="star" library="mdi" size="xs" ariaLabel="Extra small"></tn-icon-button>
        <tn-icon-button name="star" library="mdi" size="sm" ariaLabel="Small"></tn-icon-button>
        <tn-icon-button name="star" library="mdi" size="md" ariaLabel="Medium"></tn-icon-button>
        <tn-icon-button name="star" library="mdi" size="lg" ariaLabel="Large"></tn-icon-button>
        <tn-icon-button name="star" library="mdi" size="xl" ariaLabel="Extra large"></tn-icon-button>
      </div>
    `,
  }),
};

export const InCard: Story = {
  render: () => ({
    template: `
      <tn-card title="Card with Icon Buttons" elevation="medium" padding="medium">
        <div style="display: flex; gap: 12px; align-items: center;">
          <p style="flex: 1; margin: 0;">Icon buttons work great in cards and headers</p>
          <tn-icon-button name="refresh" library="mdi" size="md" ariaLabel="Refresh" tooltip="Refresh"></tn-icon-button>
          <tn-icon-button name="cog" library="mdi" size="md" ariaLabel="Settings" tooltip="Settings"></tn-icon-button>
          <tn-icon-button name="close" library="mdi" size="md" ariaLabel="Close" tooltip="Close"></tn-icon-button>
        </div>
      </tn-card>
    `,
    moduleMetadata: {
      imports: [TnCardComponent],
    },
  }),
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
