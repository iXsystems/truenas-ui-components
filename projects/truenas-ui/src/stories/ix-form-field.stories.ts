import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxInputComponent } from '../lib/ix-input/ix-input.component';
import { IxSelectComponent, IxSelectOption } from '../lib/ix-select/ix-select.component';
import { IxCheckboxComponent } from '../lib/ix-checkbox/ix-checkbox.component';
import { IxRadioComponent } from '../lib/ix-radio/ix-radio.component';
import { InputType } from '../lib/enums/input-type.enum';

const meta: Meta<IxFormFieldComponent> = {
  title: 'Components/Form Field',
  component: IxFormFieldComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Form Field component provides a consistent wrapper for form controls with labels, hints, and error handling.

## Features

- **Labels**: Required and optional field labels
- **Hints**: Helpful text to guide users
- **Error Messages**: Automatic validation error display
- **Accessibility**: Proper ARIA relationships
- **Consistency**: Uniform styling across all form controls

## Integration

The form field automatically detects and works with any component that implements \`ControlValueAccessor\`:
- Input components
- Select dropdowns  
- Checkboxes and radio buttons
- Custom form controls

## Form Validation

When used with Angular reactive forms, the form field automatically:
- Shows/hides error messages based on form control state
- Displays hints when there are no errors
- Provides standard error messages for common validation rules
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the form field',
    },
    hint: {
      control: 'text',
      description: 'Hint text shown below the control',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required (shows asterisk)',
    },
    testId: {
      control: 'text',
      description: 'Test ID for automated testing',
    },
  },
};

export default meta;
type Story = StoryObj<IxFormFieldComponent>;

const selectOptions: IxSelectOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const BasicInput: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <ix-input
          inputType="text"
          placeholder="Enter your name">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxInputComponent],
    },
  }),
  args: {
    label: 'Full Name',
    hint: 'Enter your first and last name',
    required: false,
    testId: 'name-field',
  },
};

export const RequiredField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <ix-input
          inputType="email"
          placeholder="Enter your email address">
        </ix-input>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxInputComponent],
    },
  }),
  args: {
    label: 'Email Address',
    hint: 'We will never share your email with anyone',
    required: true,
    testId: 'email-field',
  },
};

export const WithValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      emailControl: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      markAsTouched: function() {
        this['emailControl'].markAsTouched();
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <ix-form-field 
          [label]="label"
          [hint]="hint"
          [required]="required"
          [testId]="testId">
          <ix-input
            inputType="email"
            placeholder="Enter your email address"
            [formControl]="emailControl">
          </ix-input>
        </ix-form-field>
        
        <button 
          type="button" 
          (click)="markAsTouched()"
          style="width: fit-content; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Trigger Validation
        </button>
        
        <div style="font-size: 0.875rem; color: var(--fg2);">
          <strong>Form State:</strong><br>
          Valid: {{ emailControl.valid }}<br>
          Touched: {{ emailControl.touched }}<br>
          Value: "{{ emailControl.value }}"
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [IxInputComponent, ReactiveFormsModule],
    },
  }),
  args: {
    label: 'Email Address',
    hint: 'Must be a valid email format',
    required: true,
    testId: 'validation-field',
  },
};

export const WithSelect: Story = {
  render: (args) => ({
    props: {
      ...args,
      options: selectOptions,
    },
    template: `
      <ix-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <ix-select
          [options]="options"
          placeholder="Choose a size">
        </ix-select>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxSelectComponent],
    },
  }),
  args: {
    label: 'Size',
    hint: 'Select the appropriate size for your needs',
    required: false,
    testId: 'size-field',
  },
};

export const WithCheckbox: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <ix-checkbox
          label="I agree to the terms and conditions">
        </ix-checkbox>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxCheckboxComponent],
    },
  }),
  args: {
    label: 'Agreement',
    hint: 'Please review our terms before proceeding',
    required: true,
    testId: 'terms-field',
  },
};

export const WithRadioGroup: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <ix-radio
            name="priority"
            value="low"
            label="Low Priority">
          </ix-radio>
          <ix-radio
            name="priority"
            value="normal"
            label="Normal Priority">
          </ix-radio>
          <ix-radio
            name="priority"
            value="high"
            label="High Priority">
          </ix-radio>
        </div>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxRadioComponent],
    },
  }),
  args: {
    label: 'Priority Level',
    hint: 'Choose the priority level for this task',
    required: false,
    testId: 'priority-field',
  },
};

export const MultipleFields: Story = {
  render: (args) => ({
    props: {
      ...args,
      userForm: {
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        size: new FormControl(''),
        notifications: new FormControl(false),
        priority: new FormControl('')
      },
      options: selectOptions,
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px;">
        <h3 style="margin: 0; color: var(--fg1);">User Information Form</h3>
        
        <ix-form-field 
          label="Full Name"
          hint="Enter your first and last name"
          [required]="true">
          <ix-input
            inputType="text"
            placeholder="John Doe"
            [formControl]="userForm.name">
          </ix-input>
        </ix-form-field>

        <ix-form-field 
          label="Email Address"
          hint="We'll use this to contact you"
          [required]="true">
          <ix-input
            inputType="email"
            placeholder="john@example.com"
            [formControl]="userForm.email">
          </ix-input>
        </ix-form-field>

        <ix-form-field 
          label="Preferred Size"
          hint="Choose your preferred option size">
          <ix-select
            [options]="options"
            placeholder="Select size"
            [formControl]="userForm.size">
          </ix-select>
        </ix-form-field>

        <ix-form-field 
          label="Notifications"
          hint="Receive email notifications about updates">
          <ix-checkbox
            label="Enable email notifications"
            [formControl]="userForm.notifications">
          </ix-checkbox>
        </ix-form-field>

        <ix-form-field 
          label="Priority Level"
          hint="How important is this request?">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <ix-radio
              name="priority"
              value="low"
              label="Low - Can wait"
              [formControl]="userForm.priority">
            </ix-radio>
            <ix-radio
              name="priority"
              value="normal"
              label="Normal - Standard timeline"
              [formControl]="userForm.priority">
            </ix-radio>
            <ix-radio
              name="priority"
              value="high"
              label="High - Urgent"
              [formControl]="userForm.priority">
            </ix-radio>
          </div>
        </ix-form-field>

        <div style="padding: 1rem; background: var(--bg2); border-radius: 0.375rem; font-size: 0.875rem;">
          <strong>Form Values:</strong><br>
          Name: "{{ userForm.name.value }}"<br>
          Email: "{{ userForm.email.value }}"<br>
          Size: "{{ userForm.size.value }}"<br>
          Notifications: {{ userForm.notifications.value }}<br>
          Priority: "{{ userForm.priority.value }}"<br><br>
          <strong>Form Valid:</strong> {{ userForm.name.valid && userForm.email.valid }}
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [
        IxInputComponent, 
        IxSelectComponent, 
        IxCheckboxComponent, 
        IxRadioComponent, 
        ReactiveFormsModule,
        CommonModule
      ],
    },
  }),
  args: {},
};