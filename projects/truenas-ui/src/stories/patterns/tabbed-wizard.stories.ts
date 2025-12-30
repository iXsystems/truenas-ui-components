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
import { IxTabComponent } from '../../lib/ix-tab/ix-tab.component';
import { IxTabPanelComponent } from '../../lib/ix-tab-panel/ix-tab-panel.component';
import { IxTabsComponent } from '../../lib/ix-tabs/ix-tabs.component';

// VM Creation Tabbed Wizard Dialog Component  
@Component({
  selector: 'tabbed-wizard-dialog',
  template: `
    <ix-dialog-shell title="Create Virtual Machine" [showFullscreenButton]="true">
      <ix-tabs orientation="vertical" [selectedIndex]="0">
        <ix-tab label="General" />
        <ix-tab label="OS" />
        <ix-tab label="System" />
        <ix-tab label="Disks" />
        <ix-tab label="CPU" />
        <ix-tab label="Memory" />
        <ix-tab label="Network" />

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">General</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Basic virtual machine identification and placement.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">VM Name</label>
                <ix-input placeholder="my-virtual-machine" [(ngModel)]="vmConfig.general.name" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Description</label>
                <ix-input placeholder="Brief description of this VM" [(ngModel)]="vmConfig.general.description" />
              </div>
              
              <div>
                <ix-checkbox label="Start on boot" [(ngModel)]="vmConfig.general.autoStart" />
              </div>
              
              <div>
                <ix-checkbox label="Enable VNC remote access" [(ngModel)]="vmConfig.general.enableVnc" />
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">OS</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Operating system configuration and installation media.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Guest Operating System</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <ix-radio name="osType" value="linux" label="Linux" [(ngModel)]="vmConfig.os.type" />
                  <ix-radio name="osType" value="windows" label="Windows" [(ngModel)]="vmConfig.os.type" />
                  <ix-radio name="osType" value="freebsd" label="FreeBSD" [(ngModel)]="vmConfig.os.type" />
                  <ix-radio name="osType" value="other" label="Other" [(ngModel)]="vmConfig.os.type" />
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Installation Media</label>
                <ix-select placeholder="Select ISO image" [options]="isoOptions" [(ngModel)]="vmConfig.os.bootImage" />
              </div>
              
              <div>
                <ix-checkbox label="Install from network" [(ngModel)]="vmConfig.os.networkInstall" />
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">System</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Hardware abstraction and system firmware settings.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Machine Type</label>
                <ix-select [options]="machineOptions" [(ngModel)]="vmConfig.system.machine" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Boot Method</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <ix-radio name="bootMethod" value="uefi" label="UEFI" [(ngModel)]="vmConfig.system.bootMethod" />
                  <ix-radio name="bootMethod" value="legacy" label="Legacy BIOS" [(ngModel)]="vmConfig.system.bootMethod" />
                </div>
              </div>
              
              <div>
                <ix-checkbox label="Enable Secure Boot" [disabled]="vmConfig.system.bootMethod !== 'uefi'" [(ngModel)]="vmConfig.system.secureBoot" />
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">Disks</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Storage configuration and disk settings.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Create new disk</label>
                <ix-checkbox label="Create a new virtual disk" [(ngModel)]="vmConfig.disks.createNew" />
              </div>
              
              <div *ngIf="vmConfig.disks.createNew">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Disk Size (GB)</label>
                <ix-input type="number" placeholder="20" [(ngModel)]="vmConfig.disks.size" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Disk Type</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <ix-radio name="diskType" value="virtio" label="VirtIO (Recommended)" [(ngModel)]="vmConfig.disks.type" />
                  <ix-radio name="diskType" value="ahci" label="AHCI" [(ngModel)]="vmConfig.disks.type" />
                  <ix-radio name="diskType" value="ide" label="IDE (Legacy)" [(ngModel)]="vmConfig.disks.type" />
                </div>
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">CPU</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Processor configuration and CPU topology.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">CPU Cores</label>
                <ix-input type="number" placeholder="2" [(ngModel)]="vmConfig.cpu.cores" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">CPU Threads</label>
                <ix-input type="number" placeholder="1" [(ngModel)]="vmConfig.cpu.threads" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">CPU Mode</label>
                <ix-select [options]="cpuModeOptions" [(ngModel)]="vmConfig.cpu.mode" />
              </div>
              
              <div>
                <ix-checkbox label="Enable CPU hotplug" [(ngModel)]="vmConfig.cpu.hotplug" />
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">Memory</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">RAM allocation and memory ballooning configuration.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Memory Size (MB)</label>
                <ix-input type="number" placeholder="4096" [(ngModel)]="vmConfig.memory.size" />
              </div>
              
              <div>
                <ix-checkbox label="Enable memory ballooning" [(ngModel)]="vmConfig.memory.ballooning" />
              </div>
              
              <div>
                <ix-checkbox label="Enable memory hotplug" [(ngModel)]="vmConfig.memory.hotplug" />
              </div>
            </div>
          </div>
        </ix-tab-panel>

        <ix-tab-panel>
          <div style="padding: 0 16px;">
            <h2 style="color: var(--fg2);">Network</h2>
            <p style="margin-bottom: 16px; color: var(--fg2);">Network adapter configuration and connectivity settings.</p>
            
            <div style="display: grid; gap: 16px;">
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">Network Interface</label>
                <ix-select [options]="networkOptions" [(ngModel)]="vmConfig.network.interface" />
              </div>
              
              <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--fg1);">NIC Type</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <ix-radio name="nicType" value="virtio" label="VirtIO (Recommended)" [(ngModel)]="vmConfig.network.nicType" />
                  <ix-radio name="nicType" value="e1000" label="Intel E1000" [(ngModel)]="vmConfig.network.nicType" />
                  <ix-radio name="nicType" value="rtl8139" label="Realtek RTL8139" [(ngModel)]="vmConfig.network.nicType" />
                </div>
              </div>
              
              <div>
                <ix-checkbox label="Attach to bridge" [(ngModel)]="vmConfig.network.bridge" />
              </div>
            </div>
          </div>
        </ix-tab-panel>
      </ix-tabs>
      
      <div ixDialogAction>
        <ix-button variant="outline" 
                   label="Cancel"
                   (click)="cancel()" />
        <ix-button color="primary" 
                   label="Create Virtual Machine"
                   (click)="createVM()" />
      </div>
    </ix-dialog-shell>
  `,
  standalone: true,
  imports: [
    IxDialogShellComponent,
    IxTabsComponent,
    IxTabComponent,
    IxTabPanelComponent,
    IxButtonComponent,
    IxRadioComponent,
    IxCheckboxComponent,
    IxInputComponent,
    IxSelectComponent,
    FormsModule,
    CommonModule
  ]
})
class TabbedWizardDialogComponent {
  vmConfig = {
    general: {
      name: '',
      description: '',
      autoStart: false,
      enableVnc: true
    },
    os: {
      type: 'linux',
      bootImage: '',
      networkInstall: false
    },
    system: {
      machine: 'q35',
      bootMethod: 'uefi',
      secureboot: false
    },
    disks: {
      createNew: true,
      size: 20,
      type: 'virtio'
    },
    cpu: {
      cores: 2,
      threads: 1,
      mode: 'host-model',
      hotplug: false
    },
    memory: {
      size: 4096,
      ballooning: false,
      hotplug: false
    },
    network: {
      interface: 'bridge0',
      nicType: 'virtio',
      bridge: true
    }
  };

