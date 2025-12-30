import { CommonModule } from '@angular/common';
import type { ElementRef, AfterViewInit} from '@angular/core';
import { ChangeDetectorRef} from '@angular/core';
import { Component, input, computed, effect, ChangeDetectionStrategy, ViewEncapsulation, inject, viewChild } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { IxIconRegistryService } from './ix-icon-registry.service';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconSource = 'svg' | 'css' | 'unicode' | 'text' | 'sprite';
export type IconLibraryType = 'material' | 'mdi' | 'custom' | 'lucide';

export interface IconResult {
  source: IconSource;
  content: string | SafeHtml;
  spriteUrl?: string; // For sprite-based icons
}

@Component({
  selector: 'ix-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-icon.component.html',
  styleUrl: './ix-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IxIconComponent implements AfterViewInit {
  name = input<string>('');
  size = input<IconSize>('md');
  color = input<string | undefined>(undefined);
  tooltip = input<string | undefined>(undefined);
  ariaLabel = input<string | undefined>(undefined);
  library = input<IconLibraryType | undefined>(undefined);

  svgContainer = viewChild<ElementRef<HTMLDivElement>>('svgContainer');

  iconResult: IconResult = { source: 'text', content: '?' };

  private iconRegistry = inject(IxIconRegistryService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    // Use effect to watch for changes in name or library
    effect(() => {
      const currentName = this.name();
      const currentLibrary = this.library();

      // Trigger icon resolution when name or library changes
      this.resolveIcon()
        .then(() => {
          this.cdr.markForCheck();
          setTimeout(() => this.updateSvgContent(), 0);
        })
        .catch((error) => {
          console.error('[IxIcon] Resolution failed (onChange)', error);
          this.iconResult = { source: 'text', content: '!' };
          this.cdr.markForCheck();
        });
    });
  }

  ngAfterViewInit(): void {
    this.updateSvgContent();
  }

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || this.name() || 'Icon';
  });

  sanitizedContent = computed(() => {
    const content = this.iconResult.content;

    // Handle mock SafeHtml objects from Storybook
    if (content && typeof content === 'object' && (content as { changingThisBreaksApplicationSecurity?: string }).changingThisBreaksApplicationSecurity) {
      return (content as { changingThisBreaksApplicationSecurity: string }).changingThisBreaksApplicationSecurity;
    }

    return content;
  });

  private updateSvgContent(): void {
    const svgContainer = this.svgContainer();
    if (this.iconResult.source === 'svg' && svgContainer) {
      const content = this.sanitizedContent();
      if (typeof content === 'string') {
        // Bypass Angular's sanitization by setting innerHTML directly
        svgContainer.nativeElement.innerHTML = content;
      }
    }
  }

  private async resolveIcon(): Promise<void> {
    if (!this.name()) {
      this.iconResult = { source: 'text', content: '?' };
      return;
    }

    // Wait for sprite to load (if it's being loaded)
    try {
      await this.iconRegistry.getSpriteLoader().ensureSpriteLoaded();
    } catch (error) {
      // Sprite loading failed, continue with other resolution methods
      console.warn('[IxIcon] Sprite loading failed, falling back to other icon sources:', error);
    }

    // Construct the effective icon name based on library attribute
    let effectiveIconName = this.name();
    if (this.library() === 'mdi' && !this.name().startsWith('mdi-')) {
      effectiveIconName = `mdi-${this.name()}`;
    } else if (this.library() === 'material' && !this.name().startsWith('mat-')) {
      // Material icons get mat- prefix in sprite
      effectiveIconName = `mat-${this.name()}`;
    } else if (this.library() === 'lucide' && !this.name().includes(':')) {
      // Convert to registry format for Lucide icons
      effectiveIconName = `lucide:${this.name()}`;
    }

    // 1. Try icon registry (libraries and custom icons)
    const iconOptions = {
      size: this.size(),
      color: this.color()
    };
    let registryResult = this.iconRegistry.resolveIcon(effectiveIconName, iconOptions);

    // Fallback to global registry for Storybook/demos (when DI doesn't work)
    if (!registryResult && typeof window !== 'undefined' && (window as { __storybookIconRegistry?: IxIconRegistryService }).__storybookIconRegistry) {
      const globalRegistry = (window as unknown as { __storybookIconRegistry: IxIconRegistryService }).__storybookIconRegistry;
      if (globalRegistry) {
        registryResult = globalRegistry.resolveIcon(effectiveIconName, iconOptions);
      }
    }

    if (registryResult) {
      this.iconResult = registryResult;
      return;
    }

    // 2. Try built-in third-party patterns (deprecated - use registry instead)
    const thirdPartyResult = this.tryThirdPartyIcon(effectiveIconName);
    if (thirdPartyResult) {
      this.iconResult = thirdPartyResult;
      return;
    }

    // 3. Try CSS class (Font Awesome, Material Icons, etc.)
    const cssResult = this.tryCssIcon(effectiveIconName);
    if (cssResult) {
      this.iconResult = cssResult;
      return;
    }

    // 4. Try Unicode mapping
    const unicodeResult = this.tryUnicodeIcon(effectiveIconName);
    if (unicodeResult) {
      this.iconResult = unicodeResult;
      return;
    }

    // 5. Fallback to text abbreviation
    this.iconResult = {
      source: 'text',
      content: this.generateTextAbbreviation(effectiveIconName)
    };
  }

  private tryThirdPartyIcon(name: string): IconResult | null {
    // This method is deprecated in favor of the icon registry
    // Keeping for backward compatibility only
    
    // Legacy support for old custom: prefix before registry was available
    if (name.startsWith('custom:')) {
      console.warn('Using deprecated custom: prefix. Please use the icon registry instead.');
      const iconName = name.replace('custom:', '');
      const legacyIcons: Record<string, string> = {
        'heart': `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>`,
        'rocket': `<svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.81 14.7l1.68-1.68L7.66 16.2 6.93 17.78 2.81 14.7zm16.55-11.45c-.78-.78-2.05-.78-2.83 0l-1.72 1.72c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l1.72-1.72c.78-.78.78-2.05 0-2.83z"/>
        </svg>`
      };
      
      if (legacyIcons[iconName]) {
        return {
          source: 'svg',
          content: this.sanitizer.bypassSecurityTrustHtml(legacyIcons[iconName])
        };
      }
    }

    return null;
  }

  private tryCssIcon(name: string): IconResult | null {
    // Font Awesome pattern
    if (name.startsWith('fa-') || name.startsWith('fas-') || name.startsWith('far-')) {
      return {
        source: 'css',
        content: name.startsWith('fa-') ? name : name.replace('-', ' fa-')
      };
    }

    // Material Icons pattern
    if (name.startsWith('mat-') || name.includes('material')) {
      const materialName = name.replace('mat-', '').replace('material-', '');
      return {
        source: 'css',
        content: `material-icons material-icons-${materialName}`
      };
    }

    // Check if class exists in document
    if (this.cssClassExists(name)) {
      return {
        source: 'css',
        content: name
      };
    }

    return null;
  }

  private tryUnicodeIcon(name: string): IconResult | null {
    const unicodeMap: Record<string, string> = {
      'home': '⌂',
      'star': '★',
      'check': '✓',
      'close': '✕',
      'warning': '⚠',
      'info': 'ⓘ',
      'arrow-left': '←',
      'arrow-right': '→',
      'arrow-up': '↑',
      'arrow-down': '↓',
      'menu': '☰',
      'settings': '⚙',
      'user': '👤',
      'search': '🔍',
      'heart': '♥',
      'plus': '+',
      'minus': '−',
    };

    const unicode = unicodeMap[name.toLowerCase()];
    return unicode ? { source: 'unicode', content: unicode } : null;
  }

  private generateTextAbbreviation(name: string): string {
    if (!name) {return '?';}
    
    // Handle hyphenated names (e.g., 'arrow-left' -> 'AL')
    if (name.includes('-')) {
      const parts = name.split('-');
      return parts
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }

    // Default to first 2 characters
    return name.substring(0, 2).toUpperCase();
  }

  private cssClassExists(className: string): boolean {
    if (typeof document === 'undefined') {return false;}
    
    // For now, only return true for known CSS icon patterns
    // In real implementation, consumers would override this method
    return false; // Disable generic CSS class checking for now
  }
}