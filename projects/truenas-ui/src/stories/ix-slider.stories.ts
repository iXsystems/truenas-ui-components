import type { Meta, StoryObj } from '@storybook/angular';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxSliderComponent } from '../lib/ix-slider/ix-slider.component';
import { IxSliderThumbDirective } from '../lib/ix-slider/ix-slider-thumb.directive';
import { IxSliderWithLabelDirective } from '../lib/ix-slider/ix-slider-with-label.directive';
import { IxTooltipComponent } from '../lib/ix-tooltip/ix-tooltip.component';

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
    }
  },
};

export default meta;
type Story = StoryObj<IxSliderComponent>;

export const Default: Story = {
  render: (args) => ({
    template: `
      <ix-form-field label="Volume">
        <ix-slider 
          [min]="min"
          [max]="max" 
          [step]="step"
          [disabled]="disabled">
          <input ixSliderThumb>
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
    disabled: false
  }
};

export const CustomRange: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <ix-form-field label="Temperature (°C)">
          <ix-slider [min]="-10" [max]="40" [step]="1">
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
        
        <ix-form-field label="Price ($)">
          <ix-slider [min]="0" [max]="1000" [step]="10">
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
        
        <ix-form-field label="Opacity">
          <ix-slider [min]="0" [max]="1" [step]="0.1">
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
        
        <ix-form-field label="Disabled slider">
          <ix-slider [min]="0" [max]="100" [disabled]="true">
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
      </div>
    `,
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
};

export const WithLabel: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 40px; flex-direction: column; padding: 40px;">
        <ix-form-field label="Volume with label">
          <ix-slider [min]="0" [max]="100" [step]="1" ixSliderWithLabel>
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
        
        <ix-form-field label="Temperature (°C) with label">
          <ix-slider [min]="-10" [max]="40" [step]="1" labelSuffix="°C" ixSliderWithLabel>
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
        
        <ix-form-field label="Price ($) with label">
          <ix-slider [min]="0" [max]="1000" [step]="10" labelPrefix="$" ixSliderWithLabel>
            <input ixSliderThumb>
          </ix-slider>
        </ix-form-field>
      </div>
    `,
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
};