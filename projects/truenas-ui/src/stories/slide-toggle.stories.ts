import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxFormFieldComponent } from '../lib/form-field/form-field.component';
import { IxSlideToggleComponent } from '../lib/slide-toggle/slide-toggle.component';

const meta: Meta<IxSlideToggleComponent> = {
  title: 'Components/Slide Toggle',
  component: IxSlideToggleComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A slide toggle component based on Angular Material design patterns. Provides a switch-like control for boolean values.

## Features

- **Material Design**: Follows Material Design toggle switch specifications
- **Form Integration**: Implements ControlValueAccessor for seamless form integration
- **Accessibility**: Full keyboard navigation and screen reader support
- **Color Themes**: Primary, accent, and warn color variants
- **Label Positioning**: Flexible label placement (before/after)
- **Animations**: Smooth transitions and hover effects
- **Touch Support**: Optimized for touch interfaces

## Usage

The slide toggle can be used standalone or integrated with reactive forms. It supports all standard form control features including validation and disabled states.
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed next to the toggle',
    },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
      description: 'Position of the label relative to the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the toggle is required in forms',
    },
    color: {
      control: 'select',
      options: ['primary', 'accent', 'warn'],
      description: 'Color theme of the toggle',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers',
    },
    testId: {
      control: 'text',
      description: 'Test ID for automated testing',
    },
    change: {
      action: 'change',
      description: 'Emitted when toggle state changes',
    },
    toggleChange: {
      action: 'toggleChange',
      description: 'Emitted when toggle state changes (alias for change)',
    },
  },
};

export default meta;
type Story = StoryObj<IxSlideToggleComponent>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'primary',
  },
};

export const Checked: Story = {
  render: (args) => ({
    props: {
      ...args,
      checked: true,
    },
    template: `
      <ix-slide-toggle 
        [label]="label"
        [labelPosition]="labelPosition"
        [disabled]="disabled"
        [required]="required"
        [color]="color"
        [checked]="checked"
        [testId]="testId"
        (change)="change($event)"
        (toggleChange)="toggleChange($event)">
      </ix-slide-toggle>
    `,
  }),
  args: {
    label: 'Feature enabled',
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled toggle',
    labelPosition: 'after',
    disabled: true,
    required: false,
    color: 'primary',
  },
};

export const DisabledChecked: Story = {
  render: (args) => ({
    props: {
      ...args,
      checked: true,
    },
    template: `
      <ix-slide-toggle 
        [label]="label"
        [labelPosition]="labelPosition"
        [disabled]="disabled"
        [required]="required"
        [color]="color"
        [checked]="checked"
        [testId]="testId"
        (change)="change($event)"
        (toggleChange)="toggleChange($event)">
      </ix-slide-toggle>
    `,
  }),
  args: {
    label: 'Disabled but checked',
    labelPosition: 'after',
    disabled: true,
    required: false,
    color: 'primary',
  },
};

export const LabelBefore: Story = {
  args: {
    label: 'Label positioned before',
    labelPosition: 'before',
    disabled: false,
    required: false,
    color: 'primary',
  },
};

export const NoLabel: Story = {
  args: {
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'primary',
    ariaLabel: 'Toggle feature',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary color',
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'primary',
  },
};

export const Accent: Story = {
  args: {
    label: 'Accent color',
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'accent',
  },
};

export const Warn: Story = {
  args: {
    label: 'Warning color',
    labelPosition: 'after',
    disabled: false,
    required: false,
    color: 'warn',
  },
};

export const WithFormField: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ix-form-field 
        label="Notification Settings"
        hint="Enable to receive email notifications">
        <ix-slide-toggle 
          label="Email notifications"
          [labelPosition]="labelPosition"
          [disabled]="disabled"
          [color]="color"
          [testId]="testId"
          (change)="change($event)"
          (toggleChange)="toggleChange($event)">
        </ix-slide-toggle>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    labelPosition: 'after',
    disabled: false,
    color: 'primary',
  },
};

export const ReactiveForm: Story = {
  render: (args) => ({
    props: {
      ...args,
      settingsForm: {
        notifications: new FormControl(false),
        autoSave: new FormControl(true),
        darkMode: new FormControl(false, [Validators.requiredTrue]),
      },
      submitForm: function() {
        const form = this['settingsForm'];
        Object.keys(form).forEach(key => {
          form[key].markAsTouched();
        });
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px;">
        <h3 style="margin: 0; color: var(--fg1);">Application Settings</h3>
        
        <ix-form-field 
          label="Notifications"
          hint="Receive push notifications">
          <ix-slide-toggle 
            label="Enable notifications"
            color="primary"
            [formControl]="settingsForm.notifications">
          </ix-slide-toggle>
        </ix-form-field>

        <ix-form-field 
          label="Auto Save"
          hint="Automatically save your work">
          <ix-slide-toggle 
            label="Enable auto-save"
            color="accent"
            [formControl]="settingsForm.autoSave">
          </ix-slide-toggle>
        </ix-form-field>

        <ix-form-field 
          label="Dark Mode (Required)"
          hint="This setting is required"
          [required]="true">
          <ix-slide-toggle 
            label="Enable dark mode"
            color="primary"
            [formControl]="settingsForm.darkMode">
          </ix-slide-toggle>
        </ix-form-field>

        <div style="display: flex; gap: 1rem;">
          <button 
            type="button" 
            (click)="submitForm()"
            style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            Validate Form
          </button>
        </div>

        <div style="padding: 1rem; background: var(--bg2); border-radius: 0.375rem; font-size: 0.875rem;">
          <strong>Form Values:</strong><br>
          Notifications: {{ settingsForm.notifications.value }}<br>
          Auto Save: {{ settingsForm.autoSave.value }}<br>
          Dark Mode: {{ settingsForm.darkMode.value }}<br><br>
          <strong>Form Valid:</strong> {{ 
            settingsForm.notifications.valid && 
            settingsForm.autoSave.valid && 
            settingsForm.darkMode.valid 
          }}
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent, ReactiveFormsModule, CommonModule],
    },
  }),
  args: {},
};

export const ColorComparison: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">
        <h3 style="margin: 0; color: var(--fg1);">Color Variants</h3>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <ix-slide-toggle 
            label="Primary color (default)"
            color="primary"
            [checked]="true">
          </ix-slide-toggle>
          
          <ix-slide-toggle 
            label="Accent color"
            color="accent"
            [checked]="true">
          </ix-slide-toggle>
          
          <ix-slide-toggle 
            label="Warning color"
            color="warn"
            [checked]="true">
          </ix-slide-toggle>
        </div>

        <h4 style="margin: 1rem 0 0.5rem 0; color: var(--fg1);">Disabled States</h4>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <ix-slide-toggle 
            label="Disabled unchecked"
            color="primary"
            [disabled]="true"
            [checked]="false">
          </ix-slide-toggle>
          
          <ix-slide-toggle 
            label="Disabled checked"
            color="primary"
            [disabled]="true"
            [checked]="true">
          </ix-slide-toggle>
        </div>
      </div>
    `,
  }),
  args: {},
};