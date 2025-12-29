/**
 * Lucide Icons Integration Helper
 * 
 * This helper provides easy integration with Lucide icons.
 * Usage:
 * 
 * ```typescript
 * import { setupLucideIntegration } from 'truenas-ui';
 * import * as LucideIcons from 'lucide';
 * 
 * // In your app.module.ts or main.ts
 * setupLucideIntegration(LucideIcons);
 * 
 * // Now you can use lucide icons in templates:
 * // <ix-icon name="lucide:home"></ix-icon>
 * // <ix-icon name="lucide:user-circle"></ix-icon>
 * ```
 */

import { inject } from '@angular/core';
import type { IconLibrary } from '../ix-icon-registry.service';
import { IxIconRegistryService } from '../ix-icon-registry.service';

export interface LucideIconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
}

/**
 * Set up Lucide icons integration with the icon registry
 * 
 * @param lucideIcons - The Lucide icons object (import * as LucideIcons from 'lucide')
 * @param defaultOptions - Default options for all Lucide icons
 * 
 * @example
 * ```typescript
 * import * as LucideIcons from 'lucide';
 * import { setupLucideIntegration } from 'truenas-ui';
 * 
 * setupLucideIntegration(LucideIcons, {
 *   size: 24,
 *   strokeWidth: 2,
 *   color: 'currentColor'
 * });
 * ```
 */
export function setupLucideIntegration(
  lucideIcons: any,
  defaultOptions: LucideIconOptions = {}
): void {
  const registry = inject(IxIconRegistryService);
  
  const lucideLibrary: IconLibrary = {
    name: 'lucide',
    resolver: (iconName: string, options: LucideIconOptions = {}) => {
      // Convert kebab-case to PascalCase (home-icon -> HomeIcon)
      const pascalCase = iconName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      const iconFunction = lucideIcons[pascalCase];
      
      if (iconFunction && typeof iconFunction === 'function') {
        try {
          // Merge default options with provided options
          const mergedOptions = {
            size: 24,
            color: 'currentColor',
            strokeWidth: 2,
            ...defaultOptions,
            ...options
          };
          
          // Call the Lucide icon function to get SVG element
          const svgElement = iconFunction(mergedOptions);
          
          if (svgElement && svgElement.outerHTML) {
            return svgElement.outerHTML;
          }
        } catch (error) {
          console.warn(`Failed to render Lucide icon '${iconName}':`, error);
        }
      }
      
      return null;
    },
    defaultOptions
  };
  
  registry.registerLibrary(lucideLibrary);
}

/**
 * Alternative setup function that allows manual registration
 * Use this if you want more control over which icons are available
 * 
 * @example
 * ```typescript
 * import { Home, User, Settings } from 'lucide';
 * import { createLucideLibrary } from 'truenas-ui';
 * 
 * const lucideLibrary = createLucideLibrary({
 *   home: Home,
 *   user: User,
 *   settings: Settings
 * });
 * 
 * // Register manually
 * iconRegistry.registerLibrary(lucideLibrary);
 * ```
 */
export function createLucideLibrary(
  icons: Record<string, any>,
  defaultOptions: LucideIconOptions = {}
): IconLibrary {
  return {
    name: 'lucide',
    resolver: (iconName: string, options: LucideIconOptions = {}) => {
      const iconFunction = icons[iconName];
      
      if (iconFunction && typeof iconFunction === 'function') {
        try {
          const mergedOptions = {
            size: 24,
            color: 'currentColor',
            strokeWidth: 2,
            ...defaultOptions,
            ...options
          };
          
          const svgElement = iconFunction(mergedOptions);
          
          if (svgElement && svgElement.outerHTML) {
            return svgElement.outerHTML;
          }
        } catch (error) {
          console.warn(`Failed to render Lucide icon '${iconName}':`, error);
        }
      }
      
      return null;
    },
    defaultOptions
  };
}

/**
 * Register common Lucide icons individually
 * Useful when you only want specific icons to reduce bundle size
 * 
 * @example
 * ```typescript
 * import { Home, User, Settings, Heart, Star } from 'lucide';
 * import { registerLucideIcons } from 'truenas-ui';
 * 
 * registerLucideIcons({
 *   home: Home,
 *   user: User,
 *   settings: Settings,
 *   heart: Heart,
 *   star: Star
 * });
 * ```
 */
export function registerLucideIcons(icons: Record<string, any>): void {
  const registry = inject(IxIconRegistryService);
  
  Object.entries(icons).forEach(([name, iconFunction]) => {
    if (typeof iconFunction === 'function') {
      try {
        const svgElement = iconFunction({
          size: 24,
          color: 'currentColor',
          strokeWidth: 2
        });
        
        if (svgElement && svgElement.outerHTML) {
          registry.registerIcon(`lucide-${name}`, svgElement.outerHTML);
        }
      } catch (error) {
        console.warn(`Failed to register Lucide icon '${name}':`, error);
      }
    }
  });
}