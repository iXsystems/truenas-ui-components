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
 * 1. Auto-loads the library's bundled sprite (contains all library icons like chevrons, MDI icons, etc.)
 * 2. Optionally loads consumer's sprite (if they generated one for app-specific icons)
 * 3. Merges both sprite configs - consumer icons override library icons if names conflict
 * 4. Icons are resolved as SVG fragment identifiers (e.g., sprite.svg#icon-name)
 */
@Injectable({
  providedIn: 'root'
})
export class IxSpriteLoaderService {
  private librarySpriteConfig?: SpriteConfig;
  private consumerSpriteConfig?: SpriteConfig;
  private mergedSpriteConfig?: SpriteConfig;
  private spriteLoaded = false;
  private spriteLoadPromise?: Promise<void>;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    // Start loading both library and consumer sprites immediately
    this.loadSpriteConfigs();
  }

  /**
   * Load both library and consumer sprite configurations
   * Library sprite is always loaded, consumer sprite is optional
   */
  private async loadSpriteConfigs(): Promise<void> {
    if (this.spriteLoadPromise) {
      return this.spriteLoadPromise;
    }

    this.spriteLoadPromise = (async () => {
      // Load library sprite (always available, bundled with the library)
      try {
        const libraryConfig = await firstValueFrom(
          this.http.get<SpriteConfig>('truenas-ui/assets/icons/sprite-config.json')
        );
        this.librarySpriteConfig = libraryConfig;
      } catch (error) {
        console.warn('[IxSpriteLoader] Failed to load library sprite config. Library icons may not work:', error);
      }

      // Load consumer sprite (optional, only if consumer generated one)
      try {
        const consumerConfig = await firstValueFrom(
          this.http.get<SpriteConfig>('assets/icons/sprite-config.json')
        );
        this.consumerSpriteConfig = consumerConfig;
      } catch (error) {
        // This is expected if consumer hasn't generated a sprite - not an error
        console.debug('[IxSpriteLoader] No consumer sprite found (this is normal if you haven\'t generated one)');
      }

      // Merge the configs
      this.mergeSpriteConfigs();
      this.spriteLoaded = true;
    })();

    return this.spriteLoadPromise;
  }

  /**
   * Merge library and consumer sprite configs
   * Consumer icons take precedence over library icons if names conflict
   */
  private mergeSpriteConfigs(): void {
    if (!this.librarySpriteConfig && !this.consumerSpriteConfig) {
      return;
    }

    // Start with library config
    const mergedIcons = new Set<string>(this.librarySpriteConfig?.icons || []);

    // Add consumer icons (will override if names conflict)
    if (this.consumerSpriteConfig?.icons) {
      this.consumerSpriteConfig.icons.forEach(icon => mergedIcons.add(icon));
    }

    // Use consumer sprite URL as primary if available, otherwise library sprite URL
    const primarySpriteUrl = this.consumerSpriteConfig?.iconUrl || this.librarySpriteConfig?.iconUrl || '';

    this.mergedSpriteConfig = {
      iconUrl: primarySpriteUrl,
      icons: Array.from(mergedIcons)
    };
  }

  /**
   * Ensure the sprite is loaded before resolving icons
   */
  async ensureSpriteLoaded(): Promise<boolean> {
    await this.loadSpriteConfigs();
    return this.spriteLoaded;
  }

  /**
   * Get the full URL for an icon in the sprite
   * Returns a URL like: assets/icons/sprite.svg?v=hash#icon-name
   * or truenas-ui/assets/icons/sprite.svg?v=hash#icon-name for library icons
   *
   * @param iconName The icon name (e.g., 'folder', 'mdi-server', 'ix-dataset')
   * @returns The fragment identifier URL for the icon, or null if sprite not loaded or icon not in sprite
   */
  getIconUrl(iconName: string): string | null {
    if (!this.mergedSpriteConfig) {
      console.warn(`[IxSpriteLoader] Icon sprite not loaded yet, cannot resolve: ${iconName}`);
      return null;
    }

    // Check if the icon exists in the merged sprite manifest
    if (this.mergedSpriteConfig.icons && !this.mergedSpriteConfig.icons.includes(iconName)) {
      return null;
    }

    // Determine which sprite URL to use
    let spriteUrl: string;

    // Check if icon is in consumer sprite (takes precedence)
    if (this.consumerSpriteConfig?.icons?.includes(iconName)) {
      spriteUrl = this.consumerSpriteConfig.iconUrl;
    } else if (this.librarySpriteConfig?.icons?.includes(iconName)) {
      // Icon is from library sprite
      spriteUrl = this.librarySpriteConfig.iconUrl;
    } else {
      // Fallback to merged config URL
      spriteUrl = this.mergedSpriteConfig.iconUrl;
    }

    // The sprite URL already includes the cache-busting version parameter
    // We just append the icon name as a fragment identifier
    return `${spriteUrl}#${iconName}`;
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
   * Get the merged sprite config if loaded
   */
  getSpriteConfig(): SpriteConfig | undefined {
    return this.mergedSpriteConfig;
  }

  /**
   * Get the library sprite config
   */
  getLibrarySpriteConfig(): SpriteConfig | undefined {
    return this.librarySpriteConfig;
  }

  /**
   * Get the consumer sprite config
   */
  getConsumerSpriteConfig(): SpriteConfig | undefined {
    return this.consumerSpriteConfig;
  }
}
