import type { Meta, StoryObj } from '@storybook/angular';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxBannerComponent } from '../lib/ix-banner/ix-banner.component';
import { iconMarker } from '../lib/ix-icon/icon-marker';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';

// Mark icons for sprite generation (since they're computed dynamically)
iconMarker('information', 'mdi');
iconMarker('alert', 'mdi');
iconMarker('alert-circle', 'mdi');
iconMarker('check-circle', 'mdi');

// Load harness documentation
const harnessDoc = loadHarnessDoc('ix-banner');

const meta: Meta<IxBannerComponent> = {
  title: 'Components/Banner',
  component: IxBannerComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Banner component for displaying informational messages to users. Supports four severity levels (info, warning, error, success) with appropriate visual styling and icons.'
      }
    }
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Main heading text (required)',
    },
    message: {
      control: 'text',
      description: 'Optional body text below heading',
    },
    type: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      description: 'Banner severity level (defaults to info)',
    },
  },
};

export default meta;
type Story = StoryObj<IxBannerComponent>;

export const Default: Story = {
  args: {
    heading: 'MPIO Configuration',
    message: 'MPIO is supported. Each Fibre Channel port must use a unique physical port.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('MPIO Configuration');
    await expect(heading).toBeInTheDocument();
  },
};

export const Warning: Story = {
  args: {
    heading: 'Warning: Action Required',
    message: 'Your storage pool is approaching capacity. Consider adding more storage.',
    type: 'warning',
  },
};

export const Error: Story = {
  args: {
    heading: 'Error: Configuration Invalid',
    message: 'The form contains validation errors. Please correct the highlighted fields.',
    type: 'error',
  },
};

export const Success: Story = {
  args: {
    heading: 'Success!',
    message: 'Your changes have been saved successfully.',
    type: 'success',
  },
};

export const WithoutMessage: Story = {
  args: {
    heading: 'Quick Alert',
  },
};

export const LongContent: Story = {
  args: {
    heading: 'Important System Update Available',
    message: 'A new system update is available that includes critical security patches, performance improvements, and bug fixes. We recommend installing this update at your earliest convenience to ensure optimal system security and stability. The update process will take approximately 15-20 minutes and may require a system restart.',
    type: 'warning',
  },
};

export const MultipleTypes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ix-banner
          heading="Information"
          message="This is an info banner with helpful information.">
        </ix-banner>

        <ix-banner
          heading="Warning"
          message="This is a warning banner that requires your attention."
          type="warning">
        </ix-banner>

        <ix-banner
          heading="Error"
          message="This is an error banner indicating something went wrong."
          type="error">
        </ix-banner>

        <ix-banner
          heading="Success"
          message="This is a success banner confirming a completed action."
          type="success">
        </ix-banner>
      </div>
    `,
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
