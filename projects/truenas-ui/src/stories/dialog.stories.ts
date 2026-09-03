import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnDialogShellComponent } from '../lib/dialog/dialog-shell.component';
import { TnDialog } from '../lib/dialog/dialog.service';
import { TnFormFieldComponent } from '../lib/form-field/form-field.component';
import { TnInputComponent } from '../lib/input/input.component';

const harnessDoc = loadHarnessDoc('dialog');

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

// Minimize-only job dialog demonstrating the chrome inputs: showCloseButton,
// hideContent, hideActions. The content/actions toggles are cross-placed in the
// template (content toggles in the footer, footer toggle in content) so the
// dialog can never collapse both regions at once and strand the user.
@Component({
  selector: 'job-progress-dialog',
  templateUrl: './dialog-5.stories.html',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent]
})
class JobProgressDialogComponent {
  ref = inject(DialogRef<string>);
  canClose = signal(false);
  contentHidden = signal(false);
  actionsHidden = signal(false);
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
      width: '700px'
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Dialog was cancelled';
    });
  }

  async openConfirmDialog() {
    const confirmed = await this.ixDialog.confirm({
      title: 'Delete Dataset?',
      message: 'This will permanently delete the dataset "important-data" and all of its contents. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      destructive: true
    });
    this.lastResult = confirmed ? 'User confirmed deletion' : 'User cancelled deletion';
  }

  openFullscreenDialog() {
    const dialogRef = this.ixDialog.openFullscreen(FullscreenSettingsDialogComponent);

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Fullscreen dialog was cancelled';
    });
  }

  openJobDialog() {
    const dialogRef = this.ixDialog.open(JobProgressDialogComponent, {
      width: '520px'
    });

    dialogRef.closed.subscribe((result) => {
      this.lastResult = result || 'Job dialog was cancelled';
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
import { TnDialog } from '@truenas/ui-components';
import { TnDialogShellComponent } from '@truenas/ui-components';
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
  maxWidth: '90vw',         // Maximum width (default: 90vw)
  maxHeight: '90vh',        // Maximum height (default: 90vh)
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
const confirmed = await this.ixDialog.confirm({
  title: 'Delete User?',
  message: 'This will permanently delete the user account. This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Keep',
  destructive: true // Adds red styling for dangerous actions
});
if (confirmed) {
  // User clicked Delete
  this.deleteUser();
}
// User clicked Keep or pressed ESC - do nothing
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
        JobProgressDialogComponent,
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

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};

@Component({
  selector: 'tn-dialog-testid-demo',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button label="Open confirm dialog" (onClick)="open()" />`,
})
class DialogTestIdDemoComponent {
  private dialog = inject(TnDialog);
  open(): void {
    void this.dialog.confirm({
      title: 'Delete user?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      confirmTestId: 'delete-user',
      cancelTestId: 'keep-user',
    });
  }
}

/**
 * **Test IDs.** Dialogs are service-driven and render in a portaled overlay, so
 * their button ids aren't capturable inline — the library owns them:
 *
 * | Element | Emitted id |
 * |---|---|
 * | shell close (✕) | `button-close` (or `button-<shell testId>-close`) |
 * | shell fullscreen | `button-fullscreen` |
 * | confirm-dialog confirm | `button-<confirmTestId>` (default `button-confirm`) |
 * | confirm-dialog cancel | `button-<cancelTestId>` (default `button-cancel`) |
 *
 * Under `data-testid` (default) / `data-test`. The demo runs
 * `dialog.confirm({ confirmTestId: 'delete-user', cancelTestId: 'keep-user' })`
 * → `button-delete-user` / `button-keep-user`. Click, then inspect the dialog.
 */
export const TestIds: Story = {
  render: () => ({
    moduleMetadata: { imports: [DialogTestIdDemoComponent] },
    template: '<tn-dialog-testid-demo />',
  }),
};

@Component({
  selector: 'tn-dialog-job-demo',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button type="button" label="Open job dialog" (click)="open()" />`,
})
class DialogJobDemoComponent {
  private dialog = inject(TnDialog);
  open(): void {
    this.dialog.open(JobProgressDialogComponent, { width: '520px' });
  }
}

/**
 * **Chrome inputs.** `tn-dialog-shell` exposes three inputs for trimming its
 * chrome, demonstrated here with a minimize-only export job:
 *
 * | Input | Effect | Use when |
 * |---|---|---|
 * | `showCloseButton` (default `true`) | Shows/hides the header close (✕) | The dialog must not be dismissed from the chrome — e.g. a running job that can only be minimized. |
 * | `hideContent` (default `false`) | Collapses the content section | The body is projected through an always-present wrapper, so the section is never truly `:empty` and won't auto-hide. |
 * | `hideActions` (default `false`) | Collapses the actions footer | Same always-present-wrapper rationale as `hideContent`. |
 *
 * An empty content/actions slot with no wrapper hides itself via the `:empty`
 * rule in the theme — these inputs are only needed for the wrapper case. Open
 * the dialog and toggle the buttons to preview each state.
 */
export const ChromeInputs: Story = {
  render: () => ({
    moduleMetadata: { imports: [DialogJobDemoComponent] },
    template: '<tn-dialog-job-demo />',
  }),
};
/**
 * The dataset path from NAS-142530, and the one measurement that matters about
 * it: unbroken it is 613px wide, against the 320px a 400px-wide dialog's header
 * can give its heading.
 */
const LONG_ZVOL_PATH = 'dozer/TEST_ANOTHER_ZVOL_WITH_A_LONG_NAME';

/**
 * webui's delete-zvol dialog, reduced to the parts NAS-142530 turned on: a
 * heading the width of a ZFS path, the same path again in the body copy, and a
 * text field after the header's close button in tab order.
 */
@Component({
  selector: 'tn-dialog-long-title',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent, TnFormFieldComponent, TnInputComponent, FormsModule],
  // 400px is webui's delete-dataset dialog — the width the report was filed against.
  styles: [':host { display: block; width: 400px; }'],
  templateUrl: './dialog-6.stories.html',
})
class DialogLongTitleComponent {
  readonly ref = inject(DialogRef<string>);
  readonly path = LONG_ZVOL_PATH;
  confirmName = '';
}

@Component({
  selector: 'tn-dialog-long-title-demo',
  standalone: true,
  imports: [TnButtonComponent],
  template: `<tn-button type="button" label="Delete zvol" (click)="open()" />`,
})
class DialogLongTitleDemoComponent {
  private dialog = inject(TnDialog);
  open(): void {
    this.dialog.open(DialogLongTitleComponent);
  }
}

/**
 * **A title too long for the dialog.** Dialogs are named after the thing they
 * act on, and in TrueNAS that is routinely a full ZFS path. The heading wraps
 * onto as many lines as it needs and the dialog keeps its width; nothing about
 * it moves when focus does.
 *
 * It did not always: see the `.tn-dialog__title` block in `themes.css` for what
 * `min-width: auto` on a flex item cost here (NAS-142530), and why the fix is
 * two declarations rather than either one.
 */
export const LongTitle: Story = {
  render: () => ({
    moduleMetadata: { imports: [DialogLongTitleDemoComponent] },
    template: '<tn-dialog-long-title-demo />',
  }),
  // Wrapping is layout, which jsdom cannot do — the unit specs next door can say
  // nothing about it, so the guard has to live in a browser.
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete zvol' }));

    // The dialog is portaled to <body>, so it is out of `canvasElement`.
    const panel = await waitFor(() => {
      const found = document.querySelector('.tn-dialog-panel') as HTMLElement | null;
      if (!found) {
        throw new Error('dialog did not open');
      }
      return found;
    });
    const close = panel.querySelector('.tn-dialog__close') as HTMLElement;

    try {
      // Precondition, not the guard: the dialog is at the width the bug was
      // filed against. It held on the broken CSS too — the heading overflowed
      // the panel rather than widening it.
      await expect(Math.round(panel.getBoundingClientRect().width)).toBe(400);

      // The guard. The heading wrapped instead of pushing the header wider, so
      // the panel has no horizontal overflow to scroll: 400, against 677 before.
      await expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);

      // A re-enactment of the reported symptom rather than a second guard: with
      // no overflow left to scroll, the maximum `scrollLeft` is already 0 and
      // the line above has thrown on any CSS where it is not. Kept for what it
      // documents — the step that used to open the dialog at `scrollLeft: 277`
      // was CDK's `autoFocus` landing on the close button. Hence the `blur()`:
      // focusing an already-focused element scrolls nothing, so without it this
      // would not re-enact anything.
      close.blur();
      panel.scrollLeft = 0;
      close.focus();
      await expect(panel.scrollLeft).toBe(0);

      // The body copy carries the same path, and is clipped by `overflow-x:
      // hidden` rather than scrollable — so it has to wrap on its own.
      const content = panel.querySelector('.tn-dialog__content') as HTMLElement;
      await expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);
    } finally {
      close.click();
    }
  },
};
