import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

// Wizard configuration type
interface WizardConfig {
  storage: {
    disk1: boolean; disk2: boolean; disk3: boolean;
    raidType: string;
    poolName: string;
    compression: boolean;
    createMedia: boolean; createBackups: boolean; createVmStorage: boolean;
    advancedOptions: boolean;
    enableHotSpares: boolean;
    slogDevice: string;
    l2arcDevice: string;
    metadataDevice: string;
    enableEncryption: boolean;
    enableDeduplication: boolean;
  };
  network: {
    hostname: string;
    domain: string;
    ipType: string;
    staticIp: string;
    gateway: string;
  };
  admin: {
    username: string;
    password: string;
    confirmPassword: string;
    enableSsh: boolean;
  };
  services: {
    enableSmb: boolean;
    enableNfs: boolean;
    enableFtp: boolean;
    enableSmart: boolean;
    autoUpdates: boolean;
    enableFail2ban: boolean;
    enableFirewall: boolean;
  };
  https: {
    certType: string;
    domain: string;
    email: string;
    redirectHttp: boolean;
    enableHsts: boolean;
  };
  notifications: {
    method: string;
    email: string;
    smtpServer: string;
    slackWebhook: string;
    systemHealth: boolean;
    storageAlerts: boolean;
    securityAlerts: boolean;
    updateAlerts: boolean;
  };
  final: {
    startServices: boolean;
    launchWebInterface: boolean;
    downloadConfig: boolean;
  };
}

