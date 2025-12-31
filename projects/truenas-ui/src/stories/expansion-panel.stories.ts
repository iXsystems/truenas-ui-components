import type { Meta, StoryObj } from '@storybook/angular';
import { IxCardComponent } from '../lib/card/card.component';
import { IxExpansionPanelComponent } from '../lib/expansion-panel/expansion-panel.component';

const meta: Meta<IxExpansionPanelComponent> = {
  title: 'Components/Expansion Panel',
  component: IxExpansionPanelComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
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
      description: 'Show border around the panel',
    },
    background: {
      control: 'boolean', 
      description: 'Show background color',
    },
    expanded: {
      control: 'boolean',
      description: 'Whether the panel is expanded',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the panel is disabled',
    },
    title: {
      control: 'text',
      description: 'Panel title text',
    },
    titleStyle: {
      control: 'select',
      options: ['header', 'body', 'link'],
      description: 'Visual style for the title and chevron',
    },
  },
  args: {
    elevation: 'medium',
    padding: 'medium',
    bordered: false,
    background: true,
    expanded: false,
    disabled: false,
    title: 'Expansion Panel',
  },
};

export default meta;
type Story = StoryObj<IxExpansionPanelComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-expansion-panel
        [elevation]="elevation"
        [bordered]="bordered"
        [background]="background"
        [title]="title"
        [expanded]="expanded"
        [disabled]="disabled"
        [padding]="padding"
        [titleStyle]="titleStyle">
        <p>This is the default expansion panel with background, border, and medium elevation. It provides a clean, card-like appearance suitable for most use cases.</p>
        <p>Content can include forms, lists, buttons, or any other components you need to organize hierarchically.</p>
      </ix-expansion-panel>
    `,
  }),
  args: {
    title: 'Configuration Settings',
    elevation: 'medium',
    bordered: true,
    background: true,
    expanded: false,
    disabled: false,
    padding: 'medium',
    titleStyle: 'header',
  },
};

export const Minimal: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-expansion-panel
        [elevation]="elevation"
        [bordered]="bordered"
        [background]="background"
        [title]="title"
        [expanded]="expanded"
        [disabled]="disabled"
        [padding]="padding"
        [titleStyle]="titleStyle">
        <p>This is a minimal expansion panel with only a border and no background or shadow. Perfect for clean, lightweight interfaces.</p>
        <ul>
          <li>Version: TrueNAS 24.04</li>
          <li>Uptime: 15 days, 4 hours</li>
          <li>Memory: 32GB (45% used)</li>
          <li>Storage: 2.4TB available</li>
        </ul>
      </ix-expansion-panel>
    `,
  }),
  args: {
    title: 'System Information',
    elevation: 'none',
    bordered: true,
    background: false,
    expanded: false,
    disabled: false,
    padding: 'medium',
    titleStyle: 'body',
  },
};

export const Embedded: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [IxCardComponent, IxExpansionPanelComponent]
    },
    template: `
      <ix-card elevation="medium" [bordered]="true" style="max-width: 600px;">
        <div style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0;">Network Configuration</h3>
          <p>Your network is configured and running normally.</p>
          
          <div style="display: flex; align-items: center; gap: 12px; margin: 16px 0;">
            <span style="color: var(--green, #4caf50); font-size: 20px;">✓</span>
            <div>
              <div style="font-weight: 600;">Connection Status: Active</div>
              <div style="color: var(--fg2, #666); font-size: 14px;">IP: 192.168.1.100 | Gateway: 192.168.1.1</div>
            </div>
          </div>
          
          <ix-expansion-panel
            [elevation]="elevation"
            [bordered]="bordered"
            [background]="background"
            [title]="title"
            [expanded]="expanded"
            [disabled]="disabled"
            [padding]="padding"
            [titleStyle]="titleStyle">
            <div style="margin-top: 12px; padding-top: 12px;">
              <p style="margin: 0 0 12px 0; color: var(--fg2, #666); font-size: 14px;">
                Additional network details and diagnostics information:
              </p>
              <div style="background: var(--alt-bg1, #f8f9fa); padding: 12px; border-radius: 4px; font-size: 13px;">
                <div><strong>Interface:</strong> em0 (Intel Gigabit Ethernet)</div>
                <div><strong>MAC Address:</strong> 00:1B:21:12:34:56</div>
                <div><strong>Speed:</strong> 1000 Mbps Full Duplex</div>
                <div><strong>DNS:</strong> 8.8.8.8, 8.8.4.4</div>
                <div><strong>MTU:</strong> 1500 bytes</div>
              </div>
            </div>
          </ix-expansion-panel>
        </div>
      </ix-card>
    `,
  }),
  args: {
    title: 'More Info',
    elevation: 'none',
    bordered: false,
    background: false,
    expanded: false,
    disabled: false,
    padding: 'medium',
    titleStyle: 'link',
  },
};