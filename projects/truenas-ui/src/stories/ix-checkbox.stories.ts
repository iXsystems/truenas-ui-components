import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxCheckboxComponent } from '../lib/ix-checkbox/ix-checkbox.component';

const meta: Meta<IxCheckboxComponent> = {
  title: 'Components/Checkbox',
  component: IxCheckboxComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable checkbox component with accessibility features, form integration, and error handling.'
      }
    }
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text for the checkbox'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required'
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state'
    },
    error: {
      control: 'text',
      description: 'Error message to display'
    },
    testId: {
      control: 'text',
      description: 'Test ID for automated testing'
    },
    change: {
      action: 'change',
      description: 'Emitted when checkbox state changes'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<IxCheckboxComponent>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    disabled: false,
    required: false,
    indeterminate: false,
    error: null
  }
};

export const Checked: Story = {
  args: {
    label: 'I agree to the terms',
    disabled: false,
    required: false,
    indeterminate: false,
    error: null
  },
  render: (args) => ({
    props: {
      ...args,
      checked: true
    },
    template: `
      <ix-checkbox 
        [label]="label"
        [disabled]="disabled"
        [required]="required"
        [indeterminate]="indeterminate"
        [error]="error"
        [checked]="checked"
        (change)="change($event)"
      ></ix-checkbox>
    `
  })
};

export const Disabled: Story = {
  args: {
    label: 'This option is disabled',
    disabled: true,
    required: false,
    indeterminate: false,
    error: null
  }
};

export const DisabledChecked: Story = {
  args: {
    label: 'This option is disabled and checked',
    disabled: true,
    required: false,
    indeterminate: false,
    error: null
  },
  render: (args) => ({
    props: {
      ...args,
      checked: true
    },
    template: `
      <ix-checkbox 
        [label]="label"
        [disabled]="disabled"
        [required]="required"
        [indeterminate]="indeterminate"
        [error]="error"
        [checked]="checked"
        (change)="change($event)"
      ></ix-checkbox>
    `
  })
};

export const Required: Story = {
  args: {
    label: 'This field is required',
    disabled: false,
    required: true,
    indeterminate: false,
    error: null
  }
};

export const WithError: Story = {
  args: {
    label: 'Accept privacy policy',
    disabled: false,
    required: true,
    indeterminate: false,
    error: 'You must accept the privacy policy to continue'
  }
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all items',
    disabled: false,
    required: false,
    indeterminate: true,
    error: null
  }
};

export const LongLabel: Story = {
  args: {
    label: 'This is a very long label that demonstrates how the checkbox component handles longer text content and wrapping behavior when the text exceeds the available width',
    disabled: false,
    required: false,
    indeterminate: false,
    error: null
  }
};

export const Interactive: Story = {
  args: {
    label: 'Interactive checkbox',
    disabled: false,
    required: false,
    indeterminate: false,
    error: null
  },
  render: (args) => ({
    props: {
      ...args,
      checked: false,
      onToggle: function() {
        this['checked'] = !this['checked'];
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ix-checkbox 
          [label]="label"
          [disabled]="disabled"
          [required]="required"
          [indeterminate]="indeterminate"
          [error]="error"
          [(ngModel)]="checked"
          (change)="change($event)"
        ></ix-checkbox>
        <button (click)="onToggle()">Toggle programmatically</button>
        <p>Current state: {{ checked ? 'Checked' : 'Unchecked' }}</p>
      </div>
    `,
    moduleMetadata: {
      imports: [FormsModule, CommonModule]
    }
  })
};

export const Group: Story = {
  render: () => ({
    props: {
      preferences: {
        notifications: true,
        newsletter: false,
        updates: false,
        marketing: false
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <h3 style="margin: 0 0 8px 0; color: var(--fg1);">Notification Preferences</h3>
        
        <ix-checkbox 
          label="Push notifications"
          [(ngModel)]="preferences.notifications"
        ></ix-checkbox>
        
        <ix-checkbox 
          label="Email newsletter"
          [(ngModel)]="preferences.newsletter"
        ></ix-checkbox>
        
        <ix-checkbox 
          label="Product updates"
          [(ngModel)]="preferences.updates"
        ></ix-checkbox>
        
        <ix-checkbox 
          label="Marketing emails"
          [(ngModel)]="preferences.marketing"
        ></ix-checkbox>
        
        <div style="margin-top: 16px; padding: 12px; background: var(--bg2); border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: var(--fg1);">Selected Preferences:</h4>
          <ul style="margin: 0; padding-left: 20px; color: var(--fg2);">
            <li *ngIf="preferences.notifications">Push notifications</li>
            <li *ngIf="preferences.newsletter">Email newsletter</li>
            <li *ngIf="preferences.updates">Product updates</li>
            <li *ngIf="preferences.marketing">Marketing emails</li>
          </ul>
        </div>
      </div>
    `,
    moduleMetadata: {
      imports: [FormsModule, CommonModule]
    }
  })
};