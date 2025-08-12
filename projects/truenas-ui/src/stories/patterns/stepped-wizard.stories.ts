import type { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IxStepperComponent, IxStepComponent } from '../../lib/ix-stepper';
import { IxButtonComponent } from '../../lib/ix-button/ix-button.component';
import { IxDialogShellComponent } from '../../lib/ix-dialog';
import { IxDialog } from '../../lib/ix-dialog/ix-dialog.service';
import { IxRadioComponent } from '../../lib/ix-radio/ix-radio.component';
import { IxCheckboxComponent } from '../../lib/ix-checkbox/ix-checkbox.component';
import { IxInputComponent } from '../../lib/ix-input/ix-input.component';
import { IxSelectComponent, IxSelectOption } from '../../lib/ix-select/ix-select.component';

// Backup Wizard Dialog Component
@Component({
  selector: 'backup-wizard-dialog',
  template: `
    <ix-dialog-shell title="Backup Configuration Wizard" [showFullscreenButton]="true">
      <div style="padding: 0 var(--content-padding); margin-top: var(--content-padding);">
        <ix-stepper [linear]="true" [selectedIndex]="currentStep" orientation="auto" (selectionChange)="onStepChange($event)">
        
        <ix-step label="Backup Target">
          <h4>Select Backup Target</h4>
          <p>Choose where you want to store your backup data.</p>
          <div style="margin-top: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">
                Backup Destination
              </label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <ix-radio name="backupTarget" value="local" label="Local Storage - Fast, no network required" [(ngModel)]="backupTarget"></ix-radio>
                <ix-radio name="backupTarget" value="cloud" label="Cloud Storage - Off-site protection" [(ngModel)]="backupTarget"></ix-radio>
                <ix-radio name="backupTarget" value="remote" label="Remote Server - Network attached storage" [(ngModel)]="backupTarget"></ix-radio>
              </div>
            </div>
          </div>
        </ix-step>

        <ix-step label="Credentials">
          <h4>Authentication & Credentials</h4>
          <p>Select an existing account to use for your backup.</p>
          <div style="margin-top: 16px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">
                Choose an account
              </label>
              <ix-select [options]="accountOptions"
                         placeholder="Select an account"
                         [(ngModel)]="selectedAccount">
              </ix-select>
            </div>
          </div>
        </ix-step>

        <ix-step label="Select Dataset">
          <h4>Choose Dataset to Backup</h4>
          <p>Enter the dataset path you want to include in your backup.</p>
          <div style="margin-top: 16px;">
            <div style="margin-bottom: 12px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">
                Dataset Path
              </label>
              <ix-input [placeholder]="'Enter dataset path (e.g., pool1/documents)'"
                        [(ngModel)]="selectedDatasetPath">
              </ix-input>
            </div>
            <div>
              <ix-checkbox label="Include snapshots in backup" [(ngModel)]="includeSnapshots"></ix-checkbox>
            </div>
          </div>
        </ix-step>

        <ix-step label="Review">
          <h4>Review Configuration</h4>
          <p>Please review your backup configuration before proceeding.</p>
          <div style="margin-top: 16px;">
            <div style="background: var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--lines);">
              <div style="display: grid; gap: 12px;">
                <div>
                  <strong style="color: var(--fg1);">Backup Target:</strong>
                  <span style="margin-left: 8px; color: var(--fg2);">{{ getBackupTargetLabel(backupTarget) }}</span>
                </div>
                <div>
                  <strong style="color: var(--fg1);">Account:</strong>
                  <span style="margin-left: 8px; color: var(--fg2);">{{ getAccountLabel(selectedAccount) }}</span>
                </div>
                <div>
                  <strong style="color: var(--fg1);">Dataset:</strong>
                  <span style="margin-left: 8px; color: var(--fg2);">{{ selectedDatasetPath || 'Not specified' }}</span>
                </div>
                <div>
                  <strong style="color: var(--fg1);">Include Snapshots:</strong>
                  <span style="margin-left: 8px; color: var(--fg2);">{{ includeSnapshots ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>
            <div style="margin-top: 16px; padding: 12px; color:var(--green); border-radius: 4px; font-size: 14px;">
              <strong>Ready to create backup task!</strong> All configuration is valid and complete.
            </div>
          </div>
        </ix-step>

        </ix-stepper>
      </div>
      
      <div ixDialogAction>
        <ix-button variant="outline" 
                   label="Cancel"
                   (click)="cancel()">
        </ix-button>
        <ix-button variant="outline" 
                   label="Back"
                   (click)="previousStep()"
                   *ngIf="currentStep > 0">
        </ix-button>
        <ix-button color="primary" 
                   [label]="getNextButtonLabel()"
                   (click)="nextStep()"
                   [disabled]="!canProceed()">
        </ix-button>
      </div>
    </ix-dialog-shell>
  `,
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

  constructor(public ref: DialogRef<any>) {}

  onStepChange(event: any) {
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
    if (this.currentStep === 3) return 'Create Backup Task';
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
  template: `
    <div style="padding: 20px;">
      <h1 style="margin-bottom: 8px; color: var(--fg1); font-family: var(--font-family-header);">Stepped Wizard Pattern</h1>
      <p style="margin-bottom: 16px; color: var(--fg2); font-style: italic; font-size: 14px;">For linear workflows</p>
      <p style="margin-bottom: 16px; color: var(--fg2);">
        The Stepped Wizard pattern combines the ix-dialog and ix-stepper components to create guided, multi-step workflows. 
        This pattern uses the stepper in linear mode to ensure users complete steps in the correct order. For non-linear 
        wizards where users can jump between steps freely, use the Tabbed Wizard Pattern instead.
      </p>
      <ix-button variant="primary" 
                 label="Launch Stepped Wizard"
                 (click)="openWizard()">
      </ix-button>
      
      <div style="margin-top: 24px; padding: 16px; border: 1px solid var(--lines); border-radius: 8px;" *ngIf="lastResult">
        <h4>Last Result:</h4>
        <pre style="margin: 8px 0 0 0; color: var(--fg2);">{{ lastResult | json }}</pre>
      </div>
    </div>
  `,
  standalone: true,
  imports: [IxButtonComponent, CommonModule]
})
class SteppedWizardDemoComponent {
  lastResult: any = null;

  constructor(private ixDialog: IxDialog) {}

  openWizard() {
    const dialogRef = this.ixDialog.open(BackupWizardDialogComponent, {
      width: '600px',
      height: '700px'
    });

    dialogRef.closed.subscribe((result: any) => {
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