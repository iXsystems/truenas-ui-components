import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnCheckboxComponent } from '../lib/checkbox/checkbox.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';
import { TnRadioComponent } from '../lib/radio/radio.component';
import type { TnSelectOption } from '../lib/select/select.component';
import { TnSelectComponent } from '../lib/select/select.component';

const meta: Meta<TnFormFieldComponent> = {
  title: 'Components/Form Field',
  component: TnFormFieldComponent,
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
type Story = StoryObj<TnFormFieldComponent>;

const selectOptions: TnSelectOption[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const BasicInput: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <tn-input
          inputType="text"
          placeholder="Enter your name">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnInputComponent],
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
      <tn-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <tn-input
          inputType="email"
          placeholder="Enter your email address">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnInputComponent],
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
        <tn-form-field 
          [label]="label"
          [hint]="hint"
          [required]="required"
          [testId]="testId">
          <tn-input
            inputType="email"
            placeholder="Enter your email address"
            [formControl]="emailControl">
          </tn-input>
        </tn-form-field>
        
        <button 
          type="button" 
          (click)="markAsTouched()"
          style="width: fit-content; padding: 0.5rem 1rem; background: var(--tn-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Trigger Validation
        </button>
        
        <div style="font-size: 0.875rem; color: var(--tn-fg2);">
          <strong>Form State:</strong><br>
          Valid: {{ emailControl.valid }}<br>
          Touched: {{ emailControl.touched }}<br>
          Value: "{{ emailControl.value }}"
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [TnInputComponent, ReactiveFormsModule],
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
      <tn-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <tn-select
          [options]="options"
          placeholder="Choose a size">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnSelectComponent],
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
      <tn-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <tn-checkbox
          label="I agree to the terms and conditions">
        </tn-checkbox>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnCheckboxComponent],
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
      <tn-form-field 
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <tn-radio
            name="priority"
            value="low"
            label="Low Priority">
          </tn-radio>
          <tn-radio
            name="priority"
            value="normal"
            label="Normal Priority">
          </tn-radio>
          <tn-radio
            name="priority"
            value="high"
            label="High Priority">
          </tn-radio>
        </div>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnRadioComponent],
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
        <h3 style="margin: 0; color: var(--tn-fg1);">User Information Form</h3>
        
        <tn-form-field 
          label="Full Name"
          hint="Enter your first and last name"
          [required]="true">
          <tn-input
            inputType="text"
            placeholder="John Doe"
            [formControl]="userForm.name">
          </tn-input>
        </tn-form-field>

        <tn-form-field 
          label="Email Address"
          hint="We'll use this to contact you"
          [required]="true">
          <tn-input
            inputType="email"
            placeholder="john@example.com"
            [formControl]="userForm.email">
          </tn-input>
        </tn-form-field>

        <tn-form-field 
          label="Preferred Size"
          hint="Choose your preferred option size">
          <tn-select
            [options]="options"
            placeholder="Select size"
            [formControl]="userForm.size">
          </tn-select>
        </tn-form-field>

        <tn-form-field 
          label="Notifications"
          hint="Receive email notifications about updates">
          <tn-checkbox
            label="Enable email notifications"
            [formControl]="userForm.notifications">
          </tn-checkbox>
        </tn-form-field>

        <tn-form-field 
          label="Priority Level"
          hint="How important is this request?">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <tn-radio
              name="priority"
              value="low"
              label="Low - Can wait"
              [formControl]="userForm.priority">
            </tn-radio>
            <tn-radio
              name="priority"
              value="normal"
              label="Normal - Standard timeline"
              [formControl]="userForm.priority">
            </tn-radio>
            <tn-radio
              name="priority"
              value="high"
              label="High - Urgent"
              [formControl]="userForm.priority">
            </tn-radio>
          </div>
        </tn-form-field>

        <div style="padding: 1rem; background: var(--tn-bg2); border-radius: 0.375rem; font-size: 0.875rem;">
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
        TnInputComponent, 
        TnSelectComponent, 
        TnCheckboxComponent, 
        TnRadioComponent, 
        ReactiveFormsModule,
        CommonModule
      ],
    },
  }),
  args: {},
};