import type { PlatformType } from '../enums/modifier-keys.enum';
import { ModifierKeys, WindowsModifierKeys, LinuxModifierKeys } from '../enums/modifier-keys.enum';

export class ShortcutBuilder {
  private keysList: string[] = [];
  private targetPlatform: PlatformType = 'mac';

  constructor(platform: PlatformType = 'mac') {
    this.targetPlatform = platform;
  }

  /**
   * Add Command key (⌘ on Mac, Ctrl on Windows/Linux)
   */
  command(): ShortcutBuilder {
    switch (this.targetPlatform) {
      case 'mac':
        this.keysList.push(ModifierKeys.COMMAND);
        break;
      case 'windows':
        this.keysList.push(WindowsModifierKeys.CTRL);
        break;
      case 'linux':
        this.keysList.push(LinuxModifierKeys.CTRL);
        break;
      default:
        this.keysList.push(ModifierKeys.COMMAND);
    }
    return this;
  }

  /**
   * Add Ctrl key
   */
  ctrl(): ShortcutBuilder {
    switch (this.targetPlatform) {
      case 'mac':
        this.keysList.push('⌃');
        break;
      case 'windows':
        this.keysList.push(WindowsModifierKeys.CTRL);
        break;
      case 'linux':
        this.keysList.push(LinuxModifierKeys.CTRL);
        break;
      default:
        this.keysList.push('⌃');
    }
    return this;
  }

  /**
   * Add Shift key (⇧ on Mac, Shift on Windows/Linux)
   */
  shift(): ShortcutBuilder {
    switch (this.targetPlatform) {
      case 'mac':
        this.keysList.push(ModifierKeys.SHIFT);
        break;
      case 'windows':
        this.keysList.push(WindowsModifierKeys.SHIFT);
        break;
      case 'linux':
        this.keysList.push(LinuxModifierKeys.SHIFT);
        break;
      default:
        this.keysList.push(ModifierKeys.SHIFT);
    }
    return this;
  }

  /**
   * Add Alt/Option key (⌥ on Mac, Alt on Windows/Linux)
   */
  alt(): ShortcutBuilder {
    switch (this.targetPlatform) {
      case 'mac':
        this.keysList.push(ModifierKeys.ALT);
        break;
      case 'windows':
        this.keysList.push(WindowsModifierKeys.ALT);
        break;
      case 'linux':
        this.keysList.push(LinuxModifierKeys.ALT);
        break;
      default:
        this.keysList.push(ModifierKeys.ALT);
    }
    return this;
  }

  /**
   * Add Option key (alias for alt on Mac)
   */
  option(): ShortcutBuilder {
    return this.alt();
  }

  /**
   * Add Windows/Super key
   */
  windows(): ShortcutBuilder {
    switch (this.targetPlatform) {
      case 'mac':
        this.keysList.push(ModifierKeys.COMMAND);
        break;
      case 'windows':
        this.keysList.push(WindowsModifierKeys.WINDOWS);
        break;
      case 'linux':
        this.keysList.push(LinuxModifierKeys.SUPER);
        break;
      default:
        this.keysList.push(ModifierKeys.COMMAND);
    }
    return this;
  }

  /**
   * Add a regular key (letter, number, or special key)
   */
  key(key: string): ShortcutBuilder {
    this.keysList.push(key);
    return this;
  }

  /**
   * Add multiple keys at once
   */
  keys(...keys: string[]): ShortcutBuilder {
    this.keysList.push(...keys);
    return this;
  }

  /**
   * Reset the builder to start over
   */
  reset(): ShortcutBuilder {
    this.keysList = [];
    return this;
  }

  /**
   * Build the final shortcut string
   */
  build(): string {
    if (this.keysList.length === 0) {
      return '';
    }

    if (this.targetPlatform === 'mac') {
      // Mac style: no separators between keys
      return this.keysList.join('');
    } else {
      // Windows/Linux style: + separators between keys
      return this.keysList.join('+');
    }
  }

  /**
   * Get the current keys array (for debugging)
   */
  getKeys(): string[] {
    return [...this.keysList];
  }

  /**
   * Get the current platform
   */
  getPlatform(): PlatformType {
    return this.targetPlatform;
  }

  /**
   * Change the target platform
   */
  setPlatform(platform: PlatformType): ShortcutBuilder {
    this.targetPlatform = platform;
    return this;
  }
}

/**
 * Create a new ShortcutBuilder instance
 */
export function createShortcut(platform: PlatformType = 'mac'): ShortcutBuilder {
  return new ShortcutBuilder(platform);
}

/**
 * Quick builder functions for common patterns
 */
export const QuickShortcuts = {
  /**
   * Create a simple Command+Key shortcut
   */
  cmd(key: string, platform: PlatformType = 'mac'): string {
    return createShortcut(platform).command().key(key).build();
  },

  /**
   * Create a Shift+Command+Key shortcut
   */
  shiftCmd(key: string, platform: PlatformType = 'mac'): string {
    return createShortcut(platform).shift().command().key(key).build();
  },

  /**
   * Create an Alt+Command+Key shortcut
   */
  altCmd(key: string, platform: PlatformType = 'mac'): string {
    return createShortcut(platform).alt().command().key(key).build();
  },

  /**
   * Create a Ctrl+Key shortcut
   */
  ctrl(key: string, platform: PlatformType = 'mac'): string {
    return createShortcut(platform).ctrl().key(key).build();
  },

  /**
   * Create an Alt+Key shortcut
   */
  alt(key: string, platform: PlatformType = 'mac'): string {
    return createShortcut(platform).alt().key(key).build();
  },
};