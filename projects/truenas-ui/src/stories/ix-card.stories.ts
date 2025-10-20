import type { Meta, StoryObj } from '@storybook/angular';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { IxCardComponent } from '../lib/ix-card/ix-card.component';

const meta: Meta<IxCardComponent> = {
  title: 'Components/Card',
  component: IxCardComponent,
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'low', 'medium', 'high'],
      description: 'Shadow elevation level',
    },
    padding: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Internal padding size',
    },
    bordered: {
      control: 'boolean',
      description: 'Show border around card',
    },
    background: {
      control: 'boolean',
      description: 'Apply background color',
    },
    title: {
      control: 'text',
      description: 'Card title text',
    },
    titleLink: {
      control: 'text',
      description: 'URL to navigate to when title is clicked',
    },
    headerStatus: {
      control: 'object',
      description: 'Status badge configuration (label, type)',
    },
    headerControl: {
      control: 'object',
      description: 'Slide toggle configuration (label, checked, handler)',
    },
    headerMenu: {
      control: 'object',
      description: 'Array of IxMenuItem objects for header menu',
    },
    primaryAction: {
      control: 'object',
      description: 'Primary footer action button (label, handler, icon)',
    },
    secondaryAction: {
      control: 'object',
      description: 'Secondary footer action button (label, handler, icon)',
    },
    footerLink: {
      control: 'object',
      description: 'Footer link configuration (label, handler)',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
      >
        <div style="padding: 24px;">
          <p>This is the card content. You can put any content here including other components, text, images, etc.</p>
          <p>The card provides a clean container with customizable elevation, padding, and optional borders.</p>
        </div>
      </ix-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<IxCardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
    background: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText('Card Title');
    await expect(card).toBeInTheDocument();
  },
};

export const WithoutTitle: Story = {
  args: {
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText((content, element) =>
      content.startsWith('This is the card content')
    );
    await expect(content).toBeInTheDocument();
  },
};

export const LowElevation: Story = {
  args: {
    title: 'Low Elevation Card',
    elevation: 'low',
    padding: 'medium',
    bordered: false,
  },
};

export const HighElevation: Story = {
  args: {
    title: 'High Elevation Card',
    elevation: 'high',
    padding: 'medium',
    bordered: false,
  },
};

export const SmallPadding: Story = {
  args: {
    title: 'Small Padding',
    elevation: 'medium',
    padding: 'small',
    bordered: false,
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Large Padding',
    elevation: 'medium',
    padding: 'large',
    bordered: false,
  },
};

export const Bordered: Story = {
  args: {
    title: 'Bordered Card',
    elevation: 'medium',
    padding: 'medium',
    bordered: true,
  },
};

export const BorderedLowElevation: Story = {
  args: {
    title: 'Bordered Low Elevation',
    elevation: 'low',
    padding: 'medium',
    bordered: true,
    background: true,
  },
};

export const NoBackground: Story = {
  args: {
    title: 'Transparent Card',
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
    background: false,
  },
};

export const BorderedNoBackground: Story = {
  args: {
    title: 'Bordered Transparent',
    elevation: 'low',
    padding: 'medium',
    bordered: true,
    background: false,
  },
};

export const NoElevation: Story = {
  args: {
    title: 'No Elevation Card',
    elevation: 'none',
    padding: 'medium',
    bordered: true,
    background: true,
  },
};

