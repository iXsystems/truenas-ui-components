import type { Meta, StoryObj } from '@storybook/angular';
import { IxDateInputComponent } from '../lib/ix-date-range-input/ix-date-input.component';
import { IxDateRangeInputComponent } from '../lib/ix-date-range-input/ix-date-range-input.component';
import { IxTimeInputComponent } from '../lib/ix-date-range-input/ix-time-input.component';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';

const meta: Meta = {
  title: 'Components/Date Picker',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SingleDate: Story = {
  render: () => ({
    template: `
      <ix-form-field label="Enter a date">
        <ix-date-input></ix-date-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [
        IxFormFieldComponent,
        IxDateInputComponent
      ],
    },
  }),
};

export const DateRange: Story = {
  render: () => ({
    template: `
      <ix-form-field label="Enter a date range">
        <ix-date-range-input></ix-date-range-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [
        IxFormFieldComponent,
        IxDateRangeInputComponent
      ],
    },
  }),
};

export const TimePicker: Story = {
  render: (args) => ({
    template: `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <ix-form-field label="15 minute intervals (default)">
          <ix-time-input granularity="15m"></ix-time-input>
        </ix-form-field>
        
        <ix-form-field label="30 minute intervals">
          <ix-time-input granularity="30m"></ix-time-input>
        </ix-form-field>
        
        <ix-form-field label="Hourly intervals">
          <ix-time-input granularity="1h"></ix-time-input>
        </ix-form-field>
        
        <ix-form-field label="24-hour format (hourly)">
          <ix-time-input format="24h" granularity="1h"></ix-time-input>
        </ix-form-field>
        
        <ix-form-field label="Custom placeholder">
          <ix-time-input placeholder="Select time"></ix-time-input>
        </ix-form-field>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxFormFieldComponent,
        IxTimeInputComponent
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

