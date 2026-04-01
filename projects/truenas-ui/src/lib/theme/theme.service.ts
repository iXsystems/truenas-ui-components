import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import {
  TN_THEME_DEFINITIONS,
  THEME_MAP,
  DEFAULT_THEME,
  LIGHT_THEME,
  THEME_STORAGE_KEY,
} from './theme.constants';
import type { TnThemeDefinition } from './theme.interface';
import { TnTheme } from './theme.interface';

/**
 * Service for managing themes in the TrueNAS UI Components library.
 *
 * Features:
 * - Signal-based reactive theme state
 * - OS color scheme detection (prefers-color-scheme)
 * - LocalStorage persistence for explicit user choices (key: 'tn-theme')
 * - Automatic CSS class application to document root
 * - SSR-safe (checks for browser platform)
 *
 * @example
 * ```typescript
 * import { Component, inject, effect } from '@angular/core';
 * import { TnThemeService, TnTheme } from '@truenas/ui-components';
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
 *     // Set theme using enum (recommended) — persists to localStorage
 *     this.themeService.setTheme(TnTheme.Blue);
 *
 *     // Clear user preference and follow OS theme
 *     this.themeService.clearPreference();
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
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Internal signal holding the current theme enum value
   */
  private readonly currentThemeSignal = signal<TnTheme>(DEFAULT_THEME);

  /**
   * Whether the user has explicitly selected a theme (vs OS-detected default).
   * When true, theme is persisted to localStorage and OS changes are ignored.
   */
  private readonly userSelected = signal(false);

  /**
   * Reference to the prefers-color-scheme media query for cleanup
   */
  private colorSchemeQuery: MediaQueryList | null = null;

  /**
   * Bound listener reference for cleanup
   */
  private readonly colorSchemeListener = (event: MediaQueryListEvent): void => {
    if (!this.userSelected()) {
      this.currentThemeSignal.set(event.matches ? DEFAULT_THEME : LIGHT_THEME);
    }
  };

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
   * Whether the current theme is based on OS preference (no explicit user choice)
   */
  readonly isUsingSystemTheme = computed<boolean>(() => !this.userSelected());

  /**
   * All available theme definitions in the library (readonly array)
   */
  readonly availableThemes: readonly TnThemeDefinition[] = TN_THEME_DEFINITIONS;

  constructor() {
    // Initialize theme from localStorage or OS preference
    this.initializeTheme();

    // Effect to apply theme CSS class to document root whenever theme changes
    effect(() => {
      if (this.isBrowser) {
        this.applyThemeToDOM(this.currentThemeClass());
      }
    });

    // Effect to persist theme to localStorage only for explicit user choices
    effect(() => {
      if (this.isBrowser && this.userSelected()) {
        const theme = this.currentTheme();
        if (theme) {
          this.persistThemeToStorage(theme);
        }
      }
    });
  }

  /**
   * Set the current theme.
   * Marks this as an explicit user choice, persists to localStorage,
   * and stops following OS color scheme changes.
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
      this.userSelected.set(true);
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
   * Reset theme to default by clearing user preference and reverting to OS detection.
   */
  resetToDefault(): void {
    this.clearPreference();
  }

  /**
   * Clear user preference and revert to OS-based theme detection.
   * Removes the stored theme from localStorage and follows the OS color scheme.
   */
  clearPreference(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } catch (error) {
        console.error('[TnThemeService] Error removing from localStorage:', error);
      }
    }
    this.userSelected.set(false);
    this.applySystemTheme();
    this.listenForColorSchemeChanges();
  }

  /**
   * Check if a theme exists
   */
  hasTheme(theme: TnTheme): boolean {
    return THEME_MAP.has(theme);
  }

  /**
   * Initialize theme from localStorage or OS color scheme preference
   */
  private initializeTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as TnTheme;
      if (storedTheme && this.hasTheme(storedTheme)) {
        this.userSelected.set(true);
        this.currentThemeSignal.set(storedTheme);
      } else {
        // No valid stored theme — detect from OS preference
        this.applySystemTheme();
        this.listenForColorSchemeChanges();
      }
    } catch (error) {
      console.error('[TnThemeService] Error reading from localStorage:', error);
      this.applySystemTheme();
      this.listenForColorSchemeChanges();
    }
  }

  /**
   * Detect OS color scheme preference and apply corresponding theme
   */
  private applySystemTheme(): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentThemeSignal.set(prefersDark ? DEFAULT_THEME : LIGHT_THEME);
    } catch {
      this.currentThemeSignal.set(DEFAULT_THEME);
    }
  }

  /**
   * Listen for OS color scheme changes and apply them when no user preference is set
   */
  private listenForColorSchemeChanges(): void {
    if (!this.isBrowser || this.colorSchemeQuery) {
      return;
    }

    try {
      this.colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.colorSchemeQuery.addEventListener('change', this.colorSchemeListener);

      this.destroyRef.onDestroy(() => {
        this.colorSchemeQuery?.removeEventListener('change', this.colorSchemeListener);
      });
    } catch {
      // matchMedia not supported — fall through silently
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
