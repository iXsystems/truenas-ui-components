import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { InputType } from '../lib/enums/input-type.enum';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxInputComponent } from '../lib/ix-input/ix-input.component';

const meta: Meta<IxInputComponent> = {
  title: 'Components/Input',
  component: IxInputComponent,
  tags: ['autodocs'],
  argTypes: {
    inputType: {
      control: { type: 'select' },
      options: Object.values(InputType),
      description: 'Type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    multiline: {
      control: 'boolean',
      description: 'Whether to render as textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of rows for textarea',
    },
    testId: {
      control: 'text',
      description: 'Test ID for the input component',
    },
  },
};

export default meta;
type Story = StoryObj<IxInputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        label="Full Name"
        hint="Enter your first and last name">
        <ix-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [multiline]="multiline"
          [rows]="rows">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'Enter your full name',
    testId: 'default-input',
    disabled: false,
    multiline: false,
    rows: 3,
  },
};

export const WithError: Story = {
  render: (args) => ({
    props: {
      ...args,
      emailControl: new FormControl('invalid-email', { 
        validators: [(control) => {
          const email = control.value;
          if (!email || !email.includes('@')) {
            return { email: true };
          }
          return null;
        }]
      })
    },
    template: `
      <ix-form-field 
        label="Email Address"
        hint="Must be a valid email format"
        [required]="true">
        <ix-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [formControl]="emailControl">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    inputType: InputType.Email,
    placeholder: 'Enter your email',
    testId: 'error-input',
    disabled: false,
  },
};

export const Multiline: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        label="Comments"
        hint="Share your thoughts or feedback">
        <ix-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [multiline]="multiline"
          [rows]="rows">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'Enter your comments here...',
    testId: 'multiline-input',
    disabled: false,
    multiline: true,
    rows: 4,
  },
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        label="Disabled Input"
        hint="This input is disabled">
        <ix-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'This field is disabled',
    testId: 'disabled-input',
    disabled: true,
  },
};
