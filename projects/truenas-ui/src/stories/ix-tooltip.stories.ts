import type { Meta, StoryObj } from '@storybook/angular';
import { IxTooltipDirective, TooltipPosition } from '../lib/ix-tooltip/ix-tooltip.directive';
import { IxTooltipComponent } from '../lib/ix-tooltip/ix-tooltip.component';
import { IxButtonComponent } from '../lib/ix-button/ix-button.component';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  argTypes: {
    ixTooltip: {
      control: 'text',
      description: 'Tooltip message text'
    },
    ixTooltipPosition: {
      control: { type: 'select' },
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      description: 'Tooltip position relative to the element'
    },
    ixTooltipDisabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled'
    },
    ixTooltipShowDelay: {
      control: { type: 'number' },
      description: 'Delay in ms before showing tooltip'
    },
    ixTooltipHideDelay: {
      control: { type: 'number' },
      description: 'Delay in ms before hiding tooltip'
    }
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => ({
    template: `
      <div style="padding: 50px; text-align: center;">
        <ix-button 
          [ixTooltip]="ixTooltip"
          [ixTooltipPosition]="ixTooltipPosition"
          [ixTooltipDisabled]="ixTooltipDisabled"
          [ixTooltipShowDelay]="ixTooltipShowDelay"
          [ixTooltipHideDelay]="ixTooltipHideDelay">
          Hover me
        </ix-button>
      </div>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
  args: {
    ixTooltip: 'This is a helpful tooltip message',
    ixTooltipPosition: 'above' as TooltipPosition,
    ixTooltipDisabled: false,
    ixTooltipShowDelay: 0,
    ixTooltipHideDelay: 0
  }
};

export const Positions: Story = {
  render: () => ({
    template: `
      <div style="padding: 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; align-items: center; text-align: center;">
        
        <!-- Above -->
        <div></div>
        <ix-button ixTooltip="Tooltip above" ixTooltipPosition="above">Above</ix-button>
        <div></div>

        <!-- Left, Center, Right -->
        <ix-button ixTooltip="Tooltip on left" ixTooltipPosition="left">Left</ix-button>
        <ix-button ixTooltip="Default position (above)">Center</ix-button>
        <ix-button ixTooltip="Tooltip on right" ixTooltipPosition="right">Right</ix-button>

        <!-- Below -->
        <div></div>
        <ix-button ixTooltip="Tooltip below" ixTooltipPosition="below">Below</ix-button>
        <div></div>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
};

export const WithDelays: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; gap: 20px; justify-content: center;">
        <ix-button 
          ixTooltip="Shows immediately" 
          [ixTooltipShowDelay]="0">
          No Delay
        </ix-button>
        
        <ix-button 
          ixTooltip="Shows after 500ms" 
          [ixTooltipShowDelay]="500">
          500ms Delay
        </ix-button>
        
        <ix-button 
          ixTooltip="Shows after 1000ms and hides after 500ms" 
          [ixTooltipShowDelay]="1000"
          [ixTooltipHideDelay]="500">
          Show 1000ms / Hide 500ms
        </ix-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
};

export const LongContent: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; gap: 20px; justify-content: center;">
        <ix-button ixTooltip="This is a very long tooltip message that will wrap to multiple lines and test the max-width constraint of the tooltip component">
          Long tooltip
        </ix-button>
        
        <ix-button ixTooltip="Short tip">
          Short tooltip
        </ix-button>
        
        <ix-button 
          ixTooltip="Disabled tooltip" 
          [ixTooltipDisabled]="true">
          Disabled
        </ix-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
};

export const OnDifferentElements: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <ix-button ixTooltip="Button tooltip">Button</ix-button>
        
        <input 
          type="text" 
          placeholder="Input with tooltip" 
          ixTooltip="This input has a helpful tooltip"
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        
        <div 
          ixTooltip="Any element can have a tooltip"
          style="padding: 12px; border: 1px dashed var(--lines, #e0e0e0); border-radius: 4px; cursor: help;">
          Div with tooltip
        </div>
        
        <span 
          ixTooltip="Even inline elements work"
          style="text-decoration: underline; cursor: help;">
          Underlined text with tooltip
        </span>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
};