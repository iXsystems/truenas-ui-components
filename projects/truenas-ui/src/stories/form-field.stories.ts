import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnCheckboxComponent } from '../lib/checkbox/checkbox.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnInputComponent } from '../lib/input/input.component';
import { TnRadioComponent } from '../lib/radio/radio.component';
import type { TnSelectOption } from '../lib/select/select.component';
import { TnSelectComponent } from '../lib/select/select.component';

tnIconMarker('help-circle', 'mdi');
tnIconMarker('close', 'mdi');

const harnessDoc = loadHarnessDoc('form-field');

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
    subscriptSizing: {
      control: 'radio',
      options: ['fixed', 'dynamic'],
      description: 'Controls whether the subscript area reserves space when empty. "fixed" always reserves space (prevents layout shift), "dynamic" collapses when empty.',
    },
    tooltip: {
      control: 'text',
      description: 'Optional tooltip shown via a help icon next to the label.',
    },
    tooltipPosition: {
      control: 'radio',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      description: 'Placement of the tooltip relative to its help icon.',
    },
    tooltipSticky: {
      control: 'boolean',
      description: 'Whether a tooltip message holding a link may be pinned open by clicking the help button. On by default, and only ever applies to such messages — plain field help, which is nearly every one, keeps hovering. Set it to false to force a message with a link back to hover behaviour, accepting that the link is then unreachable.',
    },
    errorMessages: {
      control: 'object',
      description: 'Per-field overrides for validation messages, keyed by error key. Values are a string or a function receiving the error detail. Takes precedence over the app-wide TN_FORM_FIELD_ERRORS resolver and the built-in defaults.',
    },
    dismissibleErrors: {
      control: 'object',
      description: 'Error keys whose message renders with a close button, and which dismissing deletes — failures the user cannot edit their way out of, such as a server-side rejection. Only the error actually being shown gets the button. Unset falls back to the app-wide TN_FORM_FIELD_DISMISSIBLE_ERRORS default; [] opts out.',
    },
    dismissAriaLabel: {
      control: 'text',
      description: 'Accessible name for the close button. The library ships no localized strings, so an app with an i18n layer passes an already-translated one.',
    },
    dismissTooltip: {
      control: 'text',
      description: 'Hover hint for the close button. Defaults to dismissAriaLabel, so one string covers both.',
    },
    dismiss: {
      action: 'dismiss',
      description: 'Emits the error key the user dismissed, after the field has already removed every key it lists in dismissibleErrors from the control. Handle it for what happens next — retrying the request, telling the server.',
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
        [testId]="testId"
        [subscriptSizing]="subscriptSizing">
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
        [testId]="testId"
        [subscriptSizing]="subscriptSizing">
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

export const LabelMarkup: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <tn-form-field [label]="label" hint="**bold**, *italic* and \`code\` are supported in labels">
          <tn-input inputType="text" placeholder="foo"></tn-input>
        </tn-form-field>
        <tn-checkbox label="I accept the **Terms of Service**"></tn-checkbox>
        <tn-radio name="markup-demo" value="a" label="Use the *default* pool"></tn-radio>
        <tn-radio name="markup-demo" value="b" label="Run \`zpool import\` manually"></tn-radio>
      </div>
    `,
    moduleMetadata: {
      imports: [TnInputComponent, TnCheckboxComponent, TnRadioComponent],
    },
  }),
  args: {
    label: 'Type **foo** below',
  },
  parameters: {
    docs: {
      description: {
        story: 'Labels accept lightweight markup: `**bold**`, `*italic*` and `` `code` ``. Markers adjacent to whitespace (e.g. `2 * 3`, `*.tar`) are left as literal text, and `\\*` escapes a marker. HTML in labels is always escaped, never rendered.',
      },
    },
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

        <div style="font-size: 1rem; color: var(--tn-fg2);">
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

export const CustomErrorMessages: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override validation messages per field with the `errorMessages` map. ' +
          'Edit the `errorMessages` control to see overrides apply — keys that do ' +
          'not match the active error (e.g. removing `required`) fall back to the ' +
          'built-in default. Values may also be functions that receive the error ' +
          'detail (e.g. `minlength: (e) => "At least " + e.requiredLength`); for ' +
          'app-wide wording or i18n, provide a `TN_FORM_FIELD_ERRORS` resolver ' +
          'instead, which per-field entries still win over.',
      },
    },
  },
  args: {
    label: 'Username',
    required: true,
    testId: 'username-field',
    errorMessages: {
      required: 'Pick a username',
      minlength: 'Use at least 4 characters',
    },
  },
  render: (args) => ({
    props: {
      ...args,
      usernameControl: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
      ]),
      markAsTouched(this: { usernameControl: FormControl }) {
        this.usernameControl.markAsTouched();
        this.usernameControl.updateValueAndValidity();
      },
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <tn-form-field
          [label]="label"
          [required]="required"
          [testId]="testId"
          [errorMessages]="errorMessages">
          <tn-input placeholder="Type 1-3 chars, then click Trigger" [formControl]="usernameControl" />
        </tn-form-field>

        <button
          type="button"
          (click)="markAsTouched()"
          style="width: fit-content; padding: 0.5rem 1rem; background: var(--tn-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Trigger Validation
        </button>

        <div style="font-size: 1rem; color: var(--tn-fg2);">
          <strong>Form State:</strong><br>
          Valid: {{ usernameControl.valid }}<br>
          Touched: {{ usernameControl.touched }}<br>
          Value: "{{ usernameControl.value }}"<br>
          Errors: {{ usernameControl.errors | json }}
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [TnInputComponent, ReactiveFormsModule, CommonModule],
    },
  }),
};

export const DismissibleServerError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A server-side rejection is not something the user can retype their way out ' +
          'of, so without a way to clear it the message sits under the field forever. ' +
          'List the key in `dismissibleErrors` and the message gets a close button.\n\n' +
          'Dismissing drops that key from the control — listing it is what grants that — ' +
          'and leaves any other errors in place. `dismiss` reports what went. Focus ' +
          'returns to the control afterwards, since dismissing a server error means ' +
          '"let me try again".\n\n' +
          'Leave the input unset to take the app-wide `TN_FORM_FIELD_DISMISSIBLE_ERRORS` ' +
          'default instead of naming keys on every field; pass `[]` to opt one out.',
      },
    },
  },
  args: {
    label: 'Pool',
    testId: 'pool-field',
    dismissibleErrors: ['manualValidateError'],
  },
  render: (args) => ({
    props: {
      ...args,
      poolControl: (() => {
        const control = new FormControl('tank');
        // What an error handler leaves behind after the API rejects the request.
        control.setErrors({ manualValidateError: 'Pool "tank" is offline — bring it up and retry' });
        control.markAsTouched();
        return control;
      })(),
      reject(this: { poolControl: FormControl }) {
        this.poolControl.setErrors({
          manualValidateError: 'Pool "tank" is offline — bring it up and retry',
        });
        this.poolControl.markAsTouched();
      },
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 400px;">
        <tn-form-field
          [label]="label"
          [testId]="testId"
          [dismissibleErrors]="dismissibleErrors">
          <tn-input [formControl]="poolControl" />
        </tn-form-field>

        <button
          type="button"
          (click)="reject()"
          style="width: fit-content; padding: 0.5rem 1rem; background: var(--tn-primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Reject again
        </button>
      </div>
    `,
    moduleMetadata: {
      imports: [TnInputComponent, ReactiveFormsModule],
    },
  }),
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
        [testId]="testId"
        [subscriptSizing]="subscriptSizing">
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

