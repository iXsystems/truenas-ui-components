import type { DialogRef} from '@angular/cdk/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { JsonPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxButtonComponent } from '../lib/ix-button/ix-button.component';
import { IxDialogShellComponent } from '../lib/ix-dialog/ix-dialog-shell.component';
import { IxDialog } from '../lib/ix-dialog/ix-dialog.service';
import { IxFormFieldComponent } from '../lib/ix-form-field/ix-form-field.component';
import { IxInputComponent } from '../lib/ix-input/ix-input.component';

// Example user edit dialog component
@Component({
  selector: 'user-edit-dialog',
  template: `
    <ix-dialog-shell title="Edit User">
      <form style="padding: var(--content-padding);">
        <ix-form-field label="Name">
          <ix-input name="name" placeholder="Enter user name" [(ngModel)]="name" />
        </ix-form-field>
        <ix-form-field label="Email">  
          <ix-input name="email" placeholder="Enter email address" [(ngModel)]="email" />
        </ix-form-field>
        <ix-form-field label="Role">
          <ix-input name="role" placeholder="Enter user role" [(ngModel)]="role" />
        </ix-form-field>
      </form>
      
      <div ixDialogAction>
        <ix-button type="button" variant="outline" label="Cancel" (click)="cancel()" />
        <ix-button type="button" color="primary" label="Save User" (click)="save()" />
      </div>
    </ix-dialog-shell>
  `,
  standalone: true,
  imports: [
    IxDialogShellComponent,
    IxButtonComponent,
    IxFormFieldComponent,
    IxInputComponent,
    FormsModule
  ]
})
class UserEditDialogComponent {
  name = '';
  email = '';
  role = '';

  constructor(
    public ref: DialogRef<{ name: string; email: string; role: string } | undefined>,
    @Inject(DIALOG_DATA) public data: { userId: number; name?: string; email?: string; role?: string }
  ) {
    // Pre-fill form with existing data if available
    this.name = data?.name || '';
    this.email = data?.email || '';  
    this.role = data?.role || '';
  }

  cancel() {
    this.ref.close();
  }

  save() {
    this.ref.close({ 
      name: this.name, 
      email: this.email, 
      role: this.role 
    });
  }
}

