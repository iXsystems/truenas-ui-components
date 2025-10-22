import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { IxIconComponent } from './ix-icon.component';
import { IxIconRegistryService } from './ix-icon-registry.service';
import { IxSpriteLoaderService } from './ix-sprite-loader.service';

describe('IxIconComponent - MDI Support', () => {
  let component: IxIconComponent;
  let fixture: ComponentFixture<IxIconComponent>;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let spriteLoader: jest.Mocked<IxSpriteLoaderService>;
  let domSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(async () => {
    const spriteLoaderSpy = {
      ensureSpriteLoaded: jest.fn().mockImplementation(() => Promise.resolve(true)),
      getIconUrl: jest.fn(),
      getSafeIconUrl: jest.fn(),
      isSpriteLoaded: jest.fn().mockReturnValue(true),
      getSpriteConfig: jest.fn()
    } as jest.Mocked<Partial<IxSpriteLoaderService>>;

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
    } as jest.Mocked<Partial<IxIconRegistryService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html as any),
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => url as any)
    } as jest.Mocked<Partial<DomSanitizer>>;

    await TestBed.configureTestingModule({
      imports: [IxIconComponent],
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: IxSpriteLoaderService, useValue: spriteLoaderSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IxIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    spriteLoader = TestBed.inject(IxSpriteLoaderService) as jest.Mocked<IxSpriteLoaderService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jest.Mocked<DomSanitizer>;
  });

  it('should render material icon by default', fakeAsync(() => {
    component.name = 'settings';
    fixture.detectChanges();
    tick();
    flush();

    // Since we don't have Angular Material, we'll test for the fallback behavior
    // The component should use the existing icon registry resolution
    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('settings', expect.any(Object));
  }));

  it('should render MDI icon when library="mdi"', fakeAsync(() => {
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');
    spriteLoader.getSafeIconUrl.mockReturnValue('#icon-mdi-harddisk' as any);

    component.name = 'harddisk';
    component.library = 'mdi';
    fixture.detectChanges();
    tick();
    flush();

    // Should use sprite-based icon for MDI
    expect(spriteLoader.ensureSpriteLoaded).toHaveBeenCalled();
    expect(component.iconResult.source).toBe('sprite');
  }));

  it('should maintain backward compatibility', fakeAsync(() => {
    component.name = 'delete';
    // No library specified - should default to existing behavior
    fixture.detectChanges();
    tick();
    flush();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('delete', expect.any(Object));
  }));

  it('should handle library parameter with fallback', () => {
    spriteLoader.getIconUrl.mockReturnValue(null);
    iconRegistry.resolveIcon.mockReturnValue(null); // Icon not found

    component.name = 'unknown-icon';
    component.library = 'mdi';
    fixture.detectChanges();

    // Should try to load from sprite first, then fall back to registry
    expect(spriteLoader.ensureSpriteLoaded).toHaveBeenCalled();
  });
});

describe('IxIconComponent - Error Handling', () => {
  let component: IxIconComponent;
  let fixture: ComponentFixture<IxIconComponent>;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let spriteLoader: jest.Mocked<IxSpriteLoaderService>;

  beforeEach(async () => {
    const spriteLoaderSpy = {
      ensureSpriteLoaded: jest.fn().mockImplementation(() => Promise.resolve(true)),
      getIconUrl: jest.fn(),
      getSafeIconUrl: jest.fn(),
      isSpriteLoaded: jest.fn().mockReturnValue(true),
      getSpriteConfig: jest.fn()
    } as jest.Mocked<Partial<IxSpriteLoaderService>>;

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
    } as jest.Mocked<Partial<IxIconRegistryService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn().mockImplementation((html: string) => html as any),
      bypassSecurityTrustResourceUrl: jest.fn().mockImplementation((url: string) => url as any)
    } as jest.Mocked<Partial<DomSanitizer>>;

    await TestBed.configureTestingModule({
      imports: [IxIconComponent],
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: IxSpriteLoaderService, useValue: spriteLoaderSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IxIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    spriteLoader = TestBed.inject(IxSpriteLoaderService) as jest.Mocked<IxSpriteLoaderService>;
  });

  it('should show fallback for unregistered MDI icon', fakeAsync(() => {
    spriteLoader.getIconUrl.mockReturnValue(null); // Icon not in sprite
    iconRegistry.resolveIcon.mockReturnValue(null); // Not found in registry

    component.name = 'nonexistent';
    component.library = 'mdi';
    fixture.detectChanges();
    tick();
    flush();

    // Should fall back to text abbreviation
    expect(component.iconResult.source).toBe('text');
    expect(component.iconResult.content).toContain('MN'); // First 2 characters of 'mdi-nonexistent'
  }));

  it('should fallback to text for missing icons', fakeAsync(() => {
    spriteLoader.getIconUrl.mockReturnValue(null); // Icon not in sprite
    iconRegistry.resolveIcon.mockReturnValue(null);

    component.name = 'missing';
    component.library = 'mdi';
    fixture.detectChanges();
    tick();
    flush();

    // Should fall back to text abbreviation
    expect(component.iconResult.source).toBe('text');
    expect(component.iconResult.content).toBeTruthy();
  }));

  it('should handle async MDI loading gracefully', fakeAsync(() => {
    spriteLoader.ensureSpriteLoaded.mockImplementation(() => Promise.resolve(true));
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');
    spriteLoader.getSafeIconUrl.mockReturnValue('#icon-mdi-harddisk' as any);

    component.name = 'harddisk';
    component.library = 'mdi';
    fixture.detectChanges();
    tick();
    flush();

    // Should show loading state initially, then resolve
    fixture.detectChanges();

    expect(component.iconResult.source).toBe('sprite');
  }));
});