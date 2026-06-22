import { ReactiveFormsModule, FormControl } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnSliderThumbDirective } from '../lib/slider/slider-thumb.directive';
import { TnSliderWithLabelDirective } from '../lib/slider/slider-with-label.directive';
import type { LabelType } from '../lib/slider/slider.component';
import { TnSliderComponent } from '../lib/slider/slider.component';
import { TnTooltipComponent } from '../lib/tooltip/tooltip.component';

const meta: Meta<TnSliderComponent> = {
  title: 'Components/Slider',
  component: TnSliderComponent,
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
type Story = StoryObj<TnSliderComponent>;

export const Default: Story = {
  render: (args) => ({
    template: `
      <tn-form-field label="Speed Control">
        <tn-slider 
          [min]="min"
          [max]="max" 
          [step]="step"
          [disabled]="disabled"
          [labelType]="labelType"
          [labelPrefix]="labelPrefix"
          [labelSuffix]="labelSuffix">
          <input tnSliderThumb value="50">
        </tn-slider>
      </tn-form-field>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        TnFormFieldComponent,
        TnSliderComponent,
        TnSliderThumbDirective,
        TnSliderWithLabelDirective,
        TnTooltipComponent
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

/**
 * **Reactive form binding.** Binds a `FormControl` to the inner
 * `input[tnSliderThumb]`. The slider adopts the control's initial value on init
 * and the thumb/track fill reflect it; dragging or clicking writes back to the
 * control. Live value shown below the slider.
 */
export const ReactiveForm: Story = {
  render: () => {
    const control = new FormControl(35);
    return {
      props: { control },
      template: `
        <tn-slider [min]="0" [max]="100" [step]="5" labelType="both" labelSuffix="%">
          <input tnSliderThumb [formControl]="control">
        </tn-slider>
        <p>Value: {{ control.value }}</p>
      `,
      moduleMetadata: {
        imports: [ReactiveFormsModule, TnSliderComponent, TnSliderThumbDirective],
      },
    };
  },
};

/**
 * **Test IDs (default).** `tn-slider` emits the `slider-` prefix on its
 * container (which owns the track-click handlers), under `data-testid`
 * (default) / `data-test`. `testId="volume"` → `slider-volume`. With no
 * `testId`, nothing is emitted. Table read live.
 */
export const TestIds: Story = {
  args: { testId: 'volume' },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-slider [min]="0" [max]="100" [testId]="testId">
          <input tnSliderThumb value="50">
        </tn-slider>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnSliderComponent, TnSliderThumbDirective, TestIdInspectorComponent] },
  }),
};

/**
 * **Scoped test id.** An array base namespaces the id —
 * `[testId]="['audio','volume']"` → `slider-audio-volume`.
 */
export const ScopedTestIds: Story = {
  args: { testId: ['audio', 'volume'] },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-slider [min]="0" [max]="100" [testId]="testId">
          <input tnSliderThumb value="50">
        </tn-slider>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnSliderComponent, TnSliderThumbDirective, TestIdInspectorComponent] },
  }),
};