// Scrollable content dialog component  
@Component({
  selector: 'system-settings-dialog',
  template: `
    <ix-dialog-shell title="System Settings" [showFullscreenButton]="true">
      <div style="height: 800px; padding: var(--content-padding);">
        <h3>Network Configuration</h3>
        <p>Configure your network interfaces and routing settings. These settings will affect all network communication for your TrueNAS system.</p>
        
        <h4>Interface Configuration</h4>
        <ul>
          <li><strong>eth0:</strong> Primary ethernet interface (192.168.1.100/24)</li>
          <li><strong>eth1:</strong> Secondary ethernet interface (10.0.0.100/8)</li>
          <li><strong>wlan0:</strong> Wireless interface (disabled)</li>
          <li><strong>lo:</strong> Loopback interface (127.0.0.1/8)</li>
        </ul>
        
        <h3>Storage Configuration</h3>
        <p>Manage your storage pools, datasets, and snapshots. Review current usage and configure automated tasks.</p>
        
        <h4>Current Pool Status</h4>
        <ul>
          <li><strong>pool1:</strong> 2.4 TB used of 4.0 TB (60% full) - HEALTHY</li>
          <li><strong>pool2:</strong> 800 GB used of 2.0 TB (40% full) - HEALTHY</li>
          <li><strong>backup-pool:</strong> 500 GB used of 1.0 TB (50% full) - HEALTHY</li>
        </ul>
        
        <h3>System Services</h3>
        <p>The following services are currently running on your TrueNAS system:</p>
        
        <h4>Core Services</h4>
        <ul>
          <li>SSH Server (Port 22) - Active since 2024-01-15 09:30:15</li>
          <li>HTTP Server (Port 80) - Active since 2024-01-15 09:30:20</li>
          <li>HTTPS Server (Port 443) - Active since 2024-01-15 09:30:25</li>
          <li>SMB/CIFS Server (Ports 139, 445) - Active since 2024-01-15 09:30:30</li>
          <li>NFS Server (Port 2049) - Active since 2024-01-15 09:30:35</li>
          <li>FTP Server (Port 21) - Disabled</li>
          <li>rsync Server (Port 873) - Active since 2024-01-15 09:30:40</li>
        </ul>
        
        <h4>Background Services</h4>
        <ul>
          <li>Scrub Scheduler - Next scrub: Sunday 02:00 AM</li>
          <li>Snapshot Manager - Taking snapshots every 4 hours</li>
          <li>Replication Tasks - 3 active replication jobs</li>
          <li>Cloud Sync - Syncing to AWS S3 every 6 hours</li>
          <li>System Update Checker - Runs every 24 hours</li>
          <li>Performance Metrics Collection - Real-time monitoring</li>
          <li>Email Notifications - SMTP configured</li>
          <li>UPS Monitor - Connected to CyberPower CP1500</li>
        </ul>
        
        <h3>Security Settings</h3>
        <p>Review and configure security policies, user access controls, and system hardening options.</p>
        
        <h4>Authentication & Access</h4>
        <ul>
          <li>Password complexity: Minimum 12 characters with mixed case</li>
          <li>Two-factor authentication: Enabled for admin accounts</li>
          <li>Failed login threshold: 5 attempts before lockout</li>
          <li>Account lockout duration: 30 minutes</li>
          <li>Session timeout: 4 hours of inactivity</li>
          <li>API key rotation: Every 90 days</li>
        </ul>
        
        <h4>System Hardening</h4>
        <ul>
          <li>Firewall: Enabled with default deny policy</li>
          <li>Intrusion detection: Enabled with real-time monitoring</li>
          <li>Audit logging: All administrative actions logged</li>
          <li>Certificate management: Auto-renewal enabled</li>
          <li>Secure boot: Enabled</li>
          <li>Memory protection: ASLR and DEP enabled</li>
        </ul>
        
        <p><strong>Important:</strong> Changes to security settings may require system restart and could temporarily affect system availability. Always test configuration changes in a non-production environment first.</p>
      </div>
      
      <div ixDialogAction>
        <ix-button type="button" variant="outline" label="Cancel" (click)="ref.close()" />
        <ix-button type="button" color="primary" label="Apply Settings" (click)="ref.close('apply')" />
      </div>
    </ix-dialog-shell>
  `,
  standalone: true,
  imports: [IxDialogShellComponent, IxButtonComponent]
})
class SystemSettingsDialogComponent {
  constructor(public ref: DialogRef<string>) {}
}

