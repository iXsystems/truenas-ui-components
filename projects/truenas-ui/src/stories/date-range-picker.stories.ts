import type { Meta, StoryObj } from '@storybook/angular';
import { TnDateInputComponent } from '../lib/date-range-input/date-input.component';
import { TnDateRangeInputComponent } from '../lib/date-range-input/date-range-input.component';
import { TnTimeInputComponent } from '../lib/date-range-input/time-input.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

const meta: Meta = {
  title: 'Components/Date Picker',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SingleDate: Story = {
  render: () => ({
    template: `
      <tn-form-field label="Enter a date">
        <tn-date-input></tn-date-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [
        TnFormFieldComponent,
        TnDateInputComponent
      ],
    },
  }),
};

export const DateRange: Story = {
  render: () => ({
    template: `
      <tn-form-field label="Enter a date range">
        <tn-date-range-input></tn-date-range-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [
        TnFormFieldComponent,
        TnDateRangeInputComponent
      ],
    },
  }),
};

export const TimePicker: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <tn-form-field label="15 minute intervals (default)">
          <tn-time-input granularity="15m"></tn-time-input>
        </tn-form-field>
        
        <tn-form-field label="30 minute intervals">
          <tn-time-input granularity="30m"></tn-time-input>
        </tn-form-field>
        
        <tn-form-field label="Hourly intervals">
          <tn-time-input granularity="1h"></tn-time-input>
        </tn-form-field>
        
        <tn-form-field label="24-hour format (hourly)">
          <tn-time-input format="24h" granularity="1h"></tn-time-input>
        </tn-form-field>
        
        <tn-form-field label="Custom placeholder">
          <tn-time-input placeholder="Select time"></tn-time-input>
        </tn-form-field>
      </div>
    `,
    moduleMetadata: {
      imports: [
        TnFormFieldComponent,
        TnTimeInputComponent
      ],
    },
  }),
  argTypes: {
    format: {
      control: { type: 'select' },
      options: ['12h', '24h'],
      description: 'Time format'
    },
    granularity: {
      control: { type: 'select' },
      options: ['15m', '30m', '1h'],
      description: 'Time interval granularity'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no time is selected'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the time picker'
    }
  },
  args: {
    format: '12h',
    granularity: '15m',
    placeholder: 'Pick a time',
    disabled: false
  }
};

