import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { IxKeyboardShortcutComponent } from '../lib/ix-keyboard-shortcut/ix-keyboard-shortcut.component';

@Component({
  selector: 'shortcut-test',
  standalone: true,
  imports: [IxKeyboardShortcutComponent],
  template: `
    <div style="padding: 20px; display: flex; flex-direction: column; gap: 20px;">
      <h3>Keyboard Shortcut Test</h3>
      <p>Try pressing <ix-keyboard-shortcut shortcut="⌘S" platform="auto" /> to test the shortcut functionality.</p>
      <p>The shortcut should trigger both a Storybook action and a browser alert.</p>

      <div style="margin-top: 20px; padding: 16px; border: 1px solid var(--lines); border-radius: 4px;">
        <strong>Test the Shortcut:</strong>
        <ul>
          <li>Make sure the window is in focus (click somewhere on the page)</li>
          <li>Press <strong>Cmd+S</strong> on Mac or <strong>Ctrl+S</strong> on Windows/Linux</li>
          <li>Check the Actions tab in Storybook to see the logged action</li>
          <li>A browser alert will also appear</li>
        </ul>
      </div>

      <div style="margin-top: 30px;">
        <h3>How to Implement</h3>

        <h4>Basic Usage</h4>
        <pre style="background: var(--alt-bg1); padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; overflow-x: auto;">{{ basicUsageExample }}</pre>

        <h4>Platform Comparison</h4>
        <div style="display: flex; gap: 24px; align-items: center; margin: 16px 0;">
          <div>
            <strong>Mac Style:</strong>
            <ix-keyboard-shortcut shortcut="⌘S" platform="mac" />
          </div>
          <div>
            <strong>Windows/Linux Style:</strong>
            <ix-keyboard-shortcut shortcut="Ctrl+S" platform="windows" />
          </div>
          <div>
            <strong>Auto-detect:</strong>
            <ix-keyboard-shortcut shortcut="⌘S" platform="auto" />
          </div>
        </div>

        <h4>Common Shortcuts</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Save:</span>
            <ix-keyboard-shortcut shortcut="⌘S" platform="auto" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Save As:</span>
            <ix-keyboard-shortcut shortcut="⇧⌘S" platform="auto" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Copy:</span>
            <ix-keyboard-shortcut shortcut="⌘C" platform="auto" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Paste:</span>
            <ix-keyboard-shortcut shortcut="⌘V" platform="auto" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Find:</span>
            <ix-keyboard-shortcut shortcut="⌘F" platform="auto" />
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Undo:</span>
            <ix-keyboard-shortcut shortcut="⌘Z" platform="auto" />
          </div>
        </div>

        <h4>TypeScript Import</h4>
        <pre style="background: var(--alt-bg1); padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px; overflow-x: auto;">{{ importExample }}</pre>

        <h4>Features</h4>
        <ul>
          <li><strong>Platform-aware formatting:</strong> Automatically converts between Mac symbols (⌘, ⌥, ⇧) and Windows/Linux text (Ctrl, Alt, Shift)</li>
          <li><strong>Auto-detection:</strong> Uses browser user agent to determine platform when platform="auto"</li>
          <li><strong>Accessibility:</strong> Includes proper ARIA labels for screen readers</li>
          <li><strong>Helper enums:</strong> Use CommonShortcuts enum for standard shortcuts</li>
          <li><strong>Visual styling:</strong> Styled as keyboard keys with proper spacing</li>
        </ul>
      </div>
    </div>
  `
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
    // Also log to console
    console.log('Keyboard shortcut triggered: Save');
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