export const WithHeaderStatus: Story = {
  args: {
    title: 'System Status',
    elevation: 'medium',
    padding: 'medium',
    headerStatus: { label: 'Active', type: 'success' },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [headerStatus]="headerStatus">
        <div style="padding: 24px;">
          <p>This card includes a status badge in the header showing the current state.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const WithHeaderControl: Story = {
  args: {
    title: 'Feature Settings',
    elevation: 'medium',
    padding: 'medium',
    headerControl: {
      label: 'Enable',
      checked: true,
      handler: (checked: boolean) => console.log('Control changed:', checked),
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [headerControl]="headerControl">
        <div style="padding: 24px;">
          <p>This card includes a slide toggle control in the header for quick enable/disable actions.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const WithHeaderMenu: Story = {
  args: {
    title: 'Configuration',
    elevation: 'medium',
    padding: 'medium',
    headerMenu: [
      { id: '1', label: 'Edit', action: () => console.log('Edit clicked'), icon: 'pencil' },
      { id: '2', label: 'Duplicate', action: () => console.log('Duplicate clicked'), icon: 'content-copy' },
      { id: 'sep1', label: '', separator: true },
      { id: '3', label: 'Delete', action: () => console.log('Delete clicked'), icon: 'delete' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [headerMenu]="headerMenu">
        <div style="padding: 24px;">
          <p>This card includes a three-dot menu icon in the header with common actions. Click the dots to open the menu.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const WithTitleLink: Story = {
  args: {
    title: 'View Details',
    elevation: 'medium',
    padding: 'medium',
    titleLink: '#/details',
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [titleLink]="titleLink"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background">
        <div style="padding: 24px;">
          <p>This card has a clickable title that navigates to a detail page.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const WithFooterActions: Story = {
  args: {
    title: 'Edit Configuration',
    elevation: 'medium',
    padding: 'medium',
    primaryAction: {
      label: 'Primary',
      handler: () => console.log('Primary clicked'),
    },
    secondaryAction: {
      label: 'Secondary',
      handler: () => console.log('Secondary clicked'),
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [primaryAction]="primaryAction"
        [secondaryAction]="secondaryAction">
        <div style="padding: 24px;">
          <p>This card includes action buttons in the footer for common operations.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const WithFooterLink: Story = {
  args: {
    title: 'Welcome',
    elevation: 'medium',
    padding: 'medium',
    footerLink: {
      label: 'Learn more',
      handler: () => console.log('Learn more clicked'),
    },
    primaryAction: {
      label: 'Primary',
      handler: () => console.log('Primary clicked'),
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [footerLink]="footerLink"
        [primaryAction]="primaryAction">
        <div style="padding: 24px;">
          <p>This card includes a footer link on the left and a primary action on the right.</p>
        </div>
      </ix-card>
    `,
  }),
};

export const CompleteExample: Story = {
  args: {
    title: 'My Service',
    elevation: 'medium',
    padding: 'medium',
    bordered: true,
    headerStatus: { label: 'Running', type: 'success' },
    headerControl: {
      label: 'Auto-sync',
      checked: true,
      handler: (checked: boolean) => console.log('Auto-sync:', checked),
    },
    headerMenu: [
      { id: '1', label: 'Refresh', action: () => console.log('Refresh'), icon: 'refresh' },
      { id: '2', label: 'Settings', action: () => console.log('Settings'), icon: 'cog' },
      { id: 'sep1', label: '', separator: true },
      { id: '3', label: 'Stop Service', action: () => console.log('Stop'), icon: 'stop' },
    ],
    footerLink: {
      label: 'View logs',
      handler: () => console.log('View logs'),
    },
    primaryAction: {
      label: 'Primary',
      handler: () => console.log('Primary'),
      icon: 'check',
    },
    secondaryAction: {
      label: 'Secondary',
      handler: () => console.log('Secondary'),
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ix-card
        [title]="title"
        [elevation]="elevation"
        [padding]="padding"
        [bordered]="bordered"
        [background]="background"
        [headerStatus]="headerStatus"
        [headerControl]="headerControl"
        [headerMenu]="headerMenu"
        [footerLink]="footerLink"
        [primaryAction]="primaryAction"
        [secondaryAction]="secondaryAction">
        <div style="padding: 24px;">
          <h4 style="margin-top: 0;">Service Configuration</h4>
          <p>Configure your service settings and preferences below.</p>
          <ul>
            <li>Automatic synchronization enabled</li>
            <li>Real-time monitoring active</li>
            <li>Backup schedule configured</li>
          </ul>
        </div>
      </ix-card>
    `,
  }),
};
