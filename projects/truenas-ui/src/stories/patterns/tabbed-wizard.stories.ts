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
  templateUrl: './tabbed-wizard.stories.html',
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
  templateUrl: './tabbed-wizard-2.stories.html',
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