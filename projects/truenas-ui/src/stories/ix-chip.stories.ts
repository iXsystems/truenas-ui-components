import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IxChipComponent } from '../lib/ix-chip/ix-chip.component';
import { IxInputComponent } from '../lib/ix-input/ix-input.component';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { InputType } from '../lib/enums/input-type.enum';

const meta: Meta<IxChipComponent> = {
  title: 'Components/Chip',
  component: IxChipComponent,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent'],
    },
    closable: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'text' },
    },
    label: {
      control: { type: 'text' },
    },
    onClose: { action: 'closed' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A versatile chip component for displaying tags, filters, or selections with optional icons and close functionality.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<IxChipComponent>;

export const Default: Story = {
  args: {
    label: 'Default Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'default-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('ix-chip--primary');
    await userEvent.click(chip);
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Featured',
    icon: 'mdi:star',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'icon-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('ix-chip--primary');
    
    // Check that the icon container exists
    const icon = chip.querySelector('.ix-chip__icon');
    await expect(icon).toBeInTheDocument();
  },
};

export const NotClosable: Story = {
  args: {
    label: 'Read-only Chip',
    color: 'secondary',
    closable: false,
    disabled: false,
    testId: 'readonly-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    const closeButton = chip.querySelector('.ix-chip__close');
    
    await expect(chip).toBeInTheDocument();
    await expect(closeButton).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Chip',
    color: 'primary',
    closable: true,
    disabled: true,
    testId: 'disabled-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toBeInTheDocument();
    await expect(chip).toHaveClass('ix-chip--disabled');
    await expect(chip).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'primary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--primary');
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Chip',
    color: 'secondary',
    closable: true,
    disabled: false,
    testId: 'secondary-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--secondary');
  },
};

export const Accent: Story = {
  args: {
    label: 'Accent Chip',
    color: 'accent',
    closable: true,
    disabled: false,
    testId: 'accent-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveClass('ix-chip--accent');
  },
};

export const ChipInputExample: Story = {
  render: (args) => ({
    props: {
      ...args,
      tags: ['JavaScript', 'TypeScript', 'Angular'],
      inputValue: '',
      inputType: InputType.PlainText,
      placeholder: 'Type a skill and press Enter to add it as a tag',
      testId: 'chip-input',
      
      addTag: function(value: string) {
        if (value && value.trim() && !this['tags'].includes(value.trim())) {
          this['tags'] = [...this['tags'], value.trim()];
          this['inputValue'] = '';
        }
      },
      
      removeTag: function(tagToRemove: string) {
        this['tags'] = this['tags'].filter((tag: string) => tag !== tagToRemove);
      },
      
      onKeyDown: function(event: KeyboardEvent) {
        if (event.key === 'Enter') {
          event.preventDefault();
          this['addTag'](this['inputValue']);
        } else if (event.key === 'Backspace' && !this['inputValue'] && this['tags'].length > 0) {
          this['removeTag'](this['tags'][this['tags'].length - 1]);
        }
      },
      
      onInputChange: function(event: Event) {
        const target = event.target as HTMLInputElement;
        this['inputValue'] = target.value;
      },
      
      focusInput: function() {
        // Focus the input when the container is clicked
        setTimeout(() => {
          const input = document.querySelector('[data-testid="chip-input"]') as HTMLInputElement;
          if (input) input.focus();
        }, 0);
      },
      
      onInputFocus: function(event: FocusEvent) {
        // Add focus styles to container
        const container = (event.target as HTMLElement).parentElement;
        if (container) {
          container.style.borderColor = 'var(--primary, #007bff)';
          container.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
        }
      },
      
      onInputBlur: function(event: FocusEvent) {
        // Remove focus styles from container
        const container = (event.target as HTMLElement).parentElement;
        if (container) {
          container.style.borderColor = 'var(--lines, #d1d5db)';
          container.style.boxShadow = 'none';
        }
      }
    },
    template: `
      <ix-form-field 
        label="Skills and Technologies"
        hint="Your technical skills and areas of expertise">
        
        <!-- Custom chip input container that mimics input styling -->
        <div class="chip-input-container" 
             style="
               display: flex;
               flex-wrap: wrap;
               align-items: center;
               gap: 0.375rem;
               min-height: 2.5rem;
               padding: 0.5rem 0.75rem;
               background-color: var(--bg1, #ffffff);
               border: 1px solid var(--lines, #d1d5db);
               border-radius: 0.375rem;
               font-family: var(--font-family-body, 'Inter'), sans-serif;
               transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
               cursor: text;
             "
             (click)="focusInput()">
          
          <!-- Chips inside the input area -->
          <ix-chip
            *ngFor="let tag of tags"
            [label]="tag"
            [color]="color"
            [closable]="true"
            [disabled]="disabled"
            (onClose)="removeTag(tag)"
            style="flex-shrink: 0;">
          </ix-chip>
          
          <!-- Persistent placeholder text -->
          <span *ngIf="!inputValue" 
                style="
                  color: var(--fg2, #6c757d);
                  font-style: italic;
                  font-size: 0.875rem;
                  pointer-events: none;
                  user-select: none;
                  flex-shrink: 0;
                  white-space: nowrap;
                ">
            {{ placeholder }}
          </span>
          
          <!-- Inline input field -->
          <input
            #chipInput
            [value]="inputValue"
            [disabled]="disabled"
            [attr.data-testid]="testId"
            (input)="onInputChange($event)"
            (keydown)="onKeyDown($event)"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            style="
              border: none;
              outline: none;
              background: transparent;
              flex: 1;
              min-width: 120px;
              font-size: 1rem;
              color: var(--fg1, #212529);
            "
            type="text">
        </div>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent, ReactiveFormsModule],
    },
  }),
  args: {
    label: 'Skills',
    color: 'primary',
    closable: true,
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('chip-input');
    
    // Test adding a new tag
    await userEvent.type(input, 'React');
    await userEvent.keyboard('{Enter}');
    
    // Verify the chip was added
    const chips = canvas.getAllByText('React');
    await expect(chips[0]).toBeInTheDocument();
    
    // Test removing a tag
    const closeButtons = canvas.getAllByLabelText(/Remove/);
    if (closeButtons.length > 0) {
      await userEvent.click(closeButtons[0]);
    }
  },
};

export const ChipsWithFormField: Story = {
  render: (args) => ({
    props: {
      ...args,
      selectedTags: ['Frontend', 'Backend', 'DevOps'],
      
      removeTag: function(tagToRemove: string) {
        this['selectedTags'] = this['selectedTags'].filter((tag: string) => tag !== tagToRemove);
      }
    },
    template: `
      <ix-form-field 
        label="Selected Categories"
        hint="Your current selections">
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 2.5rem; align-items: center;">
          <ix-chip
            *ngFor="let tag of selectedTags"
            [label]="tag"
            [color]="color"
            [closable]="closable"
            [disabled]="disabled"
            (onClose)="removeTag(tag)">
          </ix-chip>
          <span *ngIf="selectedTags.length === 0" style="color: var(--fg2, #6c757d); font-style: italic;">
            No categories selected
          </span>
        </div>
      </ix-form-field>
    `,
    moduleMetadata: {
      imports: [IxFormFieldComponent],
    },
  }),
  args: {
    color: 'primary',
    closable: true,
    disabled: false,
  },
};

export const KeyboardNavigation: Story = {
  args: {
    label: 'Keyboard Chip',
    color: 'primary',
    closable: true,
    disabled: false,
    testId: 'keyboard-chip',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByTestId(args.testId!);
    
    await expect(chip).toHaveAttribute('tabindex', '0');
    await expect(chip).toHaveAttribute('role', 'button');
    
    // Test keyboard interaction
    chip.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Delete}');
  },
};