export const WithTooltip: Story = {
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
        [testId]="testId"
        [tooltip]="tooltip"
        [tooltipPosition]="tooltipPosition"
        [subscriptSizing]="subscriptSizing">
        <tn-select
          [options]="options"
          placeholder="Multi-Protocol Share">
        </tn-select>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnSelectComponent],
    },
  }),
  args: {
    label: 'Purpose',
    required: true,
    tooltip: 'Describes how this share will be accessed and what it is used for.',
    tooltipPosition: "below",
    testId: 'purpose-field',
  },
};

export const WithPinnableTooltip: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId"
        [tooltip]="tooltip"
        [tooltipPosition]="tooltipPosition"
        [tooltipSticky]="tooltipSticky"
        [subscriptSizing]="subscriptSizing">
        <tn-input placeholder="tank/dataset" />
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnInputComponent],
    },
  }),
  args: {
    label: 'Dataset',
    tooltip: 'Snapshots are read-only. <a href="https://www.truenas.com/docs/" target="_blank" rel="noopener">Read the docs</a>',
    tooltipPosition: 'above',
    tooltipSticky: true,
    testId: 'dataset-field',
  },
  parameters: {
    docs: {
      description: {
        story: `
Field help that holds a link is opened by clicking the help button rather than on hover, so the
link can be reached. \`tooltipSticky\` is the way out of that: set it to \`false\` and the message
goes back to appearing on hover, with the link out of reach. It cannot work the other way round —
plain help text is never pinnable, whatever this is set to.
`
      }
    }
  }
};

