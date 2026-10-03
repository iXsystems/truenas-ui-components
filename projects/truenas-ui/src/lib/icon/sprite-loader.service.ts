import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, type Signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

/**
 * Default base path for sprite assets (namespaced to avoid collisions with consumer apps)
 * This should match the value in sprite-config-interface.ts
 */
export const defaultSpriteBasePath = 'assets/tn-icons';

/**
 * Default path for the sprite configuration file.
 */
export const defaultSpriteConfigPath = `${defaultSpriteBasePath}/sprite-config.json`;

export interface SpriteConfig {
  iconUrl: string;
  icons?: string[]; // List of available icon IDs in the sprite
}

/**
 * Service for loading and managing icon sprites.
 * This is a custom implementation that does NOT depend on Angular Material.
 *
 * The sprite system works by:
 * 1. Loads the application's sprite (generated via `yarn icons` command)
 * 2. The sprite includes both consumer icons and library-internal icons (chevrons, folder, etc.)
 * 3. Icons are resolved as SVG fragment identifiers (e.g., sprite.svg#icon-name)
 */
@Injectable({
  providedIn: 'root'
})
export class TnSpriteLoaderService {
  private spriteConfig?: SpriteConfig;
  private spriteLoadPromise?: Promise<void>;

  /**
   * A signal rather than a plain field, because the fetch below starts from the
   * constructor and lands whenever it lands: anything that resolves an icon
   * before it does gets a miss, and needs to be told when to ask again (#341).
   */
  private readonly spriteLoadedState = signal(false);

  /**
   * Whether the sprite config has loaded, as a signal — read it inside a
   * `computed`/`effect` to re-resolve when the sprite arrives.
   *
   * `isSpriteLoaded()` reads the same state, so a caller that just wants the
   * current value needs nothing from here; this is for a caller that wants to
   * react to it changing.
   */
  readonly spriteLoaded: Signal<boolean> = this.spriteLoadedState.asReadonly();

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    // Start loading sprite immediately (fire-and-forget)
    void this.loadSpriteConfig();
  }

  /**
   * Load the sprite configuration
   */
  private async loadSpriteConfig(): Promise<void> {
    if (this.spriteLoadPromise) {
      return this.spriteLoadPromise;
    }

    this.spriteLoadPromise = (async () => {
      try {
        const config = await firstValueFrom(
          this.http.get<SpriteConfig>(defaultSpriteConfigPath)
        );
        // Config first, then the flag: a reader woken by the signal below goes
        // straight to `getIconUrl`, which needs the config already there.
        this.spriteConfig = config;
        this.spriteLoadedState.set(true);
      } catch (error) {
        console.error('[TnSpriteLoader] Failed to load sprite config. Icons may not work:', error);
      }
    })();

    return this.spriteLoadPromise;
  }

  /**
   * Ensure the sprite is loaded before resolving icons
   */
  async ensureSpriteLoaded(): Promise<boolean> {
    await this.loadSpriteConfig();
    return this.spriteLoadedState();
  }

  /**
   * Get the full URL for an icon in the sprite
   * Returns a URL like: assets/icons/sprite.svg?v=hash#icon-name
   *
   * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'tn-dataset')
   * @returns The fragment identifier URL for the icon, or null if sprite not loaded or icon not in sprite
   */
  getIconUrl(iconName: string): string | null {
    if (!this.spriteConfig) {
      console.warn(`[TnSpriteLoader] Icon sprite not loaded yet, cannot resolve: ${iconName}`);
      return null;
    }

    // Check if the icon exists in the sprite manifest
    if (this.spriteConfig.icons && !this.spriteConfig.icons.includes(iconName)) {
      return null;
    }

    // The sprite URL already includes the cache-busting version parameter
    // We just append the icon name as a fragment identifier
    return `${this.spriteConfig.iconUrl}#${iconName}`;
  }

  /**
   * Get a sanitized resource URL for an icon
   * This is used when binding to [src] or similar attributes
   *
   * @param iconName The icon name
   * @returns Sanitized resource URL or null
   */
  getSafeIconUrl(iconName: string): SafeResourceUrl | null {
    const url = this.getIconUrl(iconName);
    if (!url) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Check if the sprite is loaded.
   *
   * Reads the `spriteLoaded` signal, so a call made from inside a `computed` or
   * an `effect` is tracked and that consumer re-runs when the sprite arrives —
   * which is how an icon resolved too early gets a second chance (#341).
   */
  isSpriteLoaded(): boolean {
    return this.spriteLoadedState();
  }

  /**
   * Get the sprite config if loaded
   */
  getSpriteConfig(): SpriteConfig | undefined {
    return this.spriteConfig;
  }
}
