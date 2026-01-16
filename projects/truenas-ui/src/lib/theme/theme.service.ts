import { isPlatformBrowser } from '@angular/common';
import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import {
  TN_THEME_DEFINITIONS,
  THEME_MAP,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from './theme.constants';
import type { TnThemeDefinition } from './theme.interface';
import { TnTheme } from './theme.interface';

/**
 * Service for managing themes in the TrueNAS UI Components library.
 *
 * Features:
 * - Signal-based reactive theme state
 * - LocalStorage persistence (key: 'tn-theme')
 * - Automatic CSS class application to document root
 * - SSR-safe (checks for browser platform)
 *
 * @example
 * ```typescript
 * import { Component, inject, effect } from '@angular/core';
 * import { TnThemeService, TnTheme } from '@truenas/ui';
 *
 * @Component({...})
 * export class MyComponent {
 *   private themeService = inject(TnThemeService);
 *
 *   constructor() {
 *     // Get available theme definitions
 *     const themes = this.themeService.availableThemes;
 *
 *     // Get current theme (signal)
 *     const currentTheme = this.themeService.currentTheme();
 *
 *     // Set theme using enum (recommended)
 *     this.themeService.setTheme(TnTheme.Blue);
 *
 *     // React to theme changes
 *     effect(() => {
 *       console.log('Theme changed to:', this.themeService.currentTheme()?.label);
 *     });
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class TnThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Internal signal holding the current theme enum value
   */
  private readonly currentThemeSignal = signal<TnTheme>(DEFAULT_THEME);

  /**
   * Computed signal that returns the full theme definition for the current theme
   */
  readonly currentTheme = computed<TnThemeDefinition | undefined>(() => {
    const theme = this.currentThemeSignal();
    return THEME_MAP.get(theme);
  });

  /**
   * Computed signal that returns the current theme's CSS class name
   */
  readonly currentThemeClass = computed<string>(() => {
    return this.currentTheme()?.className ?? TnTheme.Dark;
  });

  /**
   * All available theme definitions in the library (readonly array)
   */
  readonly availableThemes: readonly TnThemeDefinition[] = TN_THEME_DEFINITIONS;

  constructor() {
    // Initialize theme from localStorage or default
    this.initializeTheme();

    // Effect to apply theme CSS class to document root whenever theme changes
    effect(() => {
      if (this.isBrowser) {
        this.applyThemeToDOM(this.currentThemeClass());
      }
    });

    // Effect to persist theme to localStorage whenever it changes
    effect(() => {
      if (this.isBrowser) {
        const theme = this.currentTheme();
        if (theme) {
          this.persistThemeToStorage(theme);
        }
      }
    });
  }

  /**
   * Set the current theme.
   * Updates the signal, which triggers effects to apply CSS and save to localStorage.
   *
   * @param theme - The theme to set (use TnTheme enum)
   * @returns true if theme was found and set, false otherwise
   *
   * @example
   * ```typescript
   * themeService.setTheme(TnTheme.Dracula);
   * ```
   */
  setTheme(theme: TnTheme): boolean {
    const themeDefinition = THEME_MAP.get(theme);
    if (themeDefinition) {
      this.currentThemeSignal.set(theme);
      return true;
    }
    console.warn(`[TnThemeService] Theme "${theme}" not found. Available themes:`, Array.from(THEME_MAP.keys()));
    return false;
  }

  /**
   * Get the current theme enum value (reactive signal value)
   */
  getCurrentTheme(): TnTheme {
    return this.currentThemeSignal();
  }

  /**
   * Reset theme to default
   */
  resetToDefault(): void {
    this.setTheme(DEFAULT_THEME);
  }

  /**
   * Check if a theme exists
   */
  hasTheme(theme: TnTheme): boolean {
    return THEME_MAP.has(theme);
  }

  /**
   * Initialize theme from localStorage or use default
   */
  private initializeTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as TnTheme;
      if (storedTheme && this.hasTheme(storedTheme)) {
        this.currentThemeSignal.set(storedTheme);
      } else {
        // If no valid stored theme, use default
        this.currentThemeSignal.set(DEFAULT_THEME);
      }
    } catch (error) {
      console.error('[TnThemeService] Error reading from localStorage:', error);
      this.currentThemeSignal.set(DEFAULT_THEME);
    }
  }

  /**
   * Apply theme CSS class to document root.
   * Removes all other theme classes first to avoid conflicts.
   *
   * @param themeClass - CSS class name to apply (e.g., 'tn-dark')
   */
  private applyThemeToDOM(themeClass: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const root = document.documentElement;

      // Remove all existing theme classes
      TN_THEME_DEFINITIONS.forEach((theme) => {
        root.classList.remove(theme.className);
      });

      // Add the new theme class
      root.classList.add(themeClass);
    } catch (error) {
      console.error('[TnThemeService] Error applying theme to DOM:', error);
    }
  }

  /**
   * Persist theme to localStorage.
   * Colors are applied automatically via CSS classes from themes.css.
   *
   * @param theme - Theme definition to persist
   */
  private persistThemeToStorage(theme: TnThemeDefinition): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.name);
    } catch (error) {
      console.error('[TnThemeService] Error writing to localStorage:', error);
    }
  }
}