export const WithCheckbox: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field
        [label]="label"
        [hint]="hint"
        [required]="required"
        [testId]="testId"
        [tooltip]="tooltip"
        [tooltipPosition]="tooltipPosition"
        [subscriptSizing]="subscriptSizing">
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

export const CheckboxWithInlineTooltip: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field
        [tooltip]="tooltip"
        [tooltipPosition]="tooltipPosition"
        [testId]="testId"
        [subscriptSizing]="subscriptSizing">
        <tn-checkbox
          label="Enable FXP">
        </tn-checkbox>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnCheckboxComponent],
    },
  }),
  args: {
    tooltip: 'FXP allows direct server-to-server file transfers. It is disabled by default for security.',
    tooltipPosition: 'above',
    testId: 'enable-fxp-field',
  },
  parameters: {
    docs: {
      description: {
        story:
          'When no `label` is set, the tooltip help icon renders inline after the projected control '
          + 'instead of in the label row — for controls that carry their own label, like `tn-checkbox`. '
          + 'The field still surfaces validation errors and hints in the subscript area.',
      },
    },
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
        [testId]="testId"
        [subscriptSizing]="subscriptSizing">
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

        <div style="padding: 1rem; background: var(--tn-bg2); border-radius: 0.375rem; font-size: 1rem;">
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

export const SubscriptSizing: Story = {
  render: () => ({
    props: {
      fixedControl: new FormControl('', Validators.required),
      dynamicControl: new FormControl('', Validators.required),
    },
    template: `
      <div style="display: flex; gap: 2rem; max-width: 800px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
          <h4 style="margin: 0; color: var(--tn-fg1);">Fixed (reserves space)</h4>
          <tn-form-field label="Name" subscriptSizing="fixed" [required]="true">
            <tn-input [formControl]="fixedControl" placeholder="Enter name" />
          </tn-form-field>
          <tn-form-field label="No Validation" subscriptSizing="fixed">
            <tn-input placeholder="Notice space below" />
          </tn-form-field>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
          <h4 style="margin: 0; color: var(--tn-fg1);">Dynamic (collapses when empty)</h4>
          <tn-form-field label="Name" subscriptSizing="dynamic" [required]="true">
            <tn-input [formControl]="dynamicControl" placeholder="Enter name" />
          </tn-form-field>
          <tn-form-field label="No Validation" subscriptSizing="dynamic">
            <tn-input placeholder="No extra space below" />
          </tn-form-field>
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [TnInputComponent, ReactiveFormsModule],
    },
  }),
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};

/**
 * **Test IDs (default).** `tn-form-field` emits `form-field-<base>` on its
 * wrapper, under `data-testid` (default) / `data-test`. The projected control
 * carries its own id independently (set its `testId`). `testId="email"` →
 * `form-field-email`.
 */
export const TestIds: Story = {
  render: () => ({
    template: `
      <tn-testid-inspector>
        <tn-form-field testId="email" label="Email">
          <tn-input placeholder="you@example.com" />
        </tn-form-field>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, TnInputComponent, TestIdInspectorComponent] },
  }),
};

/**
 * **Scoped test id.** An array base namespaces the id —
 * `[testId]="['login','email']"` → `form-field-login-email`.
 */
export const ScopedTestIds: Story = {
  render: () => ({
    template: `
      <tn-testid-inspector>
        <tn-form-field [testId]="['login','email']" label="Email">
          <tn-input placeholder="you@example.com" />
        </tn-form-field>
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnFormFieldComponent, TnInputComponent, TestIdInspectorComponent] },
  }),
};
