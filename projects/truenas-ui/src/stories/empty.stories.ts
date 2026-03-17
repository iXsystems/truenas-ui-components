import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnEmptyComponent } from '../lib/empty/empty.component';
import { tnIconMarker } from '../lib/icon/icon-marker';

tnIconMarker('inbox', 'mdi');
tnIconMarker('magnify', 'mdi');
tnIconMarker('folder-open', 'mdi');
tnIconMarker('alert-circle-outline', 'mdi');

const harnessDoc = loadHarnessDoc('empty');

const meta: Meta<TnEmptyComponent> = {
  title: 'Components/Empty',
  component: TnEmptyComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Empty state component for indicating that there is no content to display. Supports an optional icon, description, and call-to-action button.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Main heading text (required)',
    },
    description: {
      control: 'text',
      description: 'Optional secondary text below the title',
    },
    icon: {
      control: 'text',
      description: 'Optional icon name to display above the title',
    },
    iconLibrary: {
      control: 'select',
      options: ['mdi', 'material', 'lucide'],
      description: 'Icon library (defaults to mdi)',
    },
    actionText: {
      control: 'text',
      description: 'Optional CTA button label. Renders a primary outline button when set.',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Size variant (default or compact)',
    },
    onAction: { action: 'onAction' },
  },
};

export default meta;
type Story = StoryObj<TnEmptyComponent>;

export const Default: Story = {
  args: {
    icon: 'inbox',
    title: 'No messages',
    description: 'Your inbox is empty. Messages you receive will appear here.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText('No messages');
    await expect(title).toBeInTheDocument();
  },
};

export const WithAction: Story = {
  args: {
    icon: 'folder-open',
    title: 'No files yet',
    description: 'Upload your first file to get started.',
    actionText: 'Upload File',
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: 'magnify',
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
    actionText: 'Clear Filters',
  },
};

export const Compact: Story = {
  args: {
    icon: 'inbox',
    title: 'No items',
    description: 'This list is empty.',
    size: 'compact',
  },
};

export const CompactWithAction: Story = {
  args: {
    icon: 'folder-open',
    title: 'No files',
    description: 'Add a file to get started.',
    actionText: 'Add File',
    size: 'compact',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here',
  },
};

export const WithoutIcon: Story = {
  args: {
    title: 'No data available',
    description: 'There is currently no data to display in this view.',
  },
};

export const ErrorState: Story = {
  args: {
    icon: 'alert-circle-outline',
    title: 'Failed to load data',
    description: 'Something went wrong while fetching the data. Please try again.',
    actionText: 'Retry',
  },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none',
      },
      description: {
        story: harnessDoc || '',
      },
    },
    controls: { disable: true },
    layout: 'fullscreen',
  },
  render: () => ({ template: '' }),
};
