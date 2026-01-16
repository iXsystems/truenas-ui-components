import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TnIconRegistryService } from './icon-registry.service';
import { TnIconComponent } from './icon.component';
import { TnSpriteLoaderService } from './sprite-loader.service';

describe('TnIconComponent - MDI Support', () => {
  let component: TnIconComponent;
  let fixture: ComponentFixture<TnIconComponent>;
  let iconRegistry: jest.Mocked<TnIconRegistryService>;
  let spriteLoader: jest.Mocked<TnSpriteLoaderService>;

  beforeEach(async () => {
    const spriteLoaderSpy = {
      ensureSpriteLoaded: jest.fn().mockImplementation(() => Promise.resolve(true)),
      getIconUrl: jest.fn(),
      getSafeIconUrl: jest.fn(),
      isSpriteLoaded: jest.fn().mockReturnValue(true),
      getSpriteConfig: jest.fn()
    } as jest.Mocked<Partial<TnSpriteLoaderService>>;

    const iconRegistrySpy = {
      resolveIcon: jest.fn().mockImplementation((name: string) => {
        // Mock sprite icon resolution for MDI icons
        if (name.startsWith('mdi-') && spriteLoaderSpy.getIconUrl) {
          const url = spriteLoaderSpy.getIconUrl(name);
          if (url) {
            return {
              source: 'sprite',
              content: '',
              spriteUrl: url
            };
          }
        }
        return null;
      }),
      getSpriteLoader: jest.fn().mockReturnValue(spriteLoaderSpy)
    } as jest.Mocked<Partial<TnIconRegistryService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html),
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => url)
    } as unknown as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [
        { provide: TnIconRegistryService, useValue: iconRegistrySpy },
        { provide: TnSpriteLoaderService, useValue: spriteLoaderSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TnIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(TnIconRegistryService) as jest.Mocked<TnIconRegistryService>;
    spriteLoader = TestBed.inject(TnSpriteLoaderService) as jest.Mocked<TnSpriteLoaderService>;
  });

  it('should render material icon by default', async () => {
    fixture.componentRef.setInput('name', 'settings');
    fixture.detectChanges();
    await fixture.whenStable();

    // Since we don't have Angular Material, we'll test for the fallback behavior
    // The component should use the existing icon registry resolution
    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('settings', expect.any(Object));
  });

  it('should render MDI icon when library="mdi"', async () => {
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');
    spriteLoader.getSafeIconUrl.mockReturnValue('#icon-mdi-harddisk');

    fixture.componentRef.setInput('name', 'harddisk');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should use sprite-based icon for MDI
    expect(spriteLoader.ensureSpriteLoaded).toHaveBeenCalled();
    expect(component.iconResult.source).toBe('sprite');
  });

  it('should maintain backward compatibility', async () => {
    fixture.componentRef.setInput('name', 'delete');
    // No library specified - should default to existing behavior
    fixture.detectChanges();
    await fixture.whenStable();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('delete', expect.any(Object));
  });

  it('should handle library parameter with fallback', async () => {
    spriteLoader.getIconUrl.mockReturnValue(null);
    iconRegistry.resolveIcon.mockReturnValue(null); // Icon not found

    fixture.componentRef.setInput('name', 'unknown-icon');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should try to load from sprite first, then fall back to registry
    expect(spriteLoader.ensureSpriteLoaded).toHaveBeenCalled();
  });
});

describe('TnIconComponent - Error Handling', () => {
  let component: TnIconComponent;
  let fixture: ComponentFixture<TnIconComponent>;
  let iconRegistry: jest.Mocked<TnIconRegistryService>;
  let spriteLoader: jest.Mocked<TnSpriteLoaderService>;

  beforeEach(async () => {
    const spriteLoaderSpy = {
      ensureSpriteLoaded: jest.fn().mockImplementation(() => Promise.resolve(true)),
      getIconUrl: jest.fn(),
      getSafeIconUrl: jest.fn(),
      isSpriteLoaded: jest.fn().mockReturnValue(true),
      getSpriteConfig: jest.fn()
    } as jest.Mocked<Partial<TnSpriteLoaderService>>;

    const iconRegistrySpy = {
      resolveIcon: jest.fn().mockImplementation((name: string) => {
        // Mock sprite icon resolution for MDI icons
        if (name.startsWith('mdi-') && spriteLoaderSpy.getIconUrl) {
          const url = spriteLoaderSpy.getIconUrl(name);
          if (url) {
            return {
              source: 'sprite',
              content: '',
              spriteUrl: url
            };
          }
        }
        return null;
      }),
      getSpriteLoader: jest.fn().mockReturnValue(spriteLoaderSpy)
    } as jest.Mocked<Partial<TnIconRegistryService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html),
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => url)
    } as unknown as jest.Mocked<DomSanitizer>;

    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [
        { provide: TnIconRegistryService, useValue: iconRegistrySpy },
        { provide: TnSpriteLoaderService, useValue: spriteLoaderSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TnIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(TnIconRegistryService) as jest.Mocked<TnIconRegistryService>;
    spriteLoader = TestBed.inject(TnSpriteLoaderService) as jest.Mocked<TnSpriteLoaderService>;
  });

  it('should show fallback for unregistered MDI icon', async () => {
    spriteLoader.getIconUrl.mockReturnValue(null); // Icon not in sprite
    iconRegistry.resolveIcon.mockReturnValue(null); // Not found in registry

    fixture.componentRef.setInput('name', 'nonexistent');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should fall back to text abbreviation
    expect(component.iconResult.source).toBe('text');
    expect(component.iconResult.content).toContain('MN'); // First 2 characters of 'mdi-nonexistent'
  });

  it('should fallback to text for missing icons', async () => {
    spriteLoader.getIconUrl.mockReturnValue(null); // Icon not in sprite
    iconRegistry.resolveIcon.mockReturnValue(null);

    fixture.componentRef.setInput('name', 'missing');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should fall back to text abbreviation
    expect(component.iconResult.source).toBe('text');
    expect(component.iconResult.content).toBeTruthy();
  });

  it('should handle async MDI loading gracefully', async () => {
    spriteLoader.ensureSpriteLoaded.mockImplementation(() => Promise.resolve(true));
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');
    spriteLoader.getSafeIconUrl.mockReturnValue('#icon-mdi-harddisk');

    fixture.componentRef.setInput('name', 'harddisk');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Should show loading state initially, then resolve
    fixture.detectChanges();

    expect(component.iconResult.source).toBe('sprite');
  });
});
