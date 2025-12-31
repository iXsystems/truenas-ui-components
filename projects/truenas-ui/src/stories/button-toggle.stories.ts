import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxButtonToggleGroupComponent } from '../lib/button-toggle/button-toggle-group.component';
import { IxButtonToggleComponent } from '../lib/button-toggle/button-toggle.component';
import { IxFormFieldComponent } from '../lib/form-field/form-field.component';

@Component({
  selector: 'button-toggle-demo',
  templateUrl: './button-toggle-demo.component.html',
  standalone: true,
  imports: [
    IxButtonToggleComponent,
    IxButtonToggleGroupComponent,
    IxFormFieldComponent,
    FormsModule
  ]
})
class ButtonToggleDemoComponent {
  alignment: string = 'left';
  fontStyles: string[] = ['bold'];
  featureEnabled: boolean = false;
}

const meta: Meta<IxButtonToggleComponent> = {
  title: 'Components/Button Toggle',
  component: IxButtonToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'The value associated with this toggle'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled'
    },
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked'
    },
    ariaLabel: {
      control: 'text',
      description: 'Aria label for the toggle button'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
The IX Button Toggle component provides toggleable button functionality similar to Material Design's button toggles. They can be used standalone or grouped together to create radio-button-like or checkbox-like behaviors.

## Key Features

- **Standalone Mode**: Single toggle button that can be checked/unchecked
- **Group Mode**: Multiple toggles that can behave as radio buttons (single selection) or checkboxes (multiple selection)
- **Horizontal Layout**: Groups are displayed horizontally with proper border radius on ends
- **Form Integration**: Full support for Angular reactive forms and template-driven forms
- **Accessibility**: ARIA attributes and keyboard navigation support

## Usage Patterns

### Single Selection (Radio Mode)
\`\`\`html
<ix-button-toggle-group [(ngModel)]="selectedValue" name="options">
  <ix-button-toggle value="option1">Option 1</ix-button-toggle>
  <ix-button-toggle value="option2">Option 2</ix-button-toggle>
  <ix-button-toggle value="option3">Option 3</ix-button-toggle>
</ix-button-toggle-group>
\`\`\`

### Multiple Selection (Checkbox Mode)
\`\`\`html
<ix-button-toggle-group [(ngModel)]="selectedValues" [multiple]="true" name="options">
  <ix-button-toggle value="option1">Option 1</ix-button-toggle>
  <ix-button-toggle value="option2">Option 2</ix-button-toggle>
  <ix-button-toggle value="option3">Option 3</ix-button-toggle>
</ix-button-toggle-group>
\`\`\`

### Standalone Toggle
\`\`\`html
<ix-button-toggle [(ngModel)]="isEnabled" value="enabled">
  Enable Feature
</ix-button-toggle>
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<IxButtonToggleComponent>;

export const Examples: Story = {
  render: () => ({
    template: `<button-toggle-demo></button-toggle-demo>`,
    moduleMetadata: {
      imports: [
        ButtonToggleDemoComponent,
        IxButtonToggleComponent,
        IxButtonToggleGroupComponent,
        IxFormFieldComponent,
        FormsModule
      ]
    }
  })
};

export const Playground: Story = {
  render: (args) => ({
    template: `
      <ix-form-field label="Interactive Toggle">
        <ix-button-toggle
          [value]="value"
          [disabled]="disabled"
          [ariaLabel]="ariaLabel">
          Toggle Me
        </ix-button-toggle>
      </ix-form-field>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        IxButtonToggleComponent,
        IxFormFieldComponent
      ]
    }
  }),
  args: {
    value: 'toggle-value',
    disabled: false,
    ariaLabel: 'Toggle button'
  }
};