import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import type { IconLibrary } from './icon-registry.service';
import { IxIconRegistryService } from './icon-registry.service';
import { IxSpriteLoaderService, type SpriteConfig } from './sprite-loader.service';

describe('IxIconRegistryService', () => {
  let service: IxIconRegistryService;
  let mockSanitizer: jest.Mocked<DomSanitizer>;
  let mockSpriteLoader: Partial<jest.Mocked<IxSpriteLoaderService>>;

  beforeEach(() => {
    mockSanitizer = {
      bypassSecurityTrustHtml: jest.fn((value: string): SafeHtml => value as SafeHtml),
      sanitize: jest.fn(),
      bypassSecurityTrustScript: jest.fn(),
      bypassSecurityTrustStyle: jest.fn(),
      bypassSecurityTrustUrl: jest.fn(),
      bypassSecurityTrustResourceUrl: jest.fn()
    } as jest.Mocked<DomSanitizer>;

    mockSpriteLoader = {
      isSpriteLoaded: jest.fn<boolean, []>().mockReturnValue(false),
      getIconUrl: jest.fn<string | null, [string]>(),
      getSafeIconUrl: jest.fn(),
      ensureSpriteLoaded: jest.fn<Promise<boolean>, []>(),
      getSpriteConfig: jest.fn<SpriteConfig | undefined, []>()
    };

    TestBed.configureTestingModule({
      providers: [
        IxIconRegistryService,
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: IxSpriteLoaderService, useValue: mockSpriteLoader }
      ]
    });

    service = TestBed.inject(IxIconRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerIcon', () => {
    it('should register a custom icon', () => {
      const svgContent = '<svg><path d="M10 10"/></svg>';
      service.registerIcon('my-icon', svgContent);

      expect(service.hasIcon('my-icon')).toBe(true);
    });

    it('should retrieve registered icon', () => {
      const svgContent = '<svg><path d="M10 10"/></svg>';
      service.registerIcon('my-icon', svgContent);

      const result = service.resolveIcon('my-icon');

      expect(result).toBeTruthy();
      expect(result?.source).toBe('svg');
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(svgContent);
    });
  });

  describe('registerIcons (bulk registration)', () => {
    it('should register multiple icons at once', () => {
      const icons = {
        'icon1': '<svg><path d="M1 1"/></svg>',
        'icon2': '<svg><path d="M2 2"/></svg>',
        'icon3': '<svg><path d="M3 3"/></svg>'
      };

      service.registerIcons(icons);

      expect(service.hasIcon('icon1')).toBe(true);
      expect(service.hasIcon('icon2')).toBe(true);
      expect(service.hasIcon('icon3')).toBe(true);
    });

    it('should resolve all bulk-registered icons', () => {
      const icons = {
        'logo': '<svg><circle cx="12" cy="12" r="10"/></svg>',
        'arrow': '<svg><path d="M5 12h14"/></svg>'
      };

      service.registerIcons(icons);

      const logo = service.resolveIcon('logo');
      const arrow = service.resolveIcon('arrow');

      expect(logo?.source).toBe('svg');
      expect(arrow?.source).toBe('svg');
    });

    it('should handle empty icons object', () => {
      service.registerIcons({});

      expect(service.getRegisteredIcons()).toEqual([]);
    });
  });

  describe('registerLibrary', () => {
    it('should register an icon library', () => {
      const library: IconLibrary = {
        name: 'test-lib',
        resolver: (iconName) => `<svg>${iconName}</svg>`
      };

      service.registerLibrary(library);

      expect(service.hasLibrary('test-lib')).toBe(true);
    });

    it('should resolve icon from registered library', () => {
      const library: IconLibrary = {
        name: 'lucide',
        resolver: (iconName) => `<svg class="${iconName}"><path/></svg>`
      };

      service.registerLibrary(library);

      const result = service.resolveIcon('lucide:home');

      expect(result?.source).toBe('svg');
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<svg class="home"><path/></svg>');
    });

    it('should use library default options', () => {
      const resolverSpy = jest.fn((name, options) => `<svg size="${options.size}"></svg>`);
      const library: IconLibrary = {
        name: 'custom-lib',
        resolver: resolverSpy,
        defaultOptions: { size: 24 }
      };

      service.registerLibrary(library);
      service.resolveIcon('custom-lib:test');

      expect(resolverSpy).toHaveBeenCalledWith('test', { size: 24 });
    });

    it('should merge library default options with provided options', () => {
      const resolverSpy = jest.fn((_name, _options) => `<svg></svg>`);
      const library: IconLibrary = {
        name: 'custom-lib',
        resolver: resolverSpy,
        defaultOptions: { size: 24, color: 'red' }
      };

      service.registerLibrary(library);
      service.resolveIcon('custom-lib:test', { size: 48 });

      expect(resolverSpy).toHaveBeenCalledWith('test', { size: 48, color: 'red' });
    });
  });

  describe('resolveIcon', () => {
    it('should prioritize sprite icons when sprite is loaded', () => {
      mockSpriteLoader.isSpriteLoaded = jest.fn<boolean, []>().mockReturnValue(true);
      mockSpriteLoader.getIconUrl = jest.fn<string | null, [string]>().mockReturnValue('#icon-home');

      service.registerIcon('home', '<svg>custom</svg>');

      const result = service.resolveIcon('home');

      expect(result?.source).toBe('sprite');
      expect(result?.spriteUrl).toBe('#icon-home');
    });

    it('should resolve custom icon when sprite is not loaded', () => {
      mockSpriteLoader.isSpriteLoaded = jest.fn<boolean, []>().mockReturnValue(false);

      service.registerIcon('home', '<svg>custom</svg>');

      const result = service.resolveIcon('home');

      expect(result?.source).toBe('svg');
    });

    it('should handle library prefix format', () => {
      const library: IconLibrary = {
        name: 'heroicons',
        resolver: (name) => `<svg>${name}</svg>`
      };

      service.registerLibrary(library);

      const result = service.resolveIcon('heroicons:user-circle');

      expect(result?.source).toBe('svg');
    });

    it('should return null for non-existent icon', () => {
      const result = service.resolveIcon('non-existent');

      expect(result).toBeNull();
    });

    it('should handle HTMLElement result from resolver', () => {
      const mockElement = document.createElement('svg');
      mockElement.innerHTML = '<path d="M10 10"/>';

      const library: IconLibrary = {
        name: 'element-lib',
        resolver: () => mockElement
      };

      service.registerLibrary(library);

      const result = service.resolveIcon('element-lib:test');

      expect(result?.source).toBe('svg');
      expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(mockElement.outerHTML);
    });

    it('should return null when library resolver returns null', () => {
      const library: IconLibrary = {
        name: 'null-lib',
        resolver: () => null
      };

      service.registerLibrary(library);

      const result = service.resolveIcon('null-lib:test');

      expect(result).toBeNull();
    });

    it('should warn and return null for unregistered library', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = service.resolveIcon('unregistered:icon');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Icon library 'unregistered' is not registered");

      consoleSpy.mockRestore();
    });

    it('should handle resolver errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const library: IconLibrary = {
        name: 'error-lib',
        resolver: () => {
          throw new Error('Test error');
        }
      };

      service.registerLibrary(library);

      const result = service.resolveIcon('error-lib:test');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to resolve icon 'error-lib:test':",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('hasIcon and hasLibrary', () => {
    it('should return false for non-existent icon', () => {
      expect(service.hasIcon('non-existent')).toBe(false);
    });

    it('should return false for non-existent library', () => {
      expect(service.hasLibrary('non-existent')).toBe(false);
    });
  });

  describe('getRegisteredIcons and getRegisteredLibraries', () => {
    it('should return list of registered icons', () => {
      service.registerIcon('icon1', '<svg/>');
      service.registerIcon('icon2', '<svg/>');

      const icons = service.getRegisteredIcons();

      expect(icons).toContain('icon1');
      expect(icons).toContain('icon2');
      expect(icons.length).toBe(2);
    });

    it('should return list of registered libraries', () => {
      service.registerLibrary({ name: 'lib1', resolver: () => '<svg/>' });
      service.registerLibrary({ name: 'lib2', resolver: () => '<svg/>' });

      const libraries = service.getRegisteredLibraries();

      expect(libraries).toContain('lib1');
      expect(libraries).toContain('lib2');
      expect(libraries.length).toBe(2);
    });
  });

  describe('unregisterIcon and unregisterLibrary', () => {
    it('should unregister an icon', () => {
      service.registerIcon('test', '<svg/>');
      expect(service.hasIcon('test')).toBe(true);

      service.unregisterIcon('test');

      expect(service.hasIcon('test')).toBe(false);
    });

    it('should unregister a library', () => {
      service.registerLibrary({ name: 'test', resolver: () => '<svg/>' });
      expect(service.hasLibrary('test')).toBe(true);

      service.unregisterLibrary('test');

      expect(service.hasLibrary('test')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all icons and libraries', () => {
      service.registerIcon('icon1', '<svg/>');
      service.registerLibrary({ name: 'lib1', resolver: () => '<svg/>' });

      service.clear();

      expect(service.getRegisteredIcons()).toEqual([]);
      expect(service.getRegisteredLibraries()).toEqual([]);
    });
  });

  describe('getSpriteLoader', () => {
    it('should return the sprite loader service', () => {
      const loader = service.getSpriteLoader();

      expect(loader).toBe(mockSpriteLoader);
    });
  });
});