  isoOptions: IxSelectOption[] = [
    { value: 'ubuntu-22.04.iso', label: 'Ubuntu 22.04 LTS' },
    { value: 'windows-11.iso', label: 'Windows 11' },
    { value: 'freebsd-13.iso', label: 'FreeBSD 13.0' },
    { value: 'custom.iso', label: 'Custom ISO' }
  ];

  machineOptions: IxSelectOption[] = [
    { value: 'q35', label: 'Q35' },
    { value: 'i440fx', label: 'i440FX' }
  ];

  cpuModeOptions: IxSelectOption[] = [
    { value: 'host-model', label: 'Host Model' },
    { value: 'host-passthrough', label: 'Host Passthrough' },
    { value: 'custom', label: 'Custom' }
  ];

  networkOptions: IxSelectOption[] = [
    { value: 'bridge0', label: 'bridge0' },
    { value: 'nat', label: 'NAT' },
    { value: 'hostonly', label: 'Host Only' }
  ];

  constructor(public ref: DialogRef<typeof this.vmConfig | undefined>) {}

  cancel() {
    this.ref.close();
  }

  createVM() {
    this.ref.close(this.vmConfig);
  }
}

// Demo Component
@Component({
  selector: 'tabbed-wizard-demo',
  template: `
    <div style="padding: 20px;">
      <h1 style="margin-bottom: 8px; color: var(--fg1); font-family: var(--font-family-header);">Tabbed Wizard Pattern</h1>
      <p style="margin-bottom: 16px; color: var(--fg2); font-style: italic; font-size: 14px;">For non-linear workflows</p>
      <p style="margin-bottom: 16px; color: var(--fg2);">
        The Tabbed Wizard pattern combines the ix-dialog and ix-tabs components to create non-linear, multi-section workflows. 
        This VM creation example demonstrates how users can jump between different configuration sections freely, making it ideal 
        for complex forms where step order doesn't matter.
      </p>
      <ix-button variant="primary" 
                 label="Launch Tabbed Wizard"
                 (click)="openTabbedWizard()" />
      
      <div *ngIf="lastResult" style="margin-top: 24px; padding: 16px; border: 1px solid var(--lines); border-radius: 8px;">
        <h4>Last Result:</h4>
        <pre style="margin: 8px 0 0 0; color: var(--fg2);">{{ lastResult | json }}</pre>
      </div>
    </div>
  `,
  standalone: true,
  imports: [IxButtonComponent, CommonModule]
})
class TabbedWizardDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: IxDialog) {}

  openTabbedWizard() {
    const dialogRef = this.ixDialog.open(TabbedWizardDialogComponent, {
      width: '800px',
      height: '600px'
    });

    dialogRef.closed.subscribe((result: unknown) => {
      this.lastResult = result || 'VM creation was cancelled';
    });
  }
}

