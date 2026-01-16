import { DialogRef } from '@angular/cdk/dialog';

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnButtonComponent } from '../../lib/button/button.component';
import { TnCheckboxComponent } from '../../lib/checkbox/checkbox.component';
import { TnDialogShellComponent } from '../../lib/dialog';
import { TnDialog } from '../../lib/dialog/dialog.service';
import { TnInputComponent } from '../../lib/input/input.component';
import { TnRadioComponent } from '../../lib/radio/radio.component';
import type { TnSelectOption } from '../../lib/select/select.component';
import { TnSelectComponent } from '../../lib/select/select.component';
import { TnStepperComponent, TnStepComponent } from '../../lib/stepper';

// Backup Wizard Dialog Component
@Component({
  selector: 'backup-wizard-dialog',
  templateUrl: './stepped-wizard.stories.html',
  standalone: true,
  imports: [
    TnDialogShellComponent,
    TnStepperComponent,
    TnStepComponent,
    TnButtonComponent,
    TnRadioComponent,
    TnCheckboxComponent,
    TnInputComponent,
    TnSelectComponent,
    FormsModule
]
})
class BackupWizardDialogComponent {
  ref = inject(DialogRef<{ target: string; account: string; dataset: string; includeSnapshots: boolean } | undefined>);

  currentStep = 0;
  backupTarget = 'cloud';
  selectedAccount = '';
  selectedDatasetPath = '';
  includeSnapshots = true;

  accountOptions: TnSelectOption[] = [
    { value: 'aws-prod', label: 'AWS Production (S3)' },
    { value: 'azure-backup', label: 'Azure Backup Storage' },
    { value: 'gcs-cold', label: 'Google Cloud Storage (Coldline)' },
    { value: 'local-nas', label: 'Local NAS Server' }
  ];

  onStepChange(event: { selectedIndex: number }): void {
    this.currentStep = event.selectedIndex;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      // Final step - create backup
      this.ref.close({
        target: this.backupTarget,
        account: this.selectedAccount,
        dataset: this.selectedDatasetPath,
        includeSnapshots: this.includeSnapshots
      });
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  cancel() {
    this.ref.close();
  }

  canProceed(): boolean {
    switch(this.currentStep) {
      case 0: // Target selection
        return this.backupTarget.length > 0;
      case 1: // Credentials
        return this.selectedAccount.length > 0;
      case 2: // Dataset
        return this.selectedDatasetPath.length > 0;
      case 3: // Review
        return true;
      default:
        return false;
    }
  }

  getNextButtonLabel(): string {
    if (this.currentStep === 3) {return 'Create Backup Task';}
    return 'Next';
  }

  getBackupTargetLabel(target: string): string {
    switch(target) {
      case 'local': return 'Local Storage';
      case 'cloud': return 'Cloud Storage';
      case 'remote': return 'Remote Server';
      default: return 'Unknown';
    }
  }

  getAccountLabel(account: string): string {
    const option = this.accountOptions.find(opt => opt.value === account);
    return option?.label || 'Not selected';
  }
}

// Demo Component
@Component({
  selector: 'stepped-wizard-demo',
  templateUrl: './stepped-wizard-2.stories.html',
  standalone: true,
  imports: [TnButtonComponent]
})
class SteppedWizardDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: TnDialog) {}

  openWizard() {
    const dialogRef = this.ixDialog.open(BackupWizardDialogComponent, {
      width: '600px',
      height: '700px'
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Backup wizard was cancelled';
    });
  }
}

const meta: Meta<SteppedWizardDemoComponent> = {
  title: 'Patterns/Wizards/Stepped Wizard',
  component: SteppedWizardDemoComponent,
  parameters: {
    docs: {
      description: {
        component: `
# Stepped Wizard Pattern

The Stepped Wizard pattern provides a linear, guided workflow where users must complete steps in a specific order. This pattern is ideal for:

- Configuration wizards
- Setup processes
- Data collection workflows
- Multi-step forms

## Key Features

- **Linear navigation**: Users must complete steps in order
- **Progress indication**: Clear visual progress through the stepper
- **Validation**: Each step can be validated before proceeding
- **Flexible content**: Each step can contain any UI components

## Usage

Use stepped wizards when:
- Steps have dependencies on previous steps
- Data needs to be collected in a specific order
- Users benefit from guided, structured workflows
- Complex processes need to be broken into manageable chunks
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<SteppedWizardDemoComponent>;

export const SteppedWizard: Story = {
  render: (args) => ({
    template: `<stepped-wizard-demo></stepped-wizard-demo>`,
    props: args,
    moduleMetadata: {
      imports: [
        SteppedWizardDemoComponent,
        BackupWizardDialogComponent,
        TnDialogShellComponent,
        TnStepperComponent,
        TnStepComponent,
        TnButtonComponent,
        TnRadioComponent,
        TnCheckboxComponent,
        TnInputComponent,
        TnSelectComponent,
        FormsModule
      ],
      providers: [
        TnDialog
      ]
    },
  }),
  args: {}
};