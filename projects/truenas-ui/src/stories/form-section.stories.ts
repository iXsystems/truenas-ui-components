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
