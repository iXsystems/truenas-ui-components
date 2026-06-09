import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TestIdInspectorComponent } from './testid-inspector.component';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { InputType } from '../lib/enums/input-type.enum';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnInputComponent } from '../lib/input/input.component';

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
    allowDecimals: {
      control: 'boolean',
      description: 'Number type: whether decimals are accepted. Set false for integer-only mode.',
    },
    sizeStandard: {
      control: { type: 'inline-radio' },
      options: ['iec', 'si'],
      description: 'Size type: unit standard — iec (KiB/MiB, base-2) or si (kB/MB, base-10).',
    },
    sizeDefaultUnit: {
      control: 'text',
      description: 'Size type: unit assumed when the user types a bare number (e.g. MiB).',
    },
    sizeRound: {
      control: 'number',
      description: 'Size type: decimal places used when formatting the value for display.',
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

// Named NumberInteger (not Number) to pair with NumberDecimal and to avoid
// shadowing the global Number constructor in this module.
export const NumberInteger: Story = {
  render: (args) => ({
    props: {
      ...args,
      // Range enforcement is the consumer's job; these validators work because
      // tn-input emits a real number (not a string) in number mode.
      portControl: new FormControl<number | null>(443, [Validators.min(1), Validators.max(65535)]),
    },
    template: `
      <tn-form-field
        label="Port"
        hint="Integer mode — empty clears to null, value is emitted as a number">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [allowDecimals]="allowDecimals"
          [formControl]="portControl">
        </tn-input>
      </tn-form-field>
      <p style="margin-top: 12px; font-family: monospace;">
        model: {{ portControl.value === null ? 'null' : portControl.value }}
        ({{ portControl.value === null ? 'object' : 'number' }})
      </p>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    inputType: InputType.Number,
    placeholder: 'Enter a port',
    testId: 'number-input',
    disabled: false,
    allowDecimals: false,
  },
};

export const NumberDecimal: Story = {
  render: (args) => ({
    props: {
      ...args,
      // Decimal mode (the default) accepts a single '.' and emits via parseFloat.
      weightControl: new FormControl<number | null>(1.5, [Validators.min(0)]),
    },
    template: `
      <tn-form-field
        label="Weight (kg)"
        hint="Decimal mode — accepts a single decimal point; empty clears to null">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [allowDecimals]="allowDecimals"
          [formControl]="weightControl">
        </tn-input>
      </tn-form-field>
      <p style="margin-top: 12px; font-family: monospace;">
        model: {{ weightControl.value === null ? 'null' : weightControl.value }}
        ({{ weightControl.value === null ? 'object' : 'number' }})
      </p>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    inputType: InputType.Number,
    placeholder: 'Enter a weight',
    testId: 'number-decimal-input',
    disabled: false,
    allowDecimals: true,
  },
};

/**
 * **Size mode.** The form model holds a raw byte count; the field displays and
 * accepts a human-readable string (`2 GiB`, `500M`, `2 TB`). Bare numbers use
 * `sizeDefaultUnit`. The display canonicalizes on blur (`2048 KiB` → `2 MiB`).
 */
export const Size: Story = {
  render: (args) => ({
    props: {
      ...args,
      // The model is bytes; 200 TiB shown below as the initial human-readable value.
      sizeControl: new FormControl<number | null>(200 * 1024 ** 4, [Validators.min(0)]),
    },
    template: `
      <tn-form-field
        label="Local User Upload Bandwidth"
        hint="Examples: 500 KiB, 500M, 2 TB">
        <tn-input
          [inputType]="inputType"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [testId]="testId"
          [sizeStandard]="sizeStandard"
          [sizeDefaultUnit]="sizeDefaultUnit"
          [sizeRound]="sizeRound"
          [formControl]="sizeControl">
        </tn-input>
      </tn-form-field>
      <p style="margin-top: 12px; font-family: monospace;">
        model (bytes): {{ sizeControl.value === null ? 'null' : sizeControl.value }}
        ({{ sizeControl.value === null ? 'object' : 'number' }})
      </p>
    `,
    moduleMetadata: {
      imports: [TnFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    inputType: InputType.Size,
    placeholder: 'e.g. 2 GiB',
    testId: 'size-input',
    disabled: false,
    sizeStandard: 'iec',
    sizeDefaultUnit: 'MiB',
    sizeRound: 2,
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
      handleSuffixAction: () => {},
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
      handleSuffixAction: () => {},
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

/**
 * **Test IDs (default).** `tn-input` emits the `input-` prefix on the native
 * `<input>` (or `textarea-` on the `<textarea>` in multiline mode), under
 * `data-testid` (default) / `data-test`. `testId="username"` → `input-username`.
 * With no `testId`, nothing is emitted. Table read live.
 */
export const TestIds: Story = {
  args: { testId: 'username' },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-input placeholder="Username" [testId]="testId" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnInputComponent, TestIdInspectorComponent] },
  }),
};

/**
 * **Scoped test id.** An array base namespaces the id —
 * `[testId]="['login-form','username']"` → `input-login-form-username`.
 */
export const ScopedTestIds: Story = {
  args: { testId: ['login-form', 'username'] },
  render: (args) => ({
    props: args,
    template: `
      <tn-testid-inspector>
        <tn-input placeholder="Username" [testId]="testId" />
      </tn-testid-inspector>
    `,
    moduleMetadata: { imports: [TnInputComponent, TestIdInspectorComponent] },
  }),
};
