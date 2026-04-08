import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { TnButtonComponent } from '../lib/button/button.component';
import { TnToastService } from '../lib/toast/toast.service';
import { TnToastPosition, TnToastType } from '../lib/toast/toast.types';

@Component({
  selector: 'tn-toast-demo',
  standalone: true,
  imports: [TnButtonComponent],
  templateUrl: './toast-demo.component.html',
})
class ToastDemoComponent {
  toast = inject(TnToastService);

  showInfo() { this.toast.open('This is an info notification'); }
  showSuccess() { this.toast.open('Changes saved successfully', { type: TnToastType.Success }); }
  showWarning() { this.toast.open('Disk usage is above 90%', { type: TnToastType.Warning }); }
  showError() { this.toast.open('Failed to connect to server', { type: TnToastType.Error, duration: 6000 }); }
  showWithAction() {
    const ref = this.toast.open('Item deleted', 'Undo', { duration: 8000 });
    ref.onAction().subscribe(() => this.toast.open('Deletion undone', { type: TnToastType.Success }));
  }
}

@Component({
  selector: 'tn-toast-position-demo',
  standalone: true,
  imports: [TnButtonComponent],
  templateUrl: './toast-position-demo.component.html',
})
class ToastPositionDemoComponent {
  toast = inject(TnToastService);

  showTop() { this.toast.open('This appears at the top'); }
  showBottom() { this.toast.open('This appears at the bottom', { position: TnToastPosition.Bottom }); }
  showTopAction() {
    this.toast.open('Connection lost', 'Reconnect', {
      type: TnToastType.Error,
      duration: 0,
    });
  }
}

const meta: Meta<ToastDemoComponent> = {
  title: 'Components/Toast',
  component: ToastDemoComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The Toast service provides lightweight, non-intrusive notifications that appear at the top of the viewport.

## Features

- **Auto-dismiss**: Toasts automatically dismiss after a configurable duration (default: 4s)
- **Action button**: Optional action button with \`onAction()\` observable
- **Types**: \`info\`, \`success\`, \`warning\`, \`error\` — each with distinct styling
- **Programmatic control**: Dismiss via \`TnToastRef.dismiss()\`
- **Single toast**: Opening a new toast automatically dismisses the previous one

## Usage

\`\`\`typescript
toast = inject(TnToastService);

// Simple
this.toast.open('Changes saved');

// With action
const ref = this.toast.open('Item deleted', 'Undo');
ref.onAction().subscribe(() => this.undoDelete());

// With type
this.toast.open('Error occurred', { type: 'error', duration: 6000 });

// Action + config
this.toast.open('Failed', 'Retry', { type: 'error' });
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ToastDemoComponent>;

export const Default: Story = {};

export const Position: Story = {
  render: () => ({
    props: {},
    moduleMetadata: { imports: [ToastPositionDemoComponent] },
    template: '<tn-toast-position-demo />',
  }),
};
