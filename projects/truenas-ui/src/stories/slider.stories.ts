import type { Meta, StoryObj } from '@storybook/angular';
import { IxFormFieldComponent } from '../lib/form-field/form-field.component';
import { IxSliderThumbDirective } from '../lib/slider/slider-thumb.directive';
import { IxSliderWithLabelDirective } from '../lib/slider/slider-with-label.directive';
import type { LabelType } from '../lib/slider/slider.component';
import { IxSliderComponent } from '../lib/slider/slider.component';
import { IxTooltipComponent } from '../lib/tooltip/tooltip.component';

const meta: Meta<IxSliderComponent> = {
  title: 'Components/Slider',
  component: IxSliderComponent,
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: { type: 'number' },
      description: 'Minimum value'
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value'
    },
    step: {
      control: { type: 'number' },
      description: 'Step increment'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the slider'
    },
    labelType: {
      control: { type: 'select' },
      options: ['none', 'handle', 'track', 'both'] as LabelType[],
      description: 'Label display type: none (no label), handle (tooltip on thumb), track (fixed position above track), both (track label + handle tooltip)'
    },
    labelPrefix: {
      control: 'text',
      description: 'Prefix to display before the value (e.g., "$")'
    },
    labelSuffix: {
      control: 'text',
      description: 'Suffix to display after the value (e.g., "°C")'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
The IX Slider component provides an interactive range input with customizable styling and label options. Configure custom ranges by setting min/max/step properties, and choose from four label display types:

- **none**: No label displayed
- **handle**: Tooltip appears on the thumb during interaction
- **track**: Fixed label displayed above the slider track
- **both**: Combines track label (always visible) with handle tooltip (on interaction)

Use labelPrefix and labelSuffix to add units or currency symbols to the displayed value.
        `
      }
    },
    controls: {
      expanded: true
    }
  },
};

export default meta;
type Story = StoryObj<IxSliderComponent>;

export const Default: Story = {
  render: (args) => ({
    template: `
      <ix-form-field label="Speed Control">
        <ix-slider 
          [min]="min"
          [max]="max" 
          [step]="step"
          [disabled]="disabled"
          [labelType]="labelType"
          [labelPrefix]="labelPrefix"
          [labelSuffix]="labelSuffix">
          <input ixSliderThumb value="50">
        </ix-slider>
      </ix-form-field>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        IxFormFieldComponent,
        IxSliderComponent,
        IxSliderThumbDirective,
        IxSliderWithLabelDirective,
        IxTooltipComponent
      ],
    },
  }),
  args: {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    labelType: 'both' as LabelType,
    labelPrefix: '',
    labelSuffix: ' km/h'
  }
};