// Fullscreen-only dialog component (no toggle button needed)
@Component({
  selector: 'fullscreen-settings-dialog',
  template: `
    <ix-dialog-shell title="System Settings">
      <div style="height: 800px; padding: var(--content-padding);">
        <h3>Network Configuration</h3>
        <p>Configure your network interfaces and routing settings. These settings will affect all network communication for your TrueNAS system.</p>
        
        <h4>Interface Configuration</h4>
        <ul>
          <li><strong>eth0:</strong> Primary ethernet interface (192.168.1.100/24)</li>
          <li><strong>eth1:</strong> Secondary ethernet interface (10.0.0.100/8)</li>
          <li><strong>wlan0:</strong> Wireless interface (disabled)</li>
          <li><strong>lo:</strong> Loopback interface (127.0.0.1/8)</li>
        </ul>
        
        <h3>Storage Configuration</h3>
        <p>Manage your storage pools, datasets, and snapshots. Review current usage and configure automated tasks.</p>
        
        <h4>Current Pool Status</h4>
        <ul>
          <li><strong>pool1:</strong> 2.4 TB used of 4.0 TB (60% full) - HEALTHY</li>
          <li><strong>pool2:</strong> 800 GB used of 2.0 TB (40% full) - HEALTHY</li>
          <li><strong>backup-pool:</strong> 500 GB used of 1.0 TB (50% full) - HEALTHY</li>
        </ul>
        
        <h3>System Services</h3>
        <p>The following services are currently running on your TrueNAS system:</p>
        
        <h4>Core Services</h4>
        <ul>
          <li>SSH Server (Port 22) - Active since 2024-01-15 09:30:15</li>
          <li>HTTP Server (Port 80) - Active since 2024-01-15 09:30:20</li>
          <li>HTTPS Server (Port 443) - Active since 2024-01-15 09:30:25</li>
          <li>SMB/CIFS Server (Ports 139, 445) - Active since 2024-01-15 09:30:30</li>
          <li>NFS Server (Port 2049) - Active since 2024-01-15 09:30:35</li>
          <li>FTP Server (Port 21) - Disabled</li>
          <li>rsync Server (Port 873) - Active since 2024-01-15 09:30:40</li>
        </ul>
        
        <h4>Background Services</h4>
        <ul>
          <li>Scrub Scheduler - Next scrub: Sunday 02:00 AM</li>
          <li>Snapshot Manager - Taking snapshots every 4 hours</li>
          <li>Replication Tasks - 3 active replication jobs</li>
          <li>Cloud Sync - Syncing to AWS S3 every 6 hours</li>
          <li>System Update Checker - Runs every 24 hours</li>
          <li>Performance Metrics Collection - Real-time monitoring</li>
          <li>Email Notifications - SMTP configured</li>
          <li>UPS Monitor - Connected to CyberPower CP1500</li>
        </ul>
        
        <h3>Security Settings</h3>
        <p>Review and configure security policies, user access controls, and system hardening options.</p>
        
        <h4>Authentication & Access</h4>
        <ul>
          <li>Password complexity: Minimum 12 characters with mixed case</li>
          <li>Two-factor authentication: Enabled for admin accounts</li>
          <li>Failed login threshold: 5 attempts before lockout</li>
          <li>Account lockout duration: 30 minutes</li>
          <li>Session timeout: 4 hours of inactivity</li>
          <li>API key rotation: Every 90 days</li>
        </ul>
        
        <h4>System Hardening</h4>
        <ul>
          <li>Firewall: Enabled with default deny policy</li>
          <li>Intrusion detection: Enabled with real-time monitoring</li>
          <li>Audit logging: All administrative actions logged</li>
          <li>Certificate management: Auto-renewal enabled</li>
          <li>Secure boot: Enabled</li>
          <li>Memory protection: ASLR and DEP enabled</li>
        </ul>
        
        <p><strong>Important:</strong> Changes to security settings may require system restart and could temporarily affect system availability. Always test configuration changes in a non-production environment first.</p>
      </div>
      
      <div ixDialogAction>
        <ix-button type="button" variant="outline" label="Cancel" (click)="ref.close()" />
        <ix-button type="button" color="primary" label="Apply Settings" (click)="ref.close('apply')" />
      </div>
    </ix-dialog-shell>
  `,
  standalone: true,
  imports: [IxDialogShellComponent, IxButtonComponent]
})
class FullscreenSettingsDialogComponent {
  constructor(public ref: DialogRef<string>) {}
}

