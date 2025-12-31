import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnButtonToggleGroupComponent } from '../lib/button-toggle/button-toggle-group.component';
import { TnButtonToggleComponent } from '../lib/button-toggle/button-toggle.component';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';

@Component({
  selector: 'button-toggle-demo',
  templateUrl: './button-toggle-demo.component.html',
  standalone: true,
  imports: [
    TnButtonToggleComponent,
    TnButtonToggleGroupComponent,
    TnFormFieldComponent,
    FormsModule
  ]
})
class ButtonToggleDemoComponent {
  alignment: string = 'left';
  fontStyles: string[] = ['bold'];
  featureEnabled: boolean = false;
}

const meta: Meta<TnButtonToggleComponent> = {
  title: 'Components/Button Toggle',
  component: TnButtonToggleComponent,
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
<tn-button-toggle-group [(ngModel)]="selectedValue" name="options">
  <tn-button-toggle value="option1">Option 1</tn-button-toggle>
  <tn-button-toggle value="option2">Option 2</tn-button-toggle>
  <tn-button-toggle value="option3">Option 3</tn-button-toggle>
</tn-button-toggle-group>
\`\`\`

### Multiple Selection (Checkbox Mode)
\`\`\`html
<tn-button-toggle-group [(ngModel)]="selectedValues" [multiple]="true" name="options">
  <tn-button-toggle value="option1">Option 1</tn-button-toggle>
  <tn-button-toggle value="option2">Option 2</tn-button-toggle>
  <tn-button-toggle value="option3">Option 3</tn-button-toggle>
</tn-button-toggle-group>
\`\`\`

### Standalone Toggle
\`\`\`html
<tn-button-toggle [(ngModel)]="isEnabled" value="enabled">
  Enable Feature
</tn-button-toggle>
\`\`\`
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<TnButtonToggleComponent>;

export const Examples: Story = {
  render: () => ({
    template: `<button-toggle-demo></button-toggle-demo>`,
    moduleMetadata: {
      imports: [
        ButtonToggleDemoComponent,
        TnButtonToggleComponent,
        TnButtonToggleGroupComponent,
        TnFormFieldComponent,
        FormsModule
      ]
    }
  })
};

export const Playground: Story = {
  render: (args) => ({
    template: `
      <tn-form-field label="Interactive Toggle">
        <tn-button-toggle
          [value]="value"
          [disabled]="disabled"
          [ariaLabel]="ariaLabel">
          Toggle Me
        </tn-button-toggle>
      </tn-form-field>
    `,
    props: args,
    moduleMetadata: {
      imports: [
        TnButtonToggleComponent,
        TnFormFieldComponent
      ]
    }
  }),
  args: {
    value: 'toggle-value',
    disabled: false,
    ariaLabel: 'Toggle button'
  }
};