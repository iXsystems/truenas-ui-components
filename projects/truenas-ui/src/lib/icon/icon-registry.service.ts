import { inject, Injectable } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { IxSpriteLoaderService } from './sprite-loader.service';

export interface IconLibrary {
  name: string;
  resolver: (iconName: string, options?: unknown) => string | HTMLElement | null;
  defaultOptions?: unknown;
}

export interface ResolvedIcon {
  source: 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
  content: string | SafeHtml;
  spriteUrl?: string; // For sprite-based icons
}

@Injectable({
  providedIn: 'root'
})
export class IxIconRegistryService {
  private libraries = new Map<string, IconLibrary>();
  private customIcons = new Map<string, string>();

  private sanitizer: DomSanitizer;
  private spriteLoader: IxSpriteLoaderService;

  constructor(
    sanitizer?: DomSanitizer,
    spriteLoader?: IxSpriteLoaderService
  ) {
    // Support both DI and manual injection for testing
    this.sanitizer = sanitizer ?? inject(DomSanitizer);
    this.spriteLoader = spriteLoader ?? inject(IxSpriteLoaderService);
  }

  /**
   * Register an icon library (like Lucide, Heroicons, etc.)
   * 
   * @example
   * ```typescript
   * // Register Lucide
   * import * as LucideIcons from 'lucide';
   * 
   * iconRegistry.registerLibrary({
   *   name: 'lucide',
   *   resolver: (iconName: string, options = {}) => {
   *     const pascalCase = iconName.split('-').map(part => 
   *       part.charAt(0).toUpperCase() + part.slice(1)
   *     ).join('');
   *     
   *     const iconFunction = (LucideIcons as any)[pascalCase];
   *     if (iconFunction && typeof iconFunction === 'function') {
   *       return iconFunction({
   *         size: 24,
   *         color: 'currentColor',
   *         strokeWidth: 2,
   *         ...options
   *       });
   *     }
   *     return null;
   *   },
   *   defaultOptions: { size: 24, strokeWidth: 2 }
   * });
   * ```
   */
  registerLibrary(library: IconLibrary): void {
    this.libraries.set(library.name, library);
  }

  /**
   * Register a custom SVG icon
   * 
   * @example
   * ```typescript
   * iconRegistry.registerIcon('my-logo', `
   *   <svg viewBox="0 0 24 24">
   *     <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.08 2-.35 3-.82z"/>
   *   </svg>
   * `);
   * ```
   */
  registerIcon(name: string, svgContent: string): void {
    this.customIcons.set(name, svgContent);
  }

  /**
   * Register multiple custom icons at once
   */
  registerIcons(icons: Record<string, string>): void {
    Object.entries(icons).forEach(([name, svg]) => {
      this.registerIcon(name, svg);
    });
  }

  /**
   * Resolve an icon from the sprite
   * Returns the sprite URL if the sprite is loaded
   */
  private resolveSpriteIcon(name: string): ResolvedIcon | null {
    if (!this.spriteLoader.isSpriteLoaded()) {
      return null;
    }

    const spriteUrl = this.spriteLoader.getIconUrl(name);
    if (!spriteUrl) {
      return null;
    }

    return {
      source: 'sprite',
      content: '', // Not used for sprite icons
      spriteUrl: spriteUrl
    };
  }

  /**
   * Resolve an icon using sprite, registered libraries, and custom icons
   *
   * Resolution order:
   * 1. Sprite icons (Material, MDI, custom TrueNAS icons)
   * 2. Registered libraries (with prefix, e.g., "lucide:home")
   * 3. Custom registered icons
   *
   * Format: "library:icon-name" or just "icon-name"
   *
   * @example
   * ```typescript
   * // Sprite icons (automatic from sprite.svg)
   * registry.resolveIcon('folder')        // Material Design icon
   * registry.resolveIcon('mdi-server')    // MDI icon
   * registry.resolveIcon('ix-dataset')    // Custom TrueNAS icon
   *
   * // Library icons
   * registry.resolveIcon('lucide:home')
   * registry.resolveIcon('heroicons:user-circle')
   *
   * // Custom registered icons
   * registry.resolveIcon('my-logo')
   * ```
   */
  resolveIcon(name: string, options?: unknown): ResolvedIcon | null {
    // 1. Try sprite first (if loaded)
    const spriteIcon = this.resolveSpriteIcon(name);
    if (spriteIcon) {
      return spriteIcon;
    }

    // 2. Handle library prefix (e.g., "lucide:home")
    if (name.includes(':')) {
      const [libraryName, iconName] = name.split(':', 2);
      return this.resolveLibraryIcon(libraryName, iconName, options);
    }

    // 3. Handle custom prefix (e.g., "custom:icon")
    if (name.startsWith('custom:')) {
      const iconName = name.replace('custom:', '');
      return this.resolveCustomIcon(iconName);
    }

    // 4. Handle direct custom icon name
    return this.resolveCustomIcon(name);
  }

  /**
   * Check if a library is registered
   */
  hasLibrary(libraryName: string): boolean {
    return this.libraries.has(libraryName);
  }

  /**
   * Check if a custom icon is registered
   */
  hasIcon(iconName: string): boolean {
    return this.customIcons.has(iconName);
  }

  /**
   * Get list of registered libraries
   */
  getRegisteredLibraries(): string[] {
    return Array.from(this.libraries.keys());
  }

  /**
   * Get list of registered custom icons
   */
  getRegisteredIcons(): string[] {
    return Array.from(this.customIcons.keys());
  }

  /**
   * Remove a library
   */
  unregisterLibrary(libraryName: string): void {
    this.libraries.delete(libraryName);
  }

  /**
   * Remove a custom icon
   */
  unregisterIcon(iconName: string): void {
    this.customIcons.delete(iconName);
  }

  /**
   * Clear all registered libraries and icons
   */
  clear(): void {
    this.libraries.clear();
    this.customIcons.clear();
  }

  /**
   * Get the sprite loader service
   * Useful for checking sprite status or manually resolving sprite icons
   */
  getSpriteLoader(): IxSpriteLoaderService {
    return this.spriteLoader;
  }

  private resolveLibraryIcon(libraryName: string, iconName: string, options?: unknown): ResolvedIcon | null {
    const library = this.libraries.get(libraryName);
    if (!library) {
      console.warn(`Icon library '${libraryName}' is not registered`);
      return null;
    }

    try {
      const mergedOptions = {
        ...(library.defaultOptions && typeof library.defaultOptions === 'object' ? library.defaultOptions : {}),
        ...(options && typeof options === 'object' ? options : {})
      };
      const result = library.resolver(iconName, mergedOptions);

      if (!result) {
        return null;
      }

      // Handle different types of results
      if (typeof result === 'string') {
        // Assume it's SVG content
        return {
          source: 'svg',
          content: this.sanitizer.bypassSecurityTrustHtml(result)
        };
      } else if (result instanceof HTMLElement) {
        // Convert HTMLElement to string
        return {
          source: 'svg',
          content: this.sanitizer.bypassSecurityTrustHtml(result.outerHTML)
        };
      }

      return null;
    } catch (error) {
      console.warn(`Failed to resolve icon '${libraryName}:${iconName}':`, error);
      return null;
    }
  }

  private resolveCustomIcon(iconName: string): ResolvedIcon | null {
    const svgContent = this.customIcons.get(iconName);
    if (!svgContent) {
      return null;
    }

    return {
      source: 'svg',
      content: this.sanitizer.bypassSecurityTrustHtml(svgContent)
    };
  }
}