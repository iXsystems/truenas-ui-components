import type { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxButtonComponent } from '../../lib/ix-button/ix-button.component';
import { IxCheckboxComponent } from '../../lib/ix-checkbox/ix-checkbox.component';
import { IxDialogShellComponent } from '../../lib/ix-dialog';
import { IxDialog } from '../../lib/ix-dialog/ix-dialog.service';
import { IxInputComponent } from '../../lib/ix-input/ix-input.component';
import { IxRadioComponent } from '../../lib/ix-radio/ix-radio.component';
import type { IxSelectOption } from '../../lib/ix-select/ix-select.component';
import { IxSelectComponent } from '../../lib/ix-select/ix-select.component';
import { IxStepperComponent, IxStepComponent } from '../../lib/ix-stepper';

// Backup Wizard Dialog Component
@Component({
  selector: 'backup-wizard-dialog',
  templateUrl: './stepped-wizard.stories.html',
  standalone: true,
  imports: [
    IxDialogShellComponent,
    IxStepperComponent,
    IxStepComponent,
    IxButtonComponent,
    IxRadioComponent,
    IxCheckboxComponent,
    IxInputComponent,
    IxSelectComponent,
    FormsModule,
    CommonModule
  ]
})
class BackupWizardDialogComponent {
  currentStep = 0;
  backupTarget = 'cloud';
  selectedAccount = '';
  selectedDatasetPath = '';
  includeSnapshots = true;

  accountOptions: IxSelectOption[] = [
    { value: 'aws-prod', label: 'AWS Production (S3)' },
    { value: 'azure-backup', label: 'Azure Backup Storage' },
    { value: 'gcs-cold', label: 'Google Cloud Storage (Coldline)' },
    { value: 'local-nas', label: 'Local NAS Server' }
  ];

  constructor(public ref: DialogRef<{ target: string; account: string; dataset: string; includeSnapshots: boolean } | undefined>) {}

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
  imports: [IxButtonComponent, CommonModule]
})
class SteppedWizardDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: IxDialog) {}

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
        IxDialogShellComponent,
        IxStepperComponent,
        IxStepComponent,
        IxButtonComponent,
        IxRadioComponent,
        IxCheckboxComponent,
        IxInputComponent,
        IxSelectComponent,
        FormsModule
      ],
      providers: [
        IxDialog
      ]
    },
  }),
  args: {}
};