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
import { TnTabComponent } from '../../lib/tab/tab.component';
import { TnTabPanelComponent } from '../../lib/tab-panel/tab-panel.component';
import { TnTabsComponent } from '../../lib/tabs/tabs.component';

// VM Creation Tabbed Wizard Dialog Component  
@Component({
  selector: 'tabbed-wizard-dialog',
  templateUrl: './tabbed-wizard.stories.html',
  standalone: true,
  imports: [
    TnDialogShellComponent,
    TnTabsComponent,
    TnTabComponent,
    TnTabPanelComponent,
    TnButtonComponent,
    TnRadioComponent,
    TnCheckboxComponent,
    TnInputComponent,
    TnSelectComponent,
    FormsModule
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

  isoOptions: TnSelectOption[] = [
    { value: 'ubuntu-22.04.iso', label: 'Ubuntu 22.04 LTS' },
    { value: 'windows-11.iso', label: 'Windows 11' },
    { value: 'freebsd-13.iso', label: 'FreeBSD 13.0' },
    { value: 'custom.iso', label: 'Custom ISO' }
  ];

  machineOptions: TnSelectOption[] = [
    { value: 'q35', label: 'Q35' },
    { value: 'i440fx', label: 'i440FX' }
  ];

  cpuModeOptions: TnSelectOption[] = [
    { value: 'host-model', label: 'Host Model' },
    { value: 'host-passthrough', label: 'Host Passthrough' },
    { value: 'custom', label: 'Custom' }
  ];

  networkOptions: TnSelectOption[] = [
    { value: 'bridge0', label: 'bridge0' },
    { value: 'nat', label: 'NAT' },
    { value: 'hostonly', label: 'Host Only' }
  ];

  ref = inject(DialogRef<unknown>);

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
  imports: [TnButtonComponent]
})
class TabbedWizardDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: TnDialog) {}

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
        TnDialogShellComponent,
        TnTabsComponent,
        TnTabComponent,
        TnTabPanelComponent,
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