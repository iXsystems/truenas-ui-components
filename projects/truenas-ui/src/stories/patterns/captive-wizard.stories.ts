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

// Onboarding Wizard Dialog Component
@Component({
  selector: 'onboarding-wizard-dialog',
  template: `
    <ix-dialog-shell title="TrueNAS System Onboarding" [showFullscreenButton]="false">
      <div style="padding: 0 var(--content-padding); margin-top: var(--content-padding);">
        <ix-stepper [linear]="true" [selectedIndex]="currentStep" orientation="horizontal" (selectionChange)="onStepChange($event)">
        
        <ix-step label="Storage Setup" [completed]="step1Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Storage Setup</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Create at least one writable pool/dataset for your data.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Pool Name</label>
              <ix-input placeholder="tank" [(ngModel)]="config.storage.poolName"></ix-input>
            </div>
            
            <div>
              <ix-checkbox label="Enable Compression (LZ4)" [(ngModel)]="config.storage.compression"></ix-checkbox>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Create Starter Datasets</label>
              <div style="display: grid; gap: 8px;">
                <ix-checkbox label="media - For photos, videos, music" [(ngModel)]="config.storage.createMedia"></ix-checkbox>
                <ix-checkbox label="backups - For backup storage" [(ngModel)]="config.storage.createBackups"></ix-checkbox>
                <ix-checkbox label="vm-storage - For virtual machines" [(ngModel)]="config.storage.createVmStorage"></ix-checkbox>
              </div>
            </div>
            
            <div style="margin-top: 16px;">
              <h4 style="margin-bottom: 16px; color: var(--fg1); border-bottom: 1px solid var(--lines); padding-bottom: 8px;">Basic Pool Setup</h4>
              
              <div style="display: grid; gap: 16px;">
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Available Disks</label>
                  <div style="display: grid; gap: 8px;">
                    <ix-checkbox label="sda - 1TB WD Blue (Empty)" [(ngModel)]="config.storage.disk1"></ix-checkbox>
                    <ix-checkbox label="sdb - 1TB WD Blue (Empty)" [(ngModel)]="config.storage.disk2"></ix-checkbox>
                    <ix-checkbox label="sdc - 2TB Seagate (Empty)" [(ngModel)]="config.storage.disk3"></ix-checkbox>
                  </div>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">RAID/ZFS Layout</label>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <ix-radio name="raidType" value="mirror" label="Mirror (RAID1) - Best redundancy" [(ngModel)]="config.storage.raidType"></ix-radio>
                    <ix-radio name="raidType" value="raidz1" label="RAIDZ1 - Good balance of space/redundancy (min 3 disks)" [(ngModel)]="config.storage.raidType"></ix-radio>
                    <ix-radio name="raidType" value="raidz2" label="RAIDZ2 - Higher redundancy, can lose 2 disks (min 4 disks)" [(ngModel)]="config.storage.raidType"></ix-radio>
                    <ix-radio name="raidType" value="raidz3" label="RAIDZ3 - Highest redundancy, can lose 3 disks (min 5 disks)" [(ngModel)]="config.storage.raidType"></ix-radio>
                    <ix-radio name="raidType" value="stripe" label="Stripe - Maximum space, no redundancy" [(ngModel)]="config.storage.raidType"></ix-radio>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <ix-checkbox label="Advanced Pool Options" [(ngModel)]="config.storage.advancedOptions"></ix-checkbox>
            </div>
            
            <div *ngIf="config.storage.advancedOptions" style="margin-top: 16px;">
              <h4 style="margin-bottom: 16px; color: var(--fg1); border-bottom: 1px solid var(--lines); padding-bottom: 8px;">Advanced Options</h4>
              
              <div style="display: grid; gap: 16px;">
                <div>
                  <ix-checkbox label="Reserve disks as hot spares" [(ngModel)]="config.storage.enableHotSpares"></ix-checkbox>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">SLOG Device (Optional)</label>
                  <ix-select [options]="slogDeviceOptions" placeholder="Select dedicated log device" [(ngModel)]="config.storage.slogDevice"></ix-select>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">L2ARC Cache Device (Optional)</label>
                  <ix-select [options]="cacheDeviceOptions" placeholder="Select cache device" [(ngModel)]="config.storage.l2arcDevice"></ix-select>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Metadata Special Device (Optional)</label>
                  <ix-select [options]="metadataDeviceOptions" placeholder="Select metadata device" [(ngModel)]="config.storage.metadataDevice"></ix-select>
                </div>
                
                <div>
                  <ix-checkbox label="Enable pool encryption" [(ngModel)]="config.storage.enableEncryption"></ix-checkbox>
                </div>
                
                <div>
                  <ix-checkbox label="Enable deduplication" [(ngModel)]="config.storage.enableDeduplication"></ix-checkbox>
                  <div *ngIf="config.storage.enableDeduplication" style="margin-top: 8px; padding: 8px; background: var(--warning-bg); border-radius: 4px; font-size: 14px; color: var(--warning-fg);">
                    <strong>Warning:</strong> Deduplication requires significant RAM (5GB+ recommended per TB of storage).
                  </div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--lines);">
              <ix-button variant="outline" 
                         color="warn"
                         label="Exit Wizard and Setup DRAID"
                         (click)="exitForDraid()">
              </ix-button>
            </div>
          </div>
        </ix-step>

        <ix-step label="Identity & Network" [completed]="step2Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Identity & Network</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Make your NAS reachable and properly identified on the network.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Hostname</label>
              <ix-input placeholder="truenas-server" [(ngModel)]="config.network.hostname"></ix-input>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Domain</label>
              <ix-input placeholder="home.local" [(ngModel)]="config.network.domain"></ix-input>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Network Configuration</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <ix-radio name="ipType" value="dhcp" label="DHCP (Automatic)" [(ngModel)]="config.network.ipType"></ix-radio>
                <ix-radio name="ipType" value="static" label="Static IP Address" [(ngModel)]="config.network.ipType"></ix-radio>
              </div>
            </div>
            
            <div *ngIf="config.network.ipType === 'static'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Static IP Address</label>
              <ix-input placeholder="192.168.1.100/24" [(ngModel)]="config.network.staticIp"></ix-input>
            </div>
            
            <div *ngIf="config.network.ipType === 'static'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Gateway</label>
              <ix-input placeholder="192.168.1.1" [(ngModel)]="config.network.gateway"></ix-input>
            </div>
          </div>
        </ix-step>

        <ix-step label="Administrator Account" [completed]="step3Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Administrator Account</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Create the initial administrator account for your TrueNAS system.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Username</label>
              <ix-input placeholder="admin" [(ngModel)]="config.admin.username"></ix-input>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Password</label>
              <ix-input type="password" placeholder="Enter secure password" [(ngModel)]="config.admin.password"></ix-input>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Confirm Password</label>
              <ix-input type="password" placeholder="Confirm password" [(ngModel)]="config.admin.confirmPassword"></ix-input>
            </div>
            
            <div>
              <ix-checkbox label="Enable root SSH access" [(ngModel)]="config.admin.enableSsh"></ix-checkbox>
            </div>
          </div>
        </ix-step>

        <ix-step label="Services & Security" [completed]="step4Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Services & Security</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Configure essential services and security settings for your TrueNAS system.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <h4 style="margin-bottom: 16px; color: var(--fg1); border-bottom: 1px solid var(--lines); padding-bottom: 8px;">Core Services</h4>
              <div style="display: grid; gap: 8px;">
                <ix-checkbox label="Enable SMB/CIFS file sharing" [(ngModel)]="config.services.enableSmb"></ix-checkbox>
                <ix-checkbox label="Enable NFS file sharing" [(ngModel)]="config.services.enableNfs"></ix-checkbox>
                <ix-checkbox label="Enable FTP service" [(ngModel)]="config.services.enableFtp"></ix-checkbox>
                <ix-checkbox label="Enable SMART monitoring" [(ngModel)]="config.services.enableSmart"></ix-checkbox>
              </div>
            </div>
            
            <div>
              <h4 style="margin-bottom: 16px; color: var(--fg1); border-bottom: 1px solid var(--lines); padding-bottom: 8px;">Security Settings</h4>
              <div style="display: grid; gap: 12px;">
                <ix-checkbox label="Enable automatic security updates" [(ngModel)]="config.services.autoUpdates"></ix-checkbox>
                <ix-checkbox label="Enable fail2ban intrusion prevention" [(ngModel)]="config.services.enableFail2ban"></ix-checkbox>
                <ix-checkbox label="Enable firewall" [(ngModel)]="config.services.enableFirewall"></ix-checkbox>
              </div>
            </div>
          </div>
        </ix-step>

        <ix-step label="HTTPS & Certificates" [completed]="step5Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">HTTPS & Certificates</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Configure HTTPS access and SSL certificates for secure web interface access.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Certificate Type</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <ix-radio name="certType" value="self-signed" label="Self-signed certificate (Quick setup)" [(ngModel)]="config.https.certType"></ix-radio>
                <ix-radio name="certType" value="letsencrypt" label="Let's Encrypt certificate (Requires domain)" [(ngModel)]="config.https.certType"></ix-radio>
                <ix-radio name="certType" value="existing" label="Import existing certificate" [(ngModel)]="config.https.certType"></ix-radio>
              </div>
            </div>
            
            <div *ngIf="config.https.certType === 'letsencrypt'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Domain Name</label>
              <ix-input placeholder="truenas.example.com" [(ngModel)]="config.https.domain"></ix-input>
            </div>
            
            <div *ngIf="config.https.certType === 'letsencrypt'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Email for Certificate Notifications</label>
              <ix-input type="email" placeholder="admin@example.com" [(ngModel)]="config.https.email"></ix-input>
            </div>
            
            <div>
              <ix-checkbox label="Redirect HTTP to HTTPS" [(ngModel)]="config.https.redirectHttp"></ix-checkbox>
            </div>
            
            <div>
              <ix-checkbox label="Enable HSTS (HTTP Strict Transport Security)" [(ngModel)]="config.https.enableHsts"></ix-checkbox>
            </div>
          </div>
        </ix-step>

        <ix-step label="Notifications" [completed]="step6Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Notifications</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Configure how TrueNAS will notify you about system events and alerts.</p>
          
          <div style="display: grid; gap: 16px; max-width: 600px;">
            <div>
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Notification Method</label>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <ix-radio name="notifyMethod" value="email" label="Email notifications" [(ngModel)]="config.notifications.method"></ix-radio>
                <ix-radio name="notifyMethod" value="slack" label="Slack notifications" [(ngModel)]="config.notifications.method"></ix-radio>
                <ix-radio name="notifyMethod" value="webhook" label="Custom webhook" [(ngModel)]="config.notifications.method"></ix-radio>
                <ix-radio name="notifyMethod" value="none" label="No notifications" [(ngModel)]="config.notifications.method"></ix-radio>
              </div>
            </div>
            
            <div *ngIf="config.notifications.method === 'email'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Email Address</label>
              <ix-input type="email" placeholder="admin@example.com" [(ngModel)]="config.notifications.email"></ix-input>
            </div>
            
            <div *ngIf="config.notifications.method === 'email'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">SMTP Server</label>
              <ix-input placeholder="smtp.gmail.com" [(ngModel)]="config.notifications.smtpServer"></ix-input>
            </div>
            
            <div *ngIf="config.notifications.method === 'slack'">
              <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Slack Webhook URL</label>
              <ix-input placeholder="https://hooks.slack.com/services/..." [(ngModel)]="config.notifications.slackWebhook"></ix-input>
            </div>
            
            <div style="margin-top: 16px;">
              <h4 style="margin-bottom: 12px; color: var(--fg1);">Alert Types</h4>
              <div style="display: grid; gap: 8px;">
                <ix-checkbox label="System health alerts" [(ngModel)]="config.notifications.systemHealth"></ix-checkbox>
                <ix-checkbox label="Storage alerts" [(ngModel)]="config.notifications.storageAlerts"></ix-checkbox>
                <ix-checkbox label="Security alerts" [(ngModel)]="config.notifications.securityAlerts"></ix-checkbox>
                <ix-checkbox label="Update notifications" [(ngModel)]="config.notifications.updateAlerts"></ix-checkbox>
              </div>
            </div>
          </div>
        </ix-step>

        <ix-step label="Review & Finish" [completed]="step7Complete">
          <h2 style="color: var(--fg2); margin-top: unset;">Review & Finish</h2>
          <p style="margin-bottom: 16px; color: var(--fg2);">Review your configuration and complete the onboarding process.</p>
          
          <div style="display: grid; gap: 16px;">
            <div style="background: var(--bg2); padding: 16px; border-radius: 8px; border: 1px solid var(--lines);">
              <h4 style="margin: 0 0 12px 0; color: var(--fg1);">Configuration Summary</h4>
              <div style="display: grid; gap: 8px; font-size: 14px; color: var(--fg2);">
                <div><strong>Storage Pool:</strong> {{ config.storage.poolName || 'Not specified' }} ({{ getRaidTypeLabel(config.storage.raidType) }})</div>
                <div><strong>Hostname:</strong> {{ config.network.hostname || 'Not specified' }}.{{ config.network.domain || 'home.local' }}</div>
                <div><strong>Network:</strong> {{ config.network.ipType === 'dhcp' ? 'DHCP' : 'Static IP (' + config.network.staticIp + ')' }}</div>
                <div><strong>Admin User:</strong> {{ config.admin.username || 'Not specified' }}</div>
                <div><strong>HTTPS:</strong> {{ getHttpsLabel() }}</div>
                <div><strong>Notifications:</strong> {{ getNotificationLabel() }}</div>
                <div><strong>Services:</strong> {{ getEnabledServicesCount() }} enabled</div>
              </div>
            </div>
            
            <div style="padding: 16px; background: var(--success-bg); border-radius: 8px; border: 1px solid var(--success);">
              <h4 style="margin: 0 0 8px 0; color: var(--success);">Ready to Complete Setup</h4>
              <p style="margin: 0; font-size: 14px; color: var(--success);">
                Your TrueNAS system is configured and ready to be initialized. Click "Complete Setup" to apply all settings and start your system.
              </p>
            </div>
            
            <div>
              <ix-checkbox label="Start all configured services" [(ngModel)]="config.final.startServices"></ix-checkbox>
            </div>
            
            <div>
              <ix-checkbox label="Launch TrueNAS web interface after setup" [(ngModel)]="config.final.launchWebInterface"></ix-checkbox>
            </div>
            
            <div>
              <ix-checkbox label="Download configuration as file" [(ngModel)]="config.final.downloadConfig"></ix-checkbox>
            </div>
          </div>
        </ix-step>

        </ix-stepper>
      </div>
      
      <div ixDialogAction>
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
  config = {
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

  constructor(public ref: DialogRef<any>) {}

  onStepChange(event: any) {
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
    if (this.currentStep === 6) return 'Complete Setup';
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
    if (services.enableSmb) count++;
    if (services.enableNfs) count++;
    if (services.enableFtp) count++;
    if (services.enableSmart) count++;
    return count;
  }
}

// Demo Component
@Component({
  selector: 'captive-wizard-demo',
  template: `
    <div style="padding: 20px;">
      <h1 style="margin-bottom: 8px; color: var(--fg1); font-family: var(--font-family-header);">Captive Wizard Pattern</h1>
      <p style="margin-bottom: 16px; color: var(--fg2); font-style: italic; font-size: 14px;">For mandatory or critical workflows</p>
      <p style="margin-bottom: 16px; color: var(--fg2);">
        The Captive Wizard pattern uses the ix-stepper in horizontal mode within a fullscreen dialog to guide users through 
        initial system setup. This pattern is ideal for first-time setup workflows where users need to complete configuration 
        steps in a specific order with maximum screen real estate.
      </p>
      <ix-button variant="primary" 
                 label="Launch Captive Wizard"
                 (click)="openCaptiveWizard()">
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
class CaptiveWizardDemoComponent {
  lastResult: any = null;

  constructor(private ixDialog: IxDialog) {}

  openCaptiveWizard() {
    const dialogRef = this.ixDialog.open(OnboardingWizardDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      disableClose: true
    });

    dialogRef.closed.subscribe((result: any) => {
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