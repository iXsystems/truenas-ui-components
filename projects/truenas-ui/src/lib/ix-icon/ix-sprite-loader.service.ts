import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

export interface SpriteConfig {
  iconUrl: string;
  icons?: string[]; // List of available icon IDs in the sprite
}

/**
 * Service for loading and managing icon sprites.
 * This is a custom implementation that does NOT depend on Angular Material.
 *
 * The sprite system works by:
 * 1. Loading sprite-config.json which contains the versioned sprite URL
 * 2. Icons are resolved as SVG fragment identifiers (e.g., sprite.svg#icon-name)
 * 3. The sprite SVG contains all icons used in the application
 */
@Injectable({
  providedIn: 'root'
})
export class IxSpriteLoaderService {
  private spriteConfig?: SpriteConfig;
  private spriteLoaded = false;
  private spriteLoadPromise?: Promise<void>;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    // Start loading sprite config immediately
    this.loadSpriteConfig();
  }

  /**
   * Load the sprite configuration from assets/icons/sprite-config.json
   * This contains the cache-busted URL for the sprite file
   */
  private async loadSpriteConfig(): Promise<void> {
    if (this.spriteLoadPromise) {
      return this.spriteLoadPromise;
    }

    this.spriteLoadPromise = (async () => {
      try {
        const config = await firstValueFrom(
          this.http.get<SpriteConfig>('assets/icons/sprite-config.json')
        );

        this.spriteConfig = config;
        this.spriteLoaded = true;
      } catch (error) {
        console.error('Failed to load icon sprite config:', error);
        // Set a flag so we don't keep retrying
        this.spriteLoaded = false;
      }
    })();

    return this.spriteLoadPromise;
  }

  /**
   * Ensure the sprite is loaded before resolving icons
   */
  async ensureSpriteLoaded(): Promise<boolean> {
    await this.loadSpriteConfig();
    return this.spriteLoaded;
  }

  /**
   * Get the full URL for an icon in the sprite
   * Returns a URL like: assets/icons/sprite.svg?v=hash#icon-name
   *
   * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'ix-dataset')
   * @returns The fragment identifier URL for the icon, or null if sprite not loaded or icon not in sprite
   */
  getIconUrl(iconName: string): string | null {
    if (!this.spriteConfig) {
      console.warn(`Icon sprite not loaded yet, cannot resolve: ${iconName}`);
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
   * Check if the sprite is loaded
   */
  isSpriteLoaded(): boolean {
    return this.spriteLoaded;
  }

  /**
   * Get the sprite config if loaded
   */
  getSpriteConfig(): SpriteConfig | undefined {
    return this.spriteConfig;
  }
}
