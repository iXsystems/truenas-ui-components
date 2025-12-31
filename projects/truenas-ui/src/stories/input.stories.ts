import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { InputType } from '../lib/enums/input-type.enum';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';

const meta: Meta<TnInputComponent> = {
  title: 'Components/Input',
  component: TnInputComponent,
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
type Story = StoryObj<TnInputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field 
        label="Full Name"
        hint="Enter your first and last name">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [multiline]="multiline"
          [rows]="rows">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
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
      <tn-form-field 
        label="Email Address"
        hint="Must be a valid email format"
        [required]="true">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [formControl]="emailControl">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
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
      <tn-form-field 
        label="Comments"
        hint="Share your thoughts or feedback">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [multiline]="multiline"
          [rows]="rows">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
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
      <tn-form-field 
        label="Disabled Input"
        hint="This input is disabled">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'This field is disabled',
    testId: 'disabled-input',
    disabled: true,
  },
};
