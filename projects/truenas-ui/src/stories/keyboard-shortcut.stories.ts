import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxKeyboardShortcutComponent } from '../lib/keyboard-shortcut/keyboard-shortcut.component';

@Component({
  selector: 'shortcut-test',
  standalone: true,
  imports: [IxKeyboardShortcutComponent],
  templateUrl: './keyboard-shortcut.stories.html'
})
class ShortcutTestComponent implements OnDestroy {
  private keydownListener: (event: KeyboardEvent) => void;
  private shortcutAction = action('keyboard-shortcut-triggered');

  basicUsageExample = `<!-- Basic usage -->
<ix-keyboard-shortcut shortcut="⌘S" platform="auto"></ix-keyboard-shortcut>

<!-- Using enum values -->
<ix-keyboard-shortcut [shortcut]="CommonShortcuts.SAVE" platform="auto"></ix-keyboard-shortcut>

<!-- Platform-specific -->
<ix-keyboard-shortcut shortcut="Ctrl+S" platform="windows"></ix-keyboard-shortcut>

<!-- Custom separator -->
<ix-keyboard-shortcut shortcut="Ctrl+Alt+Delete" separator=" + "></ix-keyboard-shortcut>`;

  importExample = `import { IxKeyboardShortcutComponent } from 'truenas-ui';
import { CommonShortcuts } from 'truenas-ui';`;

  constructor() {
    // Add keyboard event listener
    this.keydownListener = (event: KeyboardEvent) => {
      // Check for Cmd/Ctrl + S
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        this.handleShortcut();
      }
    };

    document.addEventListener('keydown', this.keydownListener);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keydownListener);
  }

  handleShortcut() {
    alert('Keyboard shortcut triggered: Save');
    // This will show in Storybook actions tab
    this.shortcutAction({ shortcut: 'Cmd+S / Ctrl+S', action: 'Save', timestamp: new Date().toISOString() });
  }
}

const meta: Meta<ShortcutTestComponent> = {
  title: 'Components/Keyboard Shortcut',
  component: ShortcutTestComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A component for displaying keyboard shortcuts with platform-aware formatting and visual styling. This story includes interactive testing and comprehensive implementation examples.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ShortcutTestComponent>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive keyboard shortcut test with comprehensive implementation guide. Press Cmd+S (Mac) or Ctrl+S (Windows/Linux) to trigger the shortcut and see actions in the Actions tab.',
      },
    },
  },
};
