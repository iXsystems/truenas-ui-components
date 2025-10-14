import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';
import { firstValueFrom } from 'rxjs';

/**
 * Service for loading and registering TrueNAS custom icons
 */
@Injectable({
  providedIn: 'root'
})
export class TruenasIconsService {
  private iconsLoaded = false;
  private iconBasePath = 'truenas-ui/src/assets/icons/';

  constructor(
    private http: HttpClient,
    private iconRegistry: IxIconRegistryService
  ) {}

  /**
   * Load and register all TrueNAS custom icons
   * Call this in your app initialization (APP_INITIALIZER or main component)
   *
   * @param basePath Optional custom base path for icons (defaults to 'truenas-ui/src/assets/icons/')
   * @returns Promise that resolves when all icons are loaded
   */
  async loadIcons(basePath?: string): Promise<void> {
    if (this.iconsLoaded) {
      return;
    }

    if (basePath) {
      this.iconBasePath = basePath;
    }

    try {
      // List of TrueNAS custom icons to load
      const iconFiles = [
        { name: 'tn-dataset', file: 'dataset.svg' }
        // Add more icons here as needed
      ];

      // Load all icons in parallel
      const loadPromises = iconFiles.map(async ({ name, file }) => {
        try {
          const svgContent = await firstValueFrom(
            this.http.get(`${this.iconBasePath}${file}`, { responseType: 'text' })
          );
          this.iconRegistry.registerIcon(name, svgContent);
        } catch (error) {
          console.warn(`Failed to load TrueNAS icon '${name}' from ${file}:`, error);
        }
      });

      await Promise.all(loadPromises);
      this.iconsLoaded = true;
    } catch (error) {
      console.error('Failed to load TrueNAS custom icons:', error);
    }
  }

  /**
   * Register a single custom icon from SVG content
   * Use this for inline registration without HTTP
   */
  registerIcon(name: string, svgContent: string): void {
    this.iconRegistry.registerIcon(name, svgContent);
  }

  /**
   * Check if icons have been loaded
   */
  isLoaded(): boolean {
    return this.iconsLoaded;
  }
}
