import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { InputType } from '../lib/enums/input-type.enum';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';
import { tnIconMarker } from '../lib/icon/icon-marker';

const harnessDoc = loadHarnessDoc('input');

// Mark icons for sprite generation
tnIconMarker('magnify', 'mdi');
tnIconMarker('close-circle', 'mdi');
tnIconMarker('email', 'mdi');
tnIconMarker('eye', 'mdi');
tnIconMarker('eye-off', 'mdi');

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
    prefixIcon: {
      control: 'text',
      description: 'Icon name for the prefix icon',
    },
    prefixIconLibrary: {
      control: { type: 'select' },
      options: ['mdi', 'material', 'custom', 'lucide'],
      description: 'Icon library for the prefix icon',
    },
    suffixIcon: {
      control: 'text',
      description: 'Icon name for the suffix action button',
    },
    suffixIconLibrary: {
      control: { type: 'select' },
      options: ['mdi', 'material', 'custom', 'lucide'],
      description: 'Icon library for the suffix action button',
    },
    suffixIconAriaLabel: {
      control: 'text',
      description: 'Aria label for the suffix action button',
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

export const WithPrefixIcon: Story = {
  render: (args) => ({
    props: args,
    template: `
      <tn-form-field
        label="Search"
        hint="Search for items">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [testId]="testId"
          [prefixIcon]="prefixIcon"
          [prefixIconLibrary]="prefixIconLibrary">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'Search...',
    testId: 'prefix-icon-input',
    prefixIcon: 'magnify',
    prefixIconLibrary: 'mdi' as const,
  },
};

export const WithSuffixAction: Story = {
  render: (args) => ({
    props: {
      ...args,
      handleSuffixAction: () => console.log('Suffix action clicked'),
    },
    template: `
      <tn-form-field
        label="Clearable Input"
        hint="Click the X to clear">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [testId]="testId"
          [suffixIcon]="suffixIcon"
          [suffixIconLibrary]="suffixIconLibrary"
          [suffixIconAriaLabel]="suffixIconAriaLabel"
          (onSuffixAction)="handleSuffixAction()">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.PlainText,
    placeholder: 'Type something...',
    testId: 'suffix-action-input',
    suffixIcon: 'close-circle',
    suffixIconLibrary: 'mdi' as const,
    suffixIconAriaLabel: 'Clear input',
  },
};

export const WithPrefixAndSuffix: Story = {
  render: (args) => ({
    props: {
      ...args,
      handleSuffixAction: () => console.log('Suffix action clicked'),
    },
    template: `
      <tn-form-field
        label="Email Address"
        hint="Enter your email">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [testId]="testId"
          [prefixIcon]="prefixIcon"
          [prefixIconLibrary]="prefixIconLibrary"
          [suffixIcon]="suffixIcon"
          [suffixIconLibrary]="suffixIconLibrary"
          [suffixIconAriaLabel]="suffixIconAriaLabel"
          (onSuffixAction)="handleSuffixAction()">
        </tn-input>
      </tn-form-field>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent],
    },
  }),
  args: {
    inputType: InputType.Email,
    placeholder: 'you@example.com',
    testId: 'prefix-suffix-input',
    prefixIcon: 'email',
    prefixIconLibrary: 'mdi' as const,
    suffixIcon: 'close-circle',
    suffixIconLibrary: 'mdi' as const,
    suffixIconAriaLabel: 'Clear email',
  },
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