// Story component that demonstrates opening dialogs
@Component({
  selector: 'dialog-demo',
  template: `
    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;">
      <ix-button 
        type="button" 
        label="Edit User" 
        (click)="openUserDialog()" />
      
      <ix-button 
        type="button" 
        label="System Settings (Scrollable)" 
        (click)="openSystemDialog()" />
      
      <ix-button 
        type="button" 
        label="Confirm Delete" 
        (click)="openConfirmDialog()" />
      
      <ix-button 
        type="button" 
        label="Fullscreen Settings" 
        (click)="openFullscreenDialog()" />
    </div>
    
    <div style="padding: 16px;">
      <h3 style="margin-top: 0;">Last Dialog Result:</h3>
      <pre style="padding: 12px; border-radius: 4px; overflow-x: auto; border: 1px solid var(--lines, #e5e7eb);">{{ lastResult | json }}</pre>
    </div>
  `,
  standalone: true,
  imports: [IxButtonComponent, JsonPipe]
})
class DialogDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: IxDialog) {}

  openUserDialog() {
    const dialogRef = this.ixDialog.open(UserEditDialogComponent, {
      data: {
        userId: 123,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Administrator'
      },
      width: '500px'
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Dialog was cancelled';
    });
  }

  openSystemDialog() {
    const dialogRef = this.ixDialog.open(SystemSettingsDialogComponent, {
      width: '700px',
      height: '600px'
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Dialog was cancelled';
    });
  }

  openConfirmDialog() {
    void this.ixDialog.confirm({
      title: 'Delete Dataset?',
      message: 'This will permanently delete the dataset "important-data" and all of its contents. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true
    }).then(observable => {
      observable.subscribe((confirmed) => {
        this.lastResult = confirmed ? 'User confirmed deletion' : 'User cancelled deletion';
      });
    });
  }

  openFullscreenDialog() {
    const dialogRef = this.ixDialog.openFullscreen(FullscreenSettingsDialogComponent);

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Fullscreen dialog was cancelled';
    });
  }
}

