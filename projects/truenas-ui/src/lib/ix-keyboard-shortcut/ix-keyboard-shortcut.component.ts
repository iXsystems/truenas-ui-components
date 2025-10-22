import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { PlatformType } from '../enums/modifier-keys.enum';

@Component({
  selector: 'ix-keyboard-shortcut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-keyboard-shortcut.component.html',
  styleUrls: ['./ix-keyboard-shortcut.component.scss'],
})
export class IxKeyboardShortcutComponent implements OnInit, OnChanges {
  @Input() shortcut: string = '';
  @Input() platform: PlatformType = 'auto';
  @Input() separator: string = '';

  displayShortcut: string = '';

  ngOnInit(): void {
    this.displayShortcut = this.formatShortcut(this.shortcut);
  }

  ngOnChanges(): void {
    this.displayShortcut = this.formatShortcut(this.shortcut);
  }

  private formatShortcut(shortcut: string): string {
    if (!shortcut) return '';

    const detectedPlatform = this.platform === 'auto' ? this.detectPlatform() : this.platform;
    
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


  get shortcutKeys(): string[] {
    if (!this.displayShortcut) return [];

    // Split by common separators
    const separators = ['+', ' ', ''];
    let keys: string[] = [];

    // For Mac-style shortcuts without separators
    if (this.displayShortcut.includes('⌘') || this.displayShortcut.includes('⌥') || this.displayShortcut.includes('⇧')) {
      const macSymbols = ['⌘', '⌥', '⇧', '⌃'];
      let currentKey = '';

      // Iterate through each character to preserve order
      for (const char of this.displayShortcut) {
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
      keys = this.displayShortcut.split('+');
    }

    return keys.filter(key => key.trim() !== '');
  }
}