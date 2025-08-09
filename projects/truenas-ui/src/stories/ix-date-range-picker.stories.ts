import type { Meta, StoryObj } from '@storybook/angular';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxDateRangeInputComponent } from '../lib/ix-date-range-input/ix-date-range-input.component';
import { IxDateInputComponent } from '../lib/ix-date-range-input/ix-date-input.component';

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