const meta: Meta<DialogDemoComponent> = {
  title: 'Components/Dialog',
  component: DialogDemoComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The IX Dialog system provides a clean, opinionated API built on top of CDK Dialog. It includes proper scrolling behavior, consistent layout, and follows TrueNAS design patterns.

## Getting Started

To use dialogs in your application, you need to:

1. **Import the dialog service**: Import \`IxDialog\` from the library
2. **Create dialog components**: Build standalone components that use \`ix-dialog-shell\`
3. **Open dialogs**: Use the service to open your dialog components

## Step-by-Step Implementation

### 1. Import Required Dependencies

First, import what you need in your component:

\`\`\`typescript
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { IxDialog } from 'truenas-ui';
import { IxDialogShellComponent } from 'truenas-ui';
\`\`\`

### 2. Create Your Dialog Component

Every dialog component must be a standalone component that uses \`ix-dialog-shell\` as its root element:

\`\`\`typescript
@Component({
  selector: 'my-custom-dialog',
  template: \`
    <ix-dialog-shell title="My Custom Dialog">
      <!-- Your content goes here -->
      <p>This is the dialog content area.</p>
      <form>
        <input [(ngModel)]="myValue" name="myValue">
      </form>
      
      <!-- Action buttons go in a div with ixDialogAction -->
      <div ixDialogAction>
        <ix-button variant="outline" label="Cancel" (click)="cancel()"></ix-button>
        <ix-button label="Save" color="primary" (click)="save()"></ix-button>
      </div>
    </ix-dialog-shell>
  \`,
  standalone: true,
  imports: [
    IxDialogShellComponent,
    IxButtonComponent,
    FormsModule // If using forms
  ]
})
class MyCustomDialogComponent {
  myValue = '';

  constructor(
    // Inject DialogRef to control the dialog
    public dialogRef: DialogRef<any>,
    // Inject data passed from the opener (optional)
    @Inject(DIALOG_DATA) public data: any
  ) {
    // Use passed data
    this.myValue = data?.initialValue || '';
  }

  cancel() {
    this.dialogRef.close(); // Close without result
  }

  save() {
    this.dialogRef.close({ value: this.myValue }); // Close with result
  }
}
\`\`\`

### 3. Open Your Dialog

In the component that needs to open the dialog:

\`\`\`typescript
export class MyPageComponent {
  constructor(private ixDialog: IxDialog) {}

  openMyDialog() {
    const dialogRef = this.ixDialog.open(MyCustomDialogComponent, {
      width: '500px',
      height: '400px',
      data: { initialValue: 'Hello' } // Optional data to pass
    });

    // Subscribe to the result
    dialogRef.closed.subscribe(result => {
      if (result) {
        console.log('User saved:', result.value);
      } else {
        console.log('User cancelled');
      }
    });
  }
}
\`\`\`

## Understanding ix-dialog-shell

The \`ix-dialog-shell\` component provides the dialog layout structure:

### Required Structure
- **Root**: \`<ix-dialog-shell title="Your Title">\`
- **Content**: Everything between the tags becomes scrollable content
- **Actions**: Elements with \`ixDialogAction\` attribute become footer buttons

### Key Features
- **Automatic Layout**: Header with title and close button, scrollable content, footer actions
- **Proper Scrolling**: Only the content area scrolls, header and footer stay fixed
- **Close Button**: Automatically includes a close × button in the header
- **Action Projection**: Use \`ixDialogAction\` to place buttons in the footer

### Customization Options

\`\`\`html
<ix-dialog-shell title="Custom Dialog">
  <!-- Main content area - this will scroll if it overflows -->
  <div>
    <h3>Section 1</h3>
    <p>Your content here...</p>
    
    <h3>Section 2</h3>
    <form>
      <ix-form-field label="Name">
        <ix-input [(ngModel)]="name" name="name"></ix-input>
      </ix-form-field>
    </form>
  </div>
  
  <!-- Footer actions - these stay fixed at the bottom -->
  <div ixDialogAction>
    <ix-button variant="outline" label="Cancel" (click)="dialogRef.close()"></ix-button>
    <ix-button label="Save" color="primary" (click)="save()"></ix-button>
  </div>
</ix-dialog-shell>
\`\`\`

## Configuration Options

When opening dialogs, you can configure:

\`\`\`typescript
this.ixDialog.open(MyDialogComponent, {
  width: '600px',           // Dialog width
  height: '500px',          // Dialog height  
  maxWidth: '90vw',         // Maximum width
  maxHeight: '90vh',        // Maximum height
  disableClose: true,       // Prevent ESC/backdrop close
  data: { userId: 123 },    // Data to pass to dialog
  panelClass: ['custom-dialog'] // Additional CSS classes
});

// For fullscreen dialogs, use openFullscreen() method
this.ixDialog.openFullscreen(MyDialogComponent, {
  data: { userId: 123 }
});
\`\`\`

## Quick Confirmation Dialogs

For simple yes/no confirmations, use the built-in helper:

\`\`\`typescript
this.ixDialog.confirm({
  title: 'Delete User?',
  message: 'This will permanently delete the user account. This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Keep',
  destructive: true // Adds red styling for dangerous actions
}).then(observable => {
  observable.subscribe(confirmed => {
    if (confirmed) {
      // User clicked Delete
      this.deleteUser();
    }
    // User clicked Keep or pressed ESC - do nothing
  });
});
\`\`\`

## Features

- **Proper Scrolling**: Only the content area scrolls, header and actions stay fixed
- **Accessibility**: Full keyboard navigation and screen reader support via CDK Dialog
- **Theme Support**: Uses CSS custom properties for complete theming
- **Responsive**: Adapts to different screen sizes with configurable constraints
- **Type Safety**: Full TypeScript support with generic types for data and results
- **Focus Management**: Automatically focuses first input, manages tab order
        `
      }
    }
  }
};

export default meta;
type Story = StoryObj<DialogDemoComponent>;

export const Default: Story = {
  render: (args) => ({
    template: `<dialog-demo></dialog-demo>`,
    props: args,
    moduleMetadata: {
      imports: [
        DialogDemoComponent,
        UserEditDialogComponent,
        SystemSettingsDialogComponent,
        FullscreenSettingsDialogComponent,
        IxDialogShellComponent,
        IxButtonComponent,
        IxFormFieldComponent,
        IxInputComponent,
        JsonPipe
      ],
      providers: [
        IxDialog
      ]
    },
  }),
  args: {}
};