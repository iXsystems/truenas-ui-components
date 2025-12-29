import type { Meta, StoryObj } from '@storybook/angular';
import { expect } from '@storybook/jest';
import { within } from '@storybook/testing-library';
import { IxCardComponent } from '../lib/ix-card/ix-card.component';
import { iconMarker } from '../lib/ix-icon/icon-marker';
import { IxIconButtonComponent } from '../lib/ix-icon-button/ix-icon-button.component';

// Mark icons used in stories for sprite generation
// Using the new two-parameter API
const STORY_ICONS = [
  iconMarker('home', 'mdi'),
  iconMarker('star', 'mdi'),
  iconMarker('information', 'mdi'),
  iconMarker('delete', 'mdi'),
  iconMarker('heart', 'mdi'),
  iconMarker('menu', 'mdi'),
  iconMarker('dots-vertical', 'mdi'),
  iconMarker('magnify', 'mdi'),
  iconMarker('bell', 'mdi'),
  iconMarker('cog', 'mdi'),
  iconMarker('pencil', 'mdi'),
  iconMarker('content-copy', 'mdi'),
  iconMarker('share-variant', 'mdi'),
  iconMarker('refresh', 'mdi'),
  iconMarker('close', 'mdi'),
];

const meta: Meta<IxIconButtonComponent> = {
  title: 'Components/Icon Button',
  component: IxIconButtonComponent,
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
type Story = StoryObj<IxIconButtonComponent>;

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
        <ix-icon-button name="menu" library="mdi" size="md" ariaLabel="Menu"></ix-icon-button>
        <ix-icon-button name="dots-vertical" library="mdi" size="md" ariaLabel="More options"></ix-icon-button>
        <ix-icon-button name="magnify" library="mdi" size="md" ariaLabel="Search"></ix-icon-button>
        <ix-icon-button name="bell" library="mdi" size="md" ariaLabel="Notifications"></ix-icon-button>
        <ix-icon-button name="cog" library="mdi" size="md" ariaLabel="Settings"></ix-icon-button>
      </div>
    `,
  }),
};

export const ActionButtons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <ix-icon-button name="pencil" library="mdi" size="md" ariaLabel="Edit" tooltip="Edit"></ix-icon-button>
        <ix-icon-button name="content-copy" library="mdi" size="md" ariaLabel="Copy" tooltip="Copy"></ix-icon-button>
        <ix-icon-button name="delete" library="mdi" size="md" ariaLabel="Delete" tooltip="Delete"></ix-icon-button>
        <ix-icon-button name="share-variant" library="mdi" size="md" ariaLabel="Share" tooltip="Share"></ix-icon-button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center;">
        <ix-icon-button name="star" library="mdi" size="xs" ariaLabel="Extra small"></ix-icon-button>
        <ix-icon-button name="star" library="mdi" size="sm" ariaLabel="Small"></ix-icon-button>
        <ix-icon-button name="star" library="mdi" size="md" ariaLabel="Medium"></ix-icon-button>
        <ix-icon-button name="star" library="mdi" size="lg" ariaLabel="Large"></ix-icon-button>
        <ix-icon-button name="star" library="mdi" size="xl" ariaLabel="Extra large"></ix-icon-button>
      </div>
    `,
  }),
};

export const InCard: Story = {
  render: () => ({
    template: `
      <ix-card title="Card with Icon Buttons" elevation="medium" padding="medium">
        <div style="display: flex; gap: 12px; align-items: center;">
          <p style="flex: 1; margin: 0;">Icon buttons work great in cards and headers</p>
          <ix-icon-button name="refresh" library="mdi" size="md" ariaLabel="Refresh" tooltip="Refresh"></ix-icon-button>
          <ix-icon-button name="cog" library="mdi" size="md" ariaLabel="Settings" tooltip="Settings"></ix-icon-button>
          <ix-icon-button name="close" library="mdi" size="md" ariaLabel="Close" tooltip="Close"></ix-icon-button>
        </div>
      </ix-card>
    `,
    moduleMetadata: {
      imports: [IxCardComponent],
    },
  }),
};
