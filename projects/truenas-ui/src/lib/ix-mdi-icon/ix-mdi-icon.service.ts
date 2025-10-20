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
  mdiChevronLeft,
  mdiChevronUp,
  mdiArrowRight,
  mdiArrowDown,
  mdiArrowLeft,
  mdiArrowUp,
  mdiMenuRight,
  mdiMenuDown,
  mdiMenuLeft,
  mdiMenuUp,
  mdiFolderPlus,
  mdiLoading,
  mdiRefresh,
  mdiLock,
  mdiFolderOpen,
  mdiPencil,
  mdiDelete,
  mdiContentCopy,
  mdiCheck,
  mdiClose,
  mdiPlus,
  mdiMinus,
  mdiCog,
  mdiDotsHorizontal,
  mdiDotsVertical,
  mdiFloppy,
  mdiStop,
  mdiMagnify,
  mdiFilter,
  mdiInformation,
  mdiInformationOutline,
  mdiCloseCircle,
  mdiHelpCircle,
  mdiAccountCircle,
  mdiAccountGroup,
  mdiShieldLock,
  mdiKey,
  mdiLockOpen,
  mdiUpload,
  mdiDownload,
  mdiArchive,
  mdiZipBox,
  mdiEye,
  mdiEyeOff,
  mdiViewDashboard,
  mdiHome,
  mdiPower,
  mdiRestart,
  mdiStar,
  mdiHeart,
  mdiMenu,
  mdiBell,
  mdiShareVariant
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

  // Navigation and Directional Icons (all 4 directions)
  'chevron-right': mdiChevronRight,
  'chevron-down': mdiChevronDown,
  'chevron-left': mdiChevronLeft,
  'chevron-up': mdiChevronUp,
  'arrow-right': mdiArrowRight,
  'arrow-down': mdiArrowDown,
  'arrow-left': mdiArrowLeft,
  'arrow-up': mdiArrowUp,
  'menu-right': mdiMenuRight,
  'menu-down': mdiMenuDown,
  'menu-left': mdiMenuLeft,
  'menu-up': mdiMenuUp,
  'home': mdiHome,

  // File and Folder Operations
  'folder-plus': mdiFolderPlus,
  'folder-open': mdiFolderOpen,
  'upload': mdiUpload,
  'download': mdiDownload,
  'archive': mdiArchive,
  'zip-box': mdiZipBox,

  // Critical UI Actions
  'pencil': mdiPencil,
  'delete': mdiDelete,
  'content-copy': mdiContentCopy,
  'check': mdiCheck,
  'close': mdiClose,
  'plus': mdiPlus,
  'minus': mdiMinus,
  'cog': mdiCog,
  'settings': mdiCog,
  'dots-horizontal': mdiDotsHorizontal,
  'dots-vertical': mdiDotsVertical,
  'floppy': mdiFloppy,
  'stop': mdiStop,
  'loading': mdiLoading,
  'refresh': mdiRefresh,

  // Search and Filter
  'magnify': mdiMagnify,
  'filter': mdiFilter,

  // Status and Alerts
  'info': mdiInformation,
  'information': mdiInformation,
  'information-outline': mdiInformationOutline,
  'close-circle': mdiCloseCircle,
  'help-circle': mdiHelpCircle,

  // Security and Access
  'lock': mdiLock,
  'lock-open': mdiLockOpen,
  'shield-lock': mdiShieldLock,
  'key': mdiKey,

  // User and Account
  'account-circle': mdiAccountCircle,
  'account-group': mdiAccountGroup,

  // Visibility
  'eye': mdiEye,
  'eye-off': mdiEyeOff,
  'view-dashboard': mdiViewDashboard,

  // System Control
  'power': mdiPower,
  'restart': mdiRestart,

  // Common UI Icons
  'star': mdiStar,
  'heart': mdiHeart,
  'menu': mdiMenu,
  'bell': mdiBell,
  'share-variant': mdiShareVariant
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

    // Register the library immediately so it's available for all icons
    this.iconRegistry.registerLibrary(this.mdiLibrary);
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