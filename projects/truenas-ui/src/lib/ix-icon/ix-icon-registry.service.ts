import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface IconLibrary {
  name: string;
  resolver: (iconName: string, options?: any) => string | HTMLElement | null;
  defaultOptions?: any;
}

export interface ResolvedIcon {
  source: 'svg' | 'css' | 'unicode' | 'text';
  content: string | SafeHtml;
}

@Injectable({
  providedIn: 'root'
})
export class IxIconRegistryService {
  private libraries = new Map<string, IconLibrary>();
  private customIcons = new Map<string, string>();

  constructor(private sanitizer: DomSanitizer) {}

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
   * Resolve an icon using registered libraries and custom icons
   * 
   * Format: "library:icon-name" or just "icon-name" for custom icons
   * 
   * @example
   * ```typescript
   * // Library icons
   * registry.resolveIcon('lucide:home')
   * registry.resolveIcon('heroicons:user-circle')
   * registry.resolveIcon('fa:home')
   * 
   * // Custom icons
   * registry.resolveIcon('my-logo')
   * registry.resolveIcon('custom:special-icon')
   * ```
   */
  resolveIcon(name: string, options?: any): ResolvedIcon | null {
    // Handle library prefix (e.g., "lucide:home")
    if (name.includes(':')) {
      const [libraryName, iconName] = name.split(':', 2);
      return this.resolveLibraryIcon(libraryName, iconName, options);
    }

    // Handle custom prefix (e.g., "custom:icon")
    if (name.startsWith('custom:')) {
      const iconName = name.replace('custom:', '');
      return this.resolveCustomIcon(iconName);
    }

    // Handle direct custom icon name
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

  private resolveLibraryIcon(libraryName: string, iconName: string, options?: any): ResolvedIcon | null {
    const library = this.libraries.get(libraryName);
    if (!library) {
      console.warn(`Icon library '${libraryName}' is not registered`);
      return null;
    }

    try {
      const mergedOptions = { ...library.defaultOptions, ...options };
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