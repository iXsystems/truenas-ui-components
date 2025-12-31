import { Injectable } from '@angular/core';
import { CommonShortcuts, WindowsShortcuts, LinuxShortcuts } from '../enums/common-shortcuts.enum';
import type { PlatformType } from '../enums/modifier-keys.enum';

export interface KeyCombination {
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  key: string;
}

export interface ShortcutHandler {
  id: string;
  combination: KeyCombination;
  callback: () => void;
  context?: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IxKeyboardShortcutService {
  private shortcuts = new Map<string, ShortcutHandler>();
  private globalEnabled = true;

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(
    id: string,
    shortcut: string,
    callback: () => void,
    context?: string
  ): void {
    const combination = this.parseShortcut(shortcut);
    
    this.shortcuts.set(id, {
      id,
      combination,
      callback,
      context,
      enabled: true
    });
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(id: string): void {
    this.shortcuts.delete(id);
  }

  /**
   * Unregister all shortcuts for a given context
   */
  unregisterContext(context: string): void {
    for (const [id, handler] of this.shortcuts) {
      if (handler.context === context) {
        this.shortcuts.delete(id);
      }
    }
  }

  /**
   * Enable/disable a specific shortcut
   */
  setShortcutEnabled(id: string, enabled: boolean): void {
    const handler = this.shortcuts.get(id);
    if (handler) {
      handler.enabled = enabled;
    }
  }

  /**
   * Enable/disable all shortcuts globally
   */
  setGlobalEnabled(enabled: boolean): void {
    this.globalEnabled = enabled;
  }

  /**
   * Check if shortcuts are globally enabled
   */
  isGlobalEnabled(): boolean {
    return this.globalEnabled;
  }

  /**
   * Handle keyboard events
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    if (!this.globalEnabled) {
      return false;
    }

    const combination: KeyCombination = {
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      key: event.key
    };

    for (const handler of this.shortcuts.values()) {
      if (handler.enabled && this.matchesCombination(combination, handler.combination)) {
        event.preventDefault();
        event.stopPropagation();
        handler.callback();
        return true;
      }
    }

    return false;
  }

  /**
   * Parse a shortcut string into a KeyCombination
   */
  parseShortcut(shortcut: string): KeyCombination {
    const combination: KeyCombination = {
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      key: ''
    };

    // Handle Mac-style shortcuts
    if (shortcut.includes('⌘')) {
      combination.metaKey = true;
      shortcut = shortcut.replace(/⌘/g, '');
    }
    
    if (shortcut.includes('⌃')) {
      combination.ctrlKey = true;
      shortcut = shortcut.replace(/⌃/g, '');
    }
    
    if (shortcut.includes('⌥')) {
      combination.altKey = true;
      shortcut = shortcut.replace(/⌥/g, '');
    }
    
    if (shortcut.includes('⇧')) {
      combination.shiftKey = true;
      shortcut = shortcut.replace(/⇧/g, '');
    }

    // Handle Windows/Linux-style shortcuts
    const parts = shortcut.split('+').map(part => part.trim());
    
    for (const part of parts) {
      const lowerPart = part.toLowerCase();
      
      if (lowerPart === 'ctrl' || lowerPart === 'control') {
        combination.ctrlKey = true;
      } else if (lowerPart === 'alt') {
        combination.altKey = true;
      } else if (lowerPart === 'shift') {
        combination.shiftKey = true;
      } else if (lowerPart === 'meta' || lowerPart === 'cmd' || lowerPart === 'win') {
        combination.metaKey = true;
      } else if (part.length > 0) {
        combination.key = part;
      }
    }

    return combination;
  }

  /**
   * Check if two key combinations match
   */
  private matchesCombination(actual: KeyCombination, expected: KeyCombination): boolean {
    return actual.ctrlKey === expected.ctrlKey &&
           actual.altKey === expected.altKey &&
           actual.shiftKey === expected.shiftKey &&
           actual.metaKey === expected.metaKey &&
           actual.key.toLowerCase() === expected.key.toLowerCase();
  }

  /**
   * Get the current platform
   */
  getCurrentPlatform(): PlatformType {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mac')) {
      return 'mac';
    } else if (userAgent.includes('win')) {
      return 'windows';
    } else if (userAgent.includes('linux')) {
      return 'linux';
    }
    
    return 'mac';
  }

  /**
   * Format a shortcut for display on the current platform
   */
  formatShortcutForPlatform(shortcut: string, platform?: PlatformType): string {
    const targetPlatform = platform || this.getCurrentPlatform();
    
    if (targetPlatform === 'windows') {
      return this.convertToWindowsDisplay(shortcut);
    } else if (targetPlatform === 'linux') {
      return this.convertToLinuxDisplay(shortcut);
    }
    
    return shortcut; // Return Mac format by default
  }

  /**
   * Convert Mac-style shortcut to Windows display format
   */
  private convertToWindowsDisplay(macShortcut: string): string {
    return macShortcut
      .replace(/⌘/g, 'Ctrl')
      .replace(/⌥/g, 'Alt')
      .replace(/⇧/g, 'Shift')
      .replace(/⌃/g, 'Ctrl')
      .replace(/([a-zA-Z])([A-Z])/g, '$1+$2')
      .replace(/([a-zA-Z])([a-z])/g, '$1+$2');
  }

  /**
   * Convert Mac-style shortcut to Linux display format
   */
  private convertToLinuxDisplay(macShortcut: string): string {
    return macShortcut
      .replace(/⌘/g, 'Ctrl')
      .replace(/⌥/g, 'Alt')
      .replace(/⇧/g, 'Shift')
      .replace(/⌃/g, 'Ctrl')
      .replace(/([a-zA-Z])([A-Z])/g, '$1+$2')
      .replace(/([a-zA-Z])([a-z])/g, '$1+$2');
  }

  /**
   * Get platform-specific shortcut enum
   */
  getPlatformShortcuts(platform?: PlatformType): typeof CommonShortcuts | typeof WindowsShortcuts | typeof LinuxShortcuts {
    const targetPlatform = platform || this.getCurrentPlatform();
    
    switch (targetPlatform) {
      case 'windows':
        return WindowsShortcuts;
      case 'linux':
        return LinuxShortcuts;
      default:
        return CommonShortcuts;
    }
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): ShortcutHandler[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts for a specific context
   */
  getShortcutsForContext(context: string): ShortcutHandler[] {
    return Array.from(this.shortcuts.values()).filter(handler => handler.context === context);
  }

  /**
   * Clear all shortcuts
   */
  clearAllShortcuts(): void {
    this.shortcuts.clear();
  }
}