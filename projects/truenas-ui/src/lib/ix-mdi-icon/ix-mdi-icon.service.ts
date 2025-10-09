import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IxIconRegistryService, IconLibrary } from '../ix-icon/ix-icon-registry.service';
import { 
  mdiHarddisk,
  mdiServer,
  mdiNas,
  mdiDatabaseOutline,
  mdiStoreOutline,
  mdiFolder,
  mdiFile,
  mdiMemory,
  mdiCpu64Bit,
  mdiMonitorShare,
  mdiChevronRight,
  mdiChevronDown,
  mdiArrowRight,
  mdiArrowDown,
  mdiMenuRight,
  mdiMenuDown,
  mdiFolderPlus,
  mdiLoading,
  mdiRefresh,
  mdiLock,
  mdiFolderOpen
} from '@mdi/js';

/**
 * Icon catalog for TrueNAS-relevant MDI icons
 * This defines which icons are available for lazy loading
 */
const TRUENAS_MDI_ICON_CATALOG = {
  // Hardware and Storage Icons
  'harddisk': mdiHarddisk,
  'server': mdiServer,
  'nas': mdiNas,
  'database': mdiDatabaseOutline,
  'storage': mdiStoreOutline,
  'folder': mdiFolder,
  'file': mdiFile,
  'memory': mdiMemory,
  'cpu': mdiCpu64Bit,
  'network-share': mdiMonitorShare,
  
  // Navigation and Tree Expand/Collapse Icons
  'chevron-right': mdiChevronRight,
  'chevron-down': mdiChevronDown,
  'arrow-right': mdiArrowRight,
  'arrow-down': mdiArrowDown,
  'menu-right': mdiMenuRight,
  'menu-down': mdiMenuDown,
  
  // UI and Action Icons
  'folder-plus': mdiFolderPlus,
  'loading': mdiLoading,
  'refresh': mdiRefresh,
  'lock': mdiLock,
  'folder-open': mdiFolderOpen
} as const;

@Injectable({
  providedIn: 'root'
})
export class IxMdiIconService {
  private registeredIcons = new Set<string>();
  private mdiLibrary!: IconLibrary;

  constructor(
    private iconRegistry: IxIconRegistryService,
    private domSanitizer: DomSanitizer
  ) {
    this.setupMdiLibrary();
  }

  /**
   * Set up the MDI icon library with the icon registry
   */
  private setupMdiLibrary(): void {
    this.mdiLibrary = {
      name: 'mdi',
      resolver: (iconName: string, options: any = {}) => {
        const iconPath = TRUENAS_MDI_ICON_CATALOG[iconName as keyof typeof TRUENAS_MDI_ICON_CATALOG];
        if (iconPath) {
          return this.createSvgContent(iconPath);
        }
        return null;
      }
    };
  }

  /**
   * Register a single MDI icon with the icon registry
   * @param name The icon name to register
   * @param svgPath The SVG path data from @mdi/js
   * @returns Promise<boolean> True if registration was successful
   */
  async registerIcon(name: string, svgPath: string): Promise<boolean> {
    try {
      // Register the library if not already registered
      if (!this.iconRegistry.hasLibrary('mdi')) {
        this.iconRegistry.registerLibrary(this.mdiLibrary);
      }
      
      this.registeredIcons.add(name);
      return true;
    } catch (error) {
      console.error(`Failed to register MDI icon '${name}':`, error);
      return false;
    }
  }

  /**
   * Check if an icon is already registered
   * @param name The icon name to check
   * @returns boolean True if the icon is registered
   */
  isIconRegistered(name: string): boolean {
    return this.registeredIcons.has(name);
  }

  /**
   * Ensure an icon is loaded from the catalog (lazy loading)
   * @param iconName The icon name to load
   * @returns Promise<boolean> True if the icon was loaded or already registered
   */
  async ensureIconLoaded(iconName: string): Promise<boolean> {
    // Register the library if not already registered
    if (!this.iconRegistry.hasLibrary('mdi')) {
      this.iconRegistry.registerLibrary(this.mdiLibrary);
    }

    // Check if icon exists in catalog
    if (!(iconName in TRUENAS_MDI_ICON_CATALOG)) {
      return false;
    }

    // For the icon registry system, we don't need to pre-register individual icons
    // The library resolver will handle them on demand
    this.registeredIcons.add(iconName);
    return true;
  }

  /**
   * Load icon data from the catalog
   * @param iconName The icon name to load
   * @returns Promise<string | null> The SVG path data or null if not found
   */
  async loadIconData(iconName: string): Promise<string | null> {
    const iconData = TRUENAS_MDI_ICON_CATALOG[iconName as keyof typeof TRUENAS_MDI_ICON_CATALOG];
    return iconData || null;
  }

  /**
   * Create SVG content from MDI path data
   * @param svgPath The SVG path data from @mdi/js
   * @returns string Complete SVG markup
   */
  private createSvgContent(svgPath: string): string {
    return `<svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="currentColor" d="${svgPath}"/>
    </svg>`;
  }
}