const meta: Meta<TabbedWizardDemoComponent> = {
  title: 'Patterns/Wizards/Tabbed Wizard',
  component: TabbedWizardDemoComponent,
  parameters: {
    docs: {
      description: {
        component: `
# Tabbed Wizard Pattern

The Tabbed Wizard pattern provides a non-linear, multi-section interface where users can navigate freely between different configuration areas. This pattern is ideal for:

- Complex configuration forms
- Settings panels with multiple categories
- Data entry forms where sections are independent
- Workflows where step order is flexible

## Key Features

- **Non-linear navigation**: Users can jump between any tabs
- **Section organization**: Related settings grouped into logical tabs
- **Independent validation**: Each section can be validated independently
- **Full-width content**: Takes advantage of dialog space efficiently

## Usage

Use tabbed wizards when:
- Sections don't have strict dependencies
- Users may want to revisit previous sections
- Configuration has multiple independent areas
- Complex forms need better organization
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<TabbedWizardDemoComponent>;

export const TabbedWizard: Story = {
  render: (args) => ({
    template: `<tabbed-wizard-demo></tabbed-wizard-demo>`,
    props: args,
    moduleMetadata: {
      imports: [
        TabbedWizardDemoComponent,
        TabbedWizardDialogComponent,
        IxDialogShellComponent,
        IxTabsComponent,
        IxTabComponent,
        IxTabPanelComponent,
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