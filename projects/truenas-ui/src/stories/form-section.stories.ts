import type { Meta, StoryObj } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnFormSectionComponent } from '../lib/form-section/form-section.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnInputComponent } from '../lib/input/input.component';

// Mark the help icon for sprite generation (rendered for the tooltip).
tnIconMarker('help-circle', 'mdi');

// Load harness documentation for the Docs tab.
const harnessDoc = loadHarnessDoc('form-section');

const meta: Meta<TnFormSectionComponent> = {
  title: 'Components/FormSection',
  component: TnFormSectionComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Semantic grouping for a related set of form fields. Renders a native `<fieldset>` with an optional `<legend>` heading and help tooltip, and projects its content unchanged. Compose `tn-form-field` controls inside it.',
      },
    },
  },
  argTypes: {
    heading: {
      control: 'text',
      description: 'Legend heading. Supports lightweight label markup (**bold**, *italic*, `code`).',
    },
    tooltip: {
      control: 'text',
      description: 'Optional help tooltip shown via an icon next to the heading.',
    },
    tooltipPosition: {
      control: 'select',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      description: 'Placement of the tooltip relative to its help icon.',
    },
    tooltipSticky: {
      control: 'boolean',
      description: 'Whether a tooltip message holding a link may be pinned open by clicking the help button. On by default, and only ever applies to such messages — plain section help, which is nearly every one, keeps hovering. Set it to false to force a message with a link back to hover behaviour, accepting that the link is then unreachable.',
    },
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [TnFormFieldComponent, TnInputComponent],
    },
    template: `
      <tn-form-section
        [heading]="heading"
        [tooltip]="tooltip"
        [tooltipPosition]="tooltipPosition"
        [tooltipSticky]="tooltipSticky"
      >
        <tn-form-field label="Hostname">
          <tn-input placeholder="truenas.local" />
        </tn-form-field>
        <tn-form-field label="Domain">
          <tn-input placeholder="local" />
        </tn-form-field>
      </tn-form-section>
    `,
  }),
};

export default meta;
type Story = StoryObj<TnFormSectionComponent>;

export const Default: Story = {
  args: {
    heading: 'Network Settings',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Network Settings')).toBeInTheDocument();
  },
};

export const WithTooltip: Story = {
  args: {
    heading: 'Network Settings',
    tooltip: 'These settings control how the interface reaches the network.',
  },
};

export const WithPinnableTooltip: Story = {
  args: {
    heading: 'Network Settings',
    tooltip: 'Bridges cannot be edited while the interface is up. <a href="https://www.truenas.com/docs/" target="_blank" rel="noopener">Read the docs</a>',
    tooltipSticky: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
Section help that holds a link is opened by clicking the help button rather than on hover, so the
link can be reached. \`tooltipSticky\` is the way out of that: set it to \`false\` and the message
goes back to appearing on hover, with the link out of reach. It cannot work the other way round —
plain help text is never pinnable, whatever this is set to.
`
      }
    }
  }
};

export const MarkupHeading: Story = {
  args: {
    heading: 'Advanced **DNS** settings',
  },
};

export const NoHeading: Story = {
  args: {
    heading: '',
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