// Onboarding Wizard Dialog Component
@Component({
  selector: 'onboarding-wizard-dialog',
  templateUrl: './captive-wizard.stories.html',
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
class OnboardingWizardDialogComponent {
  currentStep = 0;
  
  // Step completion tracking
  step1Complete = false;
  step2Complete = false;
  step3Complete = false;
  step4Complete = false;
  step5Complete = false;
  step6Complete = false;
  step7Complete = false;

  // Configuration object to store all wizard data
  config: WizardConfig = {
    storage: {
      disk1: false, disk2: false, disk3: false,
      raidType: 'mirror',
      poolName: 'tank',
      compression: true,
      createMedia: true, createBackups: true, createVmStorage: false,
      advancedOptions: false,
      enableHotSpares: false,
      slogDevice: '',
      l2arcDevice: '',
      metadataDevice: '',
      enableEncryption: false,
      enableDeduplication: false
    },
    network: {
      hostname: 'truenas-server',
      domain: 'home.local',
      ipType: 'dhcp',
      staticIp: '',
      gateway: ''
    },
    admin: {
      username: 'admin',
      password: '',
      confirmPassword: '',
      enableSsh: false
    },
    services: {
      enableSmb: true,
      enableNfs: false,
      enableFtp: false,
      enableSmart: true,
      autoUpdates: true,
      enableFail2ban: false,
      enableFirewall: true
    },
    https: {
      certType: 'self-signed',
      domain: '',
      email: '',
      redirectHttp: true,
      enableHsts: false
    },
    notifications: {
      method: 'email',
      email: '',
      smtpServer: '',
      slackWebhook: '',
      systemHealth: true,
      storageAlerts: true,
      securityAlerts: true,
      updateAlerts: false
    },
    final: {
      startServices: true,
      launchWebInterface: true,
      downloadConfig: false
    }
  };

  slogDeviceOptions: IxSelectOption[] = [
    { value: '', label: 'None' },
    { value: 'nvme0n1', label: 'nvme0n1 - 256GB NVMe SSD' },
    { value: 'sdd', label: 'sdd - 128GB SATA SSD' }
  ];
  
  cacheDeviceOptions: IxSelectOption[] = [
    { value: '', label: 'None' },
    { value: 'nvme1n1', label: 'nvme1n1 - 512GB NVMe SSD' },
    { value: 'sde', label: 'sde - 1TB SATA SSD' }
  ];
  
  metadataDeviceOptions: IxSelectOption[] = [
    { value: '', label: 'None' },
    { value: 'nvme2n1', label: 'nvme2n1 - 128GB NVMe SSD' },
    { value: 'sdf', label: 'sdf - 256GB SATA SSD' }
  ];

  ref = inject(DialogRef<{ action: string; config?: WizardConfig; reason?: string } | undefined>);

  onStepChange(event: { selectedIndex: number }): void {
    this.currentStep = event.selectedIndex;
  }

  nextStep() {
    this.markStepComplete(this.currentStep);
    if (this.currentStep < 6) {
      this.currentStep++;
    } else {
      // Final step - complete onboarding
      this.ref.close({
        action: 'completed',
        config: this.config
      });
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch(this.currentStep) {
      case 0: // Storage - requires at least one disk and pool name
        return (this.config.storage.disk1 || this.config.storage.disk2 || this.config.storage.disk3) && 
               this.config.storage.poolName.length > 0;
      case 1: // Network - requires hostname and IP
        return this.config.network.hostname.length > 0;
      case 2: // Admin - requires username and matching passwords
        return this.config.admin.username.length > 0 &&
               this.config.admin.password.length > 0 &&
               this.config.admin.password === this.config.admin.confirmPassword;
      case 3: // Services - always can proceed
        return true;
      case 4: // HTTPS - requires domain/email if Let's Encrypt
        if (this.config.https.certType === 'letsencrypt') {
          return this.config.https.domain.length > 0 && this.config.https.email.length > 0;
        }
        return true;
      case 5: // Notifications - requires config if email/slack selected
        if (this.config.notifications.method === 'email') {
          return this.config.notifications.email.length > 0 && this.config.notifications.smtpServer.length > 0;
        }
        if (this.config.notifications.method === 'slack') {
          return this.config.notifications.slackWebhook.length > 0;
        }
        return true;
      case 6: // Review - always can proceed
        return true;
      default:
        return false;
    }
  }

  markStepComplete(step: number) {
    switch(step) {
      case 0:
        this.step1Complete = true;
        break;
      case 1:
        this.step2Complete = true;
        break;
      case 2:
        this.step3Complete = true;
        break;
      case 3:
        this.step4Complete = true;
        break;
      case 4:
        this.step5Complete = true;
        break;
      case 5:
        this.step6Complete = true;
        break;
      case 6:
        this.step7Complete = true;
        break;
    }
  }

  getNextButtonLabel(): string {
    if (this.currentStep === 6) {return 'Complete Setup';}
    return 'Next';
  }

  getRaidTypeLabel(type: string): string {
    switch(type) {
      case 'mirror': return 'Mirror (RAID1)';
      case 'raidz1': return 'RAIDZ1';
      case 'raidz2': return 'RAIDZ2';
      case 'raidz3': return 'RAIDZ3';
      case 'stripe': return 'Stripe';
      default: return type;
    }
  }

  exitForDraid() {
    // Close wizard for users who need DRAID
    this.ref.close({ action: 'exited_for_draid', reason: 'User needs DRAID functionality' });
  }

  getHttpsLabel(): string {
    switch(this.config.https.certType) {
      case 'self-signed': return 'Self-signed certificate';
      case 'letsencrypt': return `Let's Encrypt (${this.config.https.domain || 'domain not set'})`;
      case 'existing': return 'Existing certificate';
      default: return 'Not configured';
    }
  }

  getNotificationLabel(): string {
    switch(this.config.notifications.method) {
      case 'email': return `Email (${this.config.notifications.email || 'not set'})`;
      case 'slack': return 'Slack webhook';
      case 'webhook': return 'Custom webhook';
      case 'none': return 'Disabled';
      default: return 'Not configured';
    }
  }

  getEnabledServicesCount(): number {
    const services = this.config.services;
    let count = 0;
    if (services.enableSmb) {count++;}
    if (services.enableNfs) {count++;}
    if (services.enableFtp) {count++;}
    if (services.enableSmart) {count++;}
    return count;
  }
}

// Demo Component
@Component({
  selector: 'captive-wizard-demo',
  templateUrl: './captive-wizard-2.stories.html',
  standalone: true,
  imports: [IxButtonComponent, CommonModule]
})
class CaptiveWizardDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: IxDialog) {}

  openCaptiveWizard() {
    const dialogRef = this.ixDialog.open(OnboardingWizardDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      disableClose: true
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Captive wizard was cancelled';
    });
  }
}

const meta: Meta<CaptiveWizardDemoComponent> = {
  title: 'Patterns/Wizards/Captive Wizard',
  component: CaptiveWizardDemoComponent,
  parameters: {
    docs: {
      description: {
        component: `
# Captive Wizard Pattern

The Captive Wizard pattern provides a fullscreen, modal experience that captures the user's complete attention for critical setup processes. This pattern is ideal for:

- System onboarding and initial setup
- Critical configuration that must be completed
- First-time user experiences
- Setup processes that require full user focus

## Key Features

- **Fullscreen experience**: Takes over the entire viewport
- **Linear workflow**: Guided step-by-step process
- **Mandatory completion**: Users must complete or explicitly exit
- **Rich content**: Maximum space for complex configuration forms

## Usage

Use captive wizards when:
- Initial system setup is required
- Configuration is critical and shouldn't be skipped
- Users need maximum screen space for complex forms
- The process requires full user attention and focus
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<CaptiveWizardDemoComponent>;

export const CaptiveWizard: Story = {
  render: (args) => ({
    template: `<captive-wizard-demo></captive-wizard-demo>`,
    props: args,
    moduleMetadata: {
      imports: [
        CaptiveWizardDemoComponent,
        OnboardingWizardDialogComponent,
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