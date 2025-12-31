import type { Meta, StoryObj } from '@storybook/angular';
import { TnInputComponent } from '../lib/input/input.component';
import { TnStepperComponent, TnStepComponent } from '../lib/stepper';


const meta: Meta<TnStepperComponent> = {
  title: 'Components/Stepper',
  component: TnStepperComponent,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical', 'auto'],
      description: 'Layout orientation. Auto uses horizontal layout (>768px) and vertical layout (≤768px)'
    },
    linear: {
      control: { type: 'boolean' },
      description: 'Require sequential step completion'
    },
    selectedIndex: {
      control: { type: 'number', min: 0, max: 2 },
      description: 'Currently selected step index'
    }
  },
  parameters: {
    docs: {
      description: {
        component: `
The IX Stepper component provides a guided step-by-step interface for complex workflows. It supports both horizontal and vertical orientations, linear and non-linear progression, and rich theming.

## Features

- **Horizontal & Vertical Layouts**: Automatically optimized for different screen sizes
- **Linear & Non-Linear Modes**: Control step progression with the linear property
- **Rich Step States**: Support for completed, error, and optional steps
- **Custom Icons**: Add icons to step indicators
- **TrueNAS Theming**: Fully integrated with the design system
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Mobile-optimized layouts

## Basic Usage

### Simple Stepper

\`\`\`html
<tn-stepper>
  <tn-step label="Step 1">
    <p>First step content</p>
  </tn-step>
  <tn-step label="Step 2">
    <p>Second step content</p>
  </tn-step>
  <tn-step label="Step 3">
    <p>Final step content</p>
  </tn-step>
</tn-stepper>
\`\`\`

### Linear Stepper with Navigation

\`\`\`html
<tn-stepper [linear]="true" [selectedIndex]="currentStep" (selectionChange)="onStepChange($event)">
  <tn-step label="Personal Info" [completed]="personalInfoComplete">
    <!-- Form fields here -->
    <tn-button (click)="completePersonalInfo()">Next</tn-button>
  </tn-step>
  
  <tn-step label="Verification" [completed]="verificationComplete">
    <!-- Verification content -->
    <tn-button (click)="stepper.previous()">Back</tn-button>
    <tn-button (click)="completeVerification()">Verify</tn-button>
  </tn-step>
</tn-stepper>
\`\`\`

### Vertical Layout

\`\`\`html
<tn-stepper orientation="vertical">
  <tn-step label="Setup" [completed]="true">
    <p>Setup completed successfully.</p>
  </tn-step>
  <tn-step label="Configuration">
    <p>Configure your settings.</p>
  </tn-step>
</tn-stepper>
\`\`\`

### Responsive Auto Layout

\`\`\`html
<tn-stepper orientation="auto">
  <tn-step label="Setup" [completed]="true">
    <p>Automatically switches between horizontal and vertical based on screen size.</p>
  </tn-step>
  <tn-step label="Configuration">
    <p>Desktop: Horizontal layout (steps in a row). Mobile: Vertical layout (stacked).</p>
  </tn-step>
</tn-stepper>
\`\`\`

## Configuration Options

### Stepper Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`orientation\` | \`'horizontal' \\| 'vertical' \\| 'auto'\` | \`'horizontal'\` | Layout orientation. 'auto' uses horizontal layout on wide screens (>768px) and vertical on narrow screens (≤768px) |
| \`linear\` | \`boolean\` | \`false\` | Require sequential step completion |
| \`selectedIndex\` | \`number\` | \`0\` | Currently selected step index |

### Step Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`label\` | \`string\` | \`''\` | Step label text |
| \`icon\` | \`string\` | \`undefined\` | Custom icon (emoji or text) |
| \`optional\` | \`boolean\` | \`false\` | Mark step as optional |
| \`completed\` | \`boolean\` | \`false\` | Mark step as completed |
| \`hasError\` | \`boolean\` | \`false\` | Mark step as having error |
| \`data\` | \`any\` | \`null\` | Custom data associated with step |

### Events

| Event | Type | Description |
|-------|------|-------------|
| \`selectionChange\` | \`output<{selectedIndex: number, previouslySelectedIndex: number}>()\` | Fired when step selection changes |
| \`completed\` | \`output<any[]>()\` | Fired when all steps are completed |

## Step States

Steps can have different visual states:

- **Active**: Currently selected step (blue indicator)
- **Completed**: Finished step (green indicator with checkmark)
- **Error**: Step with validation errors (red indicator with exclamation)
- **Optional**: Non-required step (dashed border)
- **Disabled**: Cannot be selected in linear mode

## Navigation Methods

The stepper component provides programmatic navigation:

\`\`\`typescript
// Access stepper instance
stepper = viewChild.required(TnStepperComponent);

// Navigate to specific step
stepper().selectStep(2);

// Navigate forward/backward
stepper().next();
stepper().previous();

// Check if step can be selected
if (stepper().canSelectStep(3)) {
  stepper().selectStep(3);
}
\`\`\`

## Responsive Behavior

- **Desktop**: Horizontal steppers show steps in a row, vertical steppers use sidebar layout
- **Mobile**: Horizontal steppers become scrollable, vertical steppers stack vertically
- **Orientation**: Automatically adapts to screen size and orientation changes
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<TnStepperComponent>;

export const Default: Story = {
  render: (args) => ({
    template: `
      <tn-stepper [orientation]="orientation" [linear]="linear" [selectedIndex]="selectedIndex">
        <tn-step label="Personal Info">
          <h4>Step 1: Personal Information</h4>
          <p>Enter your basic personal details to get started.</p>
          <div style="margin-top: 16px;">
            <div style="margin-bottom: 12px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                First Name
              </label>
              <tn-input placeholder="Enter your first name"></tn-input>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                Last Name
              </label>
              <tn-input placeholder="Enter your last name"></tn-input>
            </div>
          </div>
        </tn-step>
        
        <tn-step label="Contact Details">
          <h4>Step 2: Contact Information</h4>
          <p>Provide your contact information for communication.</p>
          <div style="margin-top: 16px;">
            <div style="margin-bottom: 12px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                Email
              </label>
              <tn-input placeholder="Enter your email address"></tn-input>
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500;">
                Phone
              </label>
              <tn-input placeholder="Enter your phone number"></tn-input>
            </div>
          </div>
        </tn-step>
        
        <tn-step label="Review & Submit">
          <h4>Step 3: Review Your Information</h4>
          <p>Please review all information before submitting.</p>
          <div style="background: var(--alt-bg1, #f8f9fa); padding: 16px; border-radius: 8px; margin-top: 16px;">
            <p><strong>Ready to submit?</strong> Click submit when you're satisfied with your entries.</p>
          </div>
        </tn-step>
      </tn-stepper>
    `,
    props: args,
    moduleMetadata: {
      imports: [TnStepperComponent, TnStepComponent, TnInputComponent]
    }
  }),
  args: {
    orientation: 'horizontal',
    linear: false,
    selectedIndex: 0
  }
};

export const LinearMode: Story = {
  render: () => ({
    template: `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 8px;">
        <strong>Linear Mode:</strong> Steps must be completed in order. Try clicking on step 3 - it won't be selectable until step 2 is marked as completed.
      </div>
      <tn-stepper [linear]="true" [selectedIndex]="1">
        <tn-step label="Prerequisites" [completed]="true">
          <h4>✓ Prerequisites Completed</h4>
          <p>All system requirements have been verified and dependencies installed.</p>
          <ul>
            <li>Node.js version check: ✓ Passed</li>
            <li>Disk space: ✓ 2.5GB available</li>
            <li>Network connectivity: ✓ Connected</li>
          </ul>
        </tn-step>
        <tn-step label="Installation">
          <h4>Installing Application</h4>
          <p>Currently installing the application and configuring settings...</p>
          <div style="margin-top: 16px;">
            <div style="background: var(--alt-bg1, #f8f9fa); padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              Installing dependencies... ████████████░░░░ 75%
            </div>
          </div>
          <p style="margin-top: 8px; font-size: 14px; color: var(--fg2);">
            Step 3 will become available once installation completes.
          </p>
        </tn-step>
        <tn-step label="Configuration">
          <h4>Configuration Pending</h4>
          <p>This step will become available after installation completes.</p>
          <p style="color: var(--fg2); font-style: italic;">
            In linear mode, you cannot skip ahead to this step.
          </p>
        </tn-step>
      </tn-stepper>
    `,
    moduleMetadata: {
      imports: [TnStepperComponent, TnStepComponent, TnInputComponent]
    }
  })
};

export const StepStates: Story = {
  render: () => ({
    template: `
      <div style="margin-bottom: 16px; padding: 12px; background: var(--alt-bg1, #f8f9fa); border-radius: 8px;">
        <strong>Step States:</strong> This example demonstrates all possible step states and visual indicators.
      </div>
      <tn-stepper [selectedIndex]="2">
        <tn-step label="Completed Step" [completed]="true">
          <h4>✓ Account Setup Complete</h4>
          <p>This step has been successfully completed and shows a green indicator with checkmark.</p>
          <div style="background: var(--green, #28a745); color: white; padding: 8px; border-radius: 4px; margin-top: 8px;">
            <strong>Status:</strong> Completed - Account created and verified
          </div>
        </tn-step>
        
        <tn-step label="Error Step" [hasError]="true">
          <h4>⚠ Profile Setup Failed</h4>
          <p style="color: var(--red, #dc3545);">
            There was an error during profile setup. Please review and try again.
          </p>
          <div style="background: var(--red, #dc3545); color: white; padding: 8px; border-radius: 4px; margin-top: 8px;">
            <strong>Error:</strong> Email verification failed - please check your email address
          </div>
        </tn-step>
        
        <tn-step label="Current Step">
          <h4>📋 Review Information</h4>
          <p>This is the currently active step, highlighted with a blue indicator and larger size.</p>
          <div style="background: var(--primary, #007bff); color: white; padding: 8px; border-radius: 4px; margin-top: 8px;">
            <strong>Status:</strong> Active - Currently being processed
          </div>
        </tn-step>
        
        <tn-step label="Optional Step" [optional]="true">
          <h4>📱 Install Mobile App</h4>
          <p>This step is marked as optional and shows a dashed border indicator.</p>
          <div style="background: var(--alt-bg2, #6c757d); color: white; padding: 8px; border-radius: 4px; margin-top: 8px;">
            <strong>Status:</strong> Optional - Can be skipped if desired
          </div>
        </tn-step>
        
        <tn-step label="Future Step">
          <h4>🎉 Welcome & Onboarding</h4>
          <p>This step is pending and shows the default smaller gray indicator.</p>
          <div style="background: var(--alt-bg1, #f8f9fa); padding: 8px; border-radius: 4px; margin-top: 8px;">
            <strong>Status:</strong> Pending - Not yet started
          </div>
        </tn-step>
      </tn-stepper>
    `,
    moduleMetadata: {
      imports: [TnStepperComponent, TnStepComponent, TnInputComponent]
    }
  })
};