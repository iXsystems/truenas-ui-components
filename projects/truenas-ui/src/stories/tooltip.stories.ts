import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnTooltipComponent } from '../lib/tooltip/tooltip.component';
import type { TooltipPosition } from '../lib/tooltip/tooltip.directive';
import { TnTooltipDirective } from '../lib/tooltip/tooltip.directive';

// Load harness documentation
const harnessDoc = loadHarnessDoc('tooltip');

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  argTypes: {
    tnTooltip: {
      control: 'text',
      description: 'Tooltip content. Rendered as HTML, so markup like <b> or <br> is supported (sanitized by Angular; <script> and event handlers are stripped). Plain newlines still produce line breaks via white-space: pre-line. For multi-line tooltips in this control, press Enter to create line breaks (typing \\n won\'t work in Storybook UI). See the MultiLine and HtmlContent stories for code examples.'
    },
    tnTooltipPosition: {
      control: { type: 'select' },
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      description: 'Tooltip position relative to the element'
    },
    tnTooltipDisabled: {
      control: 'boolean',
      description: 'Whether the tooltip is disabled'
    },
    tnTooltipShowDelay: {
      control: { type: 'number' },
      description: 'Delay in ms before showing tooltip'
    },
    tnTooltipHideDelay: {
      control: { type: 'number' },
      description: 'Delay in ms before hiding tooltip'
    },
    tnTooltipSticky: {
      control: 'boolean',
      description: 'Whether a message containing a link may be pinned open by clicking the host. Enabled by default, and only ever applies to such messages — plain help text always hovers and is never pinnable, so this control has no effect on it. Set it to false to force a message with a link back to hover behaviour.'
    },
    tnTooltipCloseAriaLabel: {
      control: 'text',
      description: 'Accessible name for the dismiss button rendered in sticky mode'
    },
    tnTooltipAriaLabel: {
      control: 'text',
      description: 'Accessible name for the panel itself once pinned, where it is announced as a dialog. A short static name rather than the message, which a screen reader reads straight after it.'
    }
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => ({
    template: `
      <div style="padding: 50px; text-align: center;">
        <tn-button
          label="Hover for tooltip"
          [tnTooltip]="tnTooltip"
          [tnTooltipPosition]="tnTooltipPosition"
          [tnTooltipDisabled]="tnTooltipDisabled"
          [tnTooltipShowDelay]="tnTooltipShowDelay"
          [tnTooltipHideDelay]="tnTooltipHideDelay"
          [tnTooltipSticky]="tnTooltipSticky">
        </tn-button>
      </div>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
  args: {
    tnTooltip: 'This is a helpful tooltip message',
    tnTooltipPosition: 'above' as TooltipPosition,
    tnTooltipDisabled: false,
    tnTooltipShowDelay: 0,
    tnTooltipHideDelay: 0,
    tnTooltipSticky: true
  }
};

export const Sticky: Story = {
  render: () => ({
    template: `
      <div style="padding: 80px; display: flex; flex-direction: column; gap: 24px; align-items: center;">
        <tn-button
          label="Click to pin a tooltip with a link"
          tnTooltipPosition="below"
          tnTooltip="Datasets inherit settings from their parent. <a href='https://www.truenas.com/docs/' target='_blank' rel='noopener'>Read the docs</a>">
        </tn-button>

        <tn-button
          label="Same message, sticky off"
          tnTooltip="Datasets inherit settings from their parent. <a href='https://www.truenas.com/docs/' target='_blank' rel='noopener'>Read the docs</a>"
          [tnTooltipSticky]="false">
        </tn-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The tooltip renders in a CDK overlay, outside the story canvas.
    const overlay = within(document.body);

    await userEvent.click(canvas.getByText('Click to pin a tooltip with a link'));

    const dismiss = await overlay.findByRole('button', { name: 'Close tooltip' });
    await expect(dismiss).toBeInTheDocument();

    await userEvent.click(dismiss);
    await waitFor(() => expect(document.querySelector('.tn-tooltip')).toBeNull());
  },
  parameters: {
    docs: {
      description: {
        story: `
Tooltips disappear on \`mouseleave\`, which makes any interactive content inside them unreachable.
Sticky mode fixes that: the tooltip is pinned open, stops being click-through, and gains a dismiss
button next to the message.

**The message decides, not the input.** A tooltip is pinnable only when its message contains
something the reader can reach — in practice a link, since the message is sanitized as HTML and
form controls are stripped out of it before display. Plain help text, which is nearly every
tooltip, keeps hovering and is never pinned: pinning a sentence the reader can already see costs a
click and buys nothing. \`tnTooltipSticky\` only narrows that rule; it cannot make plain text
pinnable.

**A pinnable tooltip opens on click only.** ⚠️ This is a change in behaviour: a message with a
link no longer appears on hover or on focus at all, because a tooltip that appeared on hover and
then still had to be clicked made the user chase a target already on screen. Its host is marked
up as the control that reveals it (\`aria-expanded\`, \`aria-haspopup="dialog"\`,
\`aria-controls\`), except where the host already owns one of those for something of its own.

The click is additive, not exclusive: the host's own \`(click)\` handler still runs, so a button
that both acts and pins does both. A host that navigates away should keep its tooltip plain or
set \`[tnTooltipSticky]="false"\`.

A **disabled** host does not pin — those tooltips fall back to opening on hover, which keeps the
explanation for *why* the control is disabled visible. The link inside it stays out of reach, as
it was before pinning existed. A truly disabled control delivers no click to pin with in the first
place; \`aria-disabled\` is advisory and still dispatches one, so pinning is declined for it
deliberately rather than by accident.

The same goes for a host that is **not a control** at all (\`<span [tnTooltip]="…">\`, with no
single interactive element inside it). A pointer can click it, but nothing can focus or activate
it from the keyboard, and the click is the only way into a pinned panel — so those hosts keep
hover behaviour too, and carry no disclosure state (\`aria-expanded\` is not valid on a
\`<span>\`). Put the tooltip on the button or link itself when its message holds a link.

A pinned tooltip is dismissed by clicking the host again, by the dismiss button, by clicking
outside it, or with Escape. It is not modal and traps nothing — Tab past the dismiss button walks
back out into the page. Activating the host from the keyboard moves focus into the tooltip,
so Tab walks its content and then the dismiss button; dismissing hands focus back to the host.

\`\`\`html
<!-- pinnable: the message holds a link, so clicking the host opens it -->
<button [tnTooltip]="'See the <a href=\\'/docs\\'>docs</a>'">Help</button>

<!-- always a hover tooltip: plain text is never pinnable, with or without the input -->
<button tnTooltip="Delete">…</button>

<!-- opt a message with a link back into hover behaviour -->
<button [tnTooltip]="'See the <a href=\\'/docs\\'>docs</a>'" [tnTooltipSticky]="false">Help</button>
\`\`\`
        `,
      },
    },
  },
};

export const Positions: Story = {
  render: () => ({
    template: `
      <div style="padding: 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; align-items: center; text-align: center;">

        <!-- Above -->
        <div></div>
        <tn-button label="Tooltip above" tnTooltip="Tooltip above" tnTooltipPosition="above"></tn-button>
        <div></div>

        <!-- Left, Center, Right -->
        <tn-button label="Tooltip left" tnTooltip="Tooltip on left" tnTooltipPosition="left"></tn-button>
        <tn-button label="Default (above)" tnTooltip="Default position (above)"></tn-button>
        <tn-button label="Tooltip right" tnTooltip="Tooltip on right" tnTooltipPosition="right"></tn-button>

        <!-- Below -->
        <div></div>
        <tn-button label="Tooltip below" tnTooltip="Tooltip below" tnTooltipPosition="below"></tn-button>
        <div></div>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
};

export const WithDelays: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; gap: 20px; justify-content: center;">
        <tn-button
          label="Instant tooltip"
          tnTooltip="Shows immediately"
          [tnTooltipShowDelay]="0">
        </tn-button>

        <tn-button
          label="500ms show delay"
          tnTooltip="Shows after 500ms"
          [tnTooltipShowDelay]="500">
        </tn-button>

        <tn-button
          label="1000ms show / 500ms hide"
          tnTooltip="Shows after 1000ms and hides after 500ms"
          [tnTooltipShowDelay]="1000"
          [tnTooltipHideDelay]="500">
        </tn-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
};

export const LongContent: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; gap: 20px; justify-content: center;">
        <tn-button
          label="Long wrapping tooltip"
          tnTooltip="This is a very long tooltip message that will wrap to multiple lines and test the max-width constraint of the tooltip component">
        </tn-button>

        <tn-button
          label="Short tooltip"
          tnTooltip="Short tip">
        </tn-button>

        <tn-button
          label="Tooltip disabled"
          tnTooltip="Disabled tooltip"
          [tnTooltipDisabled]="true">
        </tn-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
};

export const OnDifferentElements: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <tn-button
          label="Tooltip on button"
          tnTooltip="Button tooltip">
        </tn-button>

        <input
          type="text"
          placeholder="Hover for tooltip"
          tnTooltip="This input has a helpful tooltip"
          style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">

        <div
          tnTooltip="Any element can have a tooltip"
          style="padding: 12px; border: 1px dashed var(--tn-lines, #e0e0e0); border-radius: 4px; cursor: help;">
          Tooltip on div element
        </div>

        <span
          tnTooltip="Even inline elements work"
          style="text-decoration: underline; cursor: help;">
          Tooltip on inline text
        </span>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
};

export const HtmlContent: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <tn-button
          label="Bold and emphasis"
          tnTooltip="<b>Online</b> &mdash; all disks <i>healthy</i>">
        </tn-button>

        <tn-button
          label="Line breaks via <br>"
          tnTooltip="Capacity: 2.5 TB<br>Used: 1.8 TB<br>Health: Online">
        </tn-button>

        <tn-button
          label="List markup"
          tnTooltip="Status:<ul style='margin:4px 0 0;padding-left:18px;'><li>Pool: tank</li><li>State: ONLINE</li></ul>">
        </tn-button>

        <tn-button
          label="Sanitized (script stripped)"
          tnTooltip="Safe text <script>alert('xss')</script> after">
        </tn-button>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
      ],
    },
  }),
  parameters: {
    docs: {
      description: {
        story: `
Tooltip content is rendered as HTML, so you can pass markup such as \`<b>\`, \`<br>\`, or lists.

\`\`\`html
<button tnTooltip="Capacity: 2.5 TB<br>Used: 1.8 TB<br>Health: <b>Online</b>">Hover me</button>
\`\`\`

Content is sanitized by Angular's built-in DOM sanitizer: \`<script>\` tags, inline event handlers, and other unsafe constructs are stripped automatically. Plain newline characters continue to render as line breaks via \`white-space: pre-line\`.
        `,
      },
    },
  },
};

export const MultiLine: Story = {
  render: () => ({
    template: `
      <div style="padding: 50px; display: flex; flex-direction: column; gap: 20px; align-items: center;">
        <tn-button
          label="Static multi-line (&#10;)"
          tnTooltip="Line 1&#10;Line 2&#10;Line 3">
        </tn-button>

        <tn-button
          label="Bound multi-line (\n)"
          [tnTooltip]="multiLineText">
        </tn-button>

        <tn-button
          label="Structured content"
          tnTooltip="Storage Pool Status:&#10;&#10;• Capacity: 2.5 TB&#10;• Used: 1.8 TB&#10;• Health: Online">
        </tn-button>

        <tn-button
          label="Wrapping + line breaks"
          tnTooltip="First line is long and will wrap naturally when it exceeds the max-width&#10;Second line is short&#10;Third line is also short">
        </tn-button>
      </div>
    `,
    props: {
      multiLineText: 'First line\nSecond line\nThird line'
    },
    moduleMetadata: {
      imports: [
        TnButtonComponent,
        TnTooltipDirective,
        TnTooltipComponent
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
<button tnTooltip="Line 1&#10;Line 2&#10;Line 3">Hover me</button>
\`\`\`

**In HTML templates (property binding):**
\`\`\`html
<button [tnTooltip]="tooltipText">Hover me</button>
\`\`\`

*Note: The Storybook controls UI doesn't support \\n escape sequences in text inputs. To test multi-line tooltips, refer to the examples shown in this story or press Enter in the control field to create actual line breaks.*
        `,
      },
    },
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
