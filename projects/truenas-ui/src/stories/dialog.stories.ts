import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnDialogShellComponent } from '../lib/dialog/dialog-shell.component';
import { TnDialog } from '../lib/dialog/dialog.service';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';

// Example user edit dialog component
@Component({
  selector: 'user-edit-dialog',
  templateUrl: './dialog.stories.html',
  standalone: true,
  imports: [
    TnDialogShellComponent,
    TnButtonComponent,
    TnFormFieldComponent,
    TnInputComponent,
    FormsModule
  ]
})
class UserEditDialogComponent {
  ref = inject(DialogRef<{ name: string; email: string; role: string } | undefined>);
  data = inject<{ userId: number; name?: string; email?: string; role?: string }>(DIALOG_DATA);

  // Pre-fill form with existing data if available
  name = this.data?.name || '';
  email = this.data?.email || '';
  role = this.data?.role || '';

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
  templateUrl: './dialog-2.stories.html',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent]
})
class SystemSettingsDialogComponent {
  ref = inject(DialogRef<string>);
}

// Fullscreen-only dialog component (no toggle button needed)
@Component({
  selector: 'fullscreen-settings-dialog',
  templateUrl: './dialog-3.stories.html',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent]
})
class FullscreenSettingsDialogComponent {
  ref = inject(DialogRef<string>);
}

// Story component that demonstrates opening dialogs
@Component({
  selector: 'dialog-demo',
  templateUrl: './dialog-4.stories.html',
  standalone: true,
  imports: [TnButtonComponent, JsonPipe]
})
class DialogDemoComponent {
  lastResult: unknown = null;

  constructor(private ixDialog: TnDialog) {}

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

1. **Import the dialog service**: Import \`TnDialog\` from the library
2. **Create dialog components**: Build standalone components that use \`tn-dialog-shell\`
3. **Open dialogs**: Use the service to open your dialog components

## Step-by-Step Implementation

### 1. Import Required Dependencies

First, import what you need in your component:

\`\`\`typescript
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TnDialog } from '@truenas/ui';
import { TnDialogShellComponent } from '@truenas/ui';
\`\`\`

### 2. Create Your Dialog Component

Every dialog component must be a standalone component that uses \`tn-dialog-shell\` as its root element:

\`\`\`typescript
@Component({
  selector: 'my-custom-dialog',
  template: \`
    <tn-dialog-shell title="My Custom Dialog">
      <!-- Your content goes here -->
      <p>This is the dialog content area.</p>
      <form>
        <input [(ngModel)]="myValue" name="myValue">
      </form>
      
      <!-- Action buttons go in a div with tnDialogAction -->
      <div tnDialogAction>
        <tn-button variant="outline" label="Cancel" (click)="cancel()"></tn-button>
        <tn-button label="Save" color="primary" (click)="save()"></tn-button>
      </div>
    </tn-dialog-shell>
  \`,
  standalone: true,
  imports: [
    TnDialogShellComponent,
    TnButtonComponent,
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
  constructor(private ixDialog: TnDialog) {}

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

## Understanding tn-dialog-shell

The \`tn-dialog-shell\` component provides the dialog layout structure:

### Required Structure
- **Root**: \`<tn-dialog-shell title="Your Title">\`
- **Content**: Everything between the tags becomes scrollable content
- **Actions**: Elements with \`tnDialogAction\` attribute become footer buttons

### Key Features
- **Automatic Layout**: Header with title and close button, scrollable content, footer actions
- **Proper Scrolling**: Only the content area scrolls, header and footer stay fixed
- **Close Button**: Automatically includes a close × button in the header
- **Action Projection**: Use \`tnDialogAction\` to place buttons in the footer

### Customization Options

\`\`\`html
<tn-dialog-shell title="Custom Dialog">
  <!-- Main content area - this will scroll if it overflows -->
  <div>
    <h3>Section 1</h3>
    <p>Your content here...</p>
    
    <h3>Section 2</h3>
    <form>
      <tn-form-field label="Name">
        <tn-input [(ngModel)]="name" name="name"></tn-input>
      </tn-form-field>
    </form>
  </div>
  
  <!-- Footer actions - these stay fixed at the bottom -->
  <div tnDialogAction>
    <tn-button variant="outline" label="Cancel" (click)="dialogRef.close()"></tn-button>
    <tn-button label="Save" color="primary" (click)="save()"></tn-button>
  </div>
</tn-dialog-shell>
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
        TnDialogShellComponent,
        TnButtonComponent,
        TnFormFieldComponent,
        TnInputComponent,
        JsonPipe
      ],
      providers: [
        TnDialog
      ]
    },
  }),
  args: {}
};