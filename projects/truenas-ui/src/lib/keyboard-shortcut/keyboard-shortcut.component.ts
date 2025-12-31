import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import type { PlatformType } from '../enums/modifier-keys.enum';

@Component({
  selector: 'tn-keyboard-shortcut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyboard-shortcut.component.html',
  styleUrls: ['./keyboard-shortcut.component.scss'],
})
export class TnKeyboardShortcutComponent {
  shortcut = input<string>('');
  platform = input<PlatformType>('auto');
  separator = input<string>('');

  displayShortcut = computed(() => {
    return this.formatShortcut(this.shortcut());
  });

  private formatShortcut(shortcut: string): string {
    if (!shortcut) {return '';}

    const detectedPlatform = this.platform() === 'auto' ? this.detectPlatform() : this.platform();
    
    // Convert Mac-style shortcuts to platform-appropriate format
    if (detectedPlatform === 'windows' || detectedPlatform === 'linux') {
      return this.convertToWindows(shortcut);
    }
    
    // Return Mac format by default
    return shortcut;
  }

  private detectPlatform(): 'mac' | 'windows' | 'linux' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mac')) {
      return 'mac';
    } else if (userAgent.includes('win')) {
      return 'windows';
    } else if (userAgent.includes('linux')) {
      return 'linux';
    }
    
    return 'mac'; // Default to Mac
  }

  private convertToWindows(macShortcut: string): string {
    return macShortcut
      .replace(/⌘/g, 'Ctrl')
      .replace(/⌥/g, 'Alt')
      .replace(/⇧/g, 'Shift')
      .replace(/⌃/g, 'Ctrl');
  }


  shortcutKeys = computed(() => {
    const displayShortcut = this.displayShortcut();
    if (!displayShortcut) {return [];}

    let keys: string[] = [];

    // For Mac-style shortcuts without separators
    if (displayShortcut.includes('⌘') || displayShortcut.includes('⌥') || displayShortcut.includes('⇧')) {
      const macSymbols = ['⌘', '⌥', '⇧', '⌃'];
      let currentKey = '';

      // Iterate through each character to preserve order
      for (const char of displayShortcut) {
        if (macSymbols.includes(char)) {
          // If we have accumulated characters, add them first
          if (currentKey) {
            keys.push(currentKey);
            currentKey = '';
          }
          // Add the Mac symbol
          keys.push(char);
        } else {
          // Accumulate non-symbol characters
          currentKey += char;
        }
      }

      // Add any remaining characters
      if (currentKey) {
        keys.push(currentKey);
      }
    } else {
      // For Windows/Linux style shortcuts with + separators
      keys = displayShortcut.split('+');
    }

    return keys.filter(key => key.trim() !== '');
  });
}