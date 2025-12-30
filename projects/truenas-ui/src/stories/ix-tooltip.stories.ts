import type { Meta, StoryObj } from '@storybook/angular';
import { IxButtonComponent } from '../lib/ix-button/ix-button.component';
import { IxTooltipComponent } from '../lib/ix-tooltip/ix-tooltip.component';
import type { TooltipPosition } from '../lib/ix-tooltip/ix-tooltip.directive';
import { IxTooltipDirective } from '../lib/ix-tooltip/ix-tooltip.directive';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  argTypes: {
    ixTooltip: {
      control: 'text',
      description: 'Tooltip message text. For multi-line tooltips in this control, press Enter to create line breaks (typing \\n won\'t work in Storybook UI). See the MultiLine story for code examples.'
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
          label="Hover for tooltip"
          [ixTooltip]="ixTooltip"
          [ixTooltipPosition]="ixTooltipPosition"
          [ixTooltipDisabled]="ixTooltipDisabled"
          [ixTooltipShowDelay]="ixTooltipShowDelay"
          [ixTooltipHideDelay]="ixTooltipHideDelay">
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
        <ix-button label="Tooltip above" ixTooltip="Tooltip above" ixTooltipPosition="above"></ix-button>
        <div></div>

        <!-- Left, Center, Right -->
        <ix-button label="Tooltip left" ixTooltip="Tooltip on left" ixTooltipPosition="left"></ix-button>
        <ix-button label="Default (above)" ixTooltip="Default position (above)"></ix-button>
        <ix-button label="Tooltip right" ixTooltip="Tooltip on right" ixTooltipPosition="right"></ix-button>

        <!-- Below -->
        <div></div>
        <ix-button label="Tooltip below" ixTooltip="Tooltip below" ixTooltipPosition="below"></ix-button>
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
          label="Instant tooltip"
          ixTooltip="Shows immediately"
          [ixTooltipShowDelay]="0">
        </ix-button>

        <ix-button
          label="500ms show delay"
          ixTooltip="Shows after 500ms"
          [ixTooltipShowDelay]="500">
        </ix-button>

        <ix-button
          label="1000ms show / 500ms hide"
          ixTooltip="Shows after 1000ms and hides after 500ms"
          [ixTooltipShowDelay]="1000"
          [ixTooltipHideDelay]="500">
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
        <ix-button
          label="Long wrapping tooltip"
          ixTooltip="This is a very long tooltip message that will wrap to multiple lines and test the max-width constraint of the tooltip component">
        </ix-button>

        <ix-button
          label="Short tooltip"
          ixTooltip="Short tip">
        </ix-button>

        <ix-button
          label="Tooltip disabled"
          ixTooltip="Disabled tooltip"
          [ixTooltipDisabled]="true">
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
        <ix-button
          label="Tooltip on button"
          ixTooltip="Button tooltip">
        </ix-button>

        <input
          type="text"
          placeholder="Hover for tooltip"
          ixTooltip="This input has a helpful tooltip"
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">

        <div
          ixTooltip="Any element can have a tooltip"
          style="padding: 12px; border: 1px dashed var(--lines, #e0e0e0); border-radius: 4px; cursor: help;">
          Tooltip on div element
        </div>

        <span
          ixTooltip="Even inline elements work"
          style="text-decoration: underline; cursor: help;">
          Tooltip on inline text
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

export const MultiLine: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <ix-button
          label="Static multi-line (&#10;)"
          ixTooltip="Line 1&#10;Line 2&#10;Line 3">
        </ix-button>

        <ix-button
          label="Bound multi-line (\n)"
          [ixTooltip]="multiLineText">
        </ix-button>

        <ix-button
          label="Structured content"
          ixTooltip="Storage Pool Status:&#10;&#10;• Capacity: 2.5 TB&#10;• Used: 1.8 TB&#10;• Health: Online">
        </ix-button>

        <ix-button
          label="Wrapping + line breaks"
          ixTooltip="First line is long and will wrap naturally when it exceeds the max-width&#10;Second line is short&#10;Third line is also short">
        </ix-button>
      </div>
    `,
    props: {
      multiLineText: 'First line\nSecond line\nThird line'
    },
    moduleMetadata: {
      imports: [
        IxButtonComponent,
        IxTooltipDirective,
        IxTooltipComponent
      ],
    },
  }),
  parameters: {
    docs: {
      description: {
        story: `
Tooltips support multi-line content using newline characters.

**In TypeScript/JavaScript:**
\`\`\`typescript
tooltipText = 'First line\\nSecond line\\nThird line';
\`\`\`

**In HTML templates (static strings):**
\`\`\`html
<button ixTooltip="Line 1&#10;Line 2&#10;Line 3">Hover me</button>
\`\`\`

**In HTML templates (property binding):**
\`\`\`html
<button [ixTooltip]="tooltipText">Hover me</button>
\`\`\`

*Note: The Storybook controls UI doesn't support \\n escape sequences in text inputs. To test multi-line tooltips, refer to the examples shown in this story or press Enter in the control field to create actual line breaks.*
        `,
      },
    },
  },
};