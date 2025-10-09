import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import { IxIconComponent } from './ix-icon.component';
import { IxIconRegistryService } from './ix-icon-registry.service';
import { IxMdiIconService } from '../ix-mdi-icon/ix-mdi-icon.service';

describe('IxIconComponent - MDI Support', () => {
  let component: IxIconComponent;
  let fixture: ComponentFixture<IxIconComponent>;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let mdiIconService: jest.Mocked<IxMdiIconService>;
  let domSanitizer: jest.Mocked<DomSanitizer>;

  beforeEach(async () => {
    const iconRegistrySpy = {
      resolveIcon: jest.fn()
    } as jest.Mocked<Partial<IxIconRegistryService>>;

    const mdiIconServiceSpy = {
      ensureIconLoaded: jest.fn()
    } as jest.Mocked<Partial<IxMdiIconService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn()
    } as jest.Mocked<Partial<DomSanitizer>>;

    await TestBed.configureTestingModule({
      imports: [IxIconComponent],
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: IxMdiIconService, useValue: mdiIconServiceSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IxIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    mdiIconService = TestBed.inject(IxMdiIconService) as jest.Mocked<IxMdiIconService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jest.Mocked<DomSanitizer>;
  });

  it('should render material icon by default', () => {
    component.name = 'settings';
    fixture.detectChanges();

    // Since we don't have Angular Material, we'll test for the fallback behavior
    // The component should use the existing icon registry resolution
    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('settings', expect.any(Object));
  });

  it('should render MDI icon when library="mdi"', async () => {
    // First call returns null (not found), second call after ensureIconLoaded returns the icon
    iconRegistry.resolveIcon
      .mockReturnValueOnce(null) // First call - not found
      .mockReturnValueOnce({     // Second call - found after loading
        source: 'svg',
        content: 'mock-svg-content' as any
      });
    mdiIconService.ensureIconLoaded.mockResolvedValue(true);

    component.name = 'harddisk';
    component.library = 'mdi';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('mdi:harddisk', expect.any(Object));
    expect(mdiIconService.ensureIconLoaded).toHaveBeenCalledWith('harddisk');
    expect(iconRegistry.resolveIcon).toHaveBeenCalledTimes(2); // Called twice
  });

  it('should maintain backward compatibility', () => {
    component.name = 'delete';
    // No library specified - should default to existing behavior
    fixture.detectChanges();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('delete', expect.any(Object));
    expect(mdiIconService.ensureIconLoaded).not.toHaveBeenCalled();
  });

  it('should handle library parameter with fallback', () => {
    iconRegistry.resolveIcon.mockReturnValue(null); // Icon not found

    component.name = 'unknown-icon';
    component.library = 'mdi';
    fixture.detectChanges();

    // Should still call the registry with the mdi: prefix
    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('mdi:unknown-icon', expect.any(Object));
  });
});

describe('IxIconComponent - Error Handling', () => {
  let component: IxIconComponent;
  let fixture: ComponentFixture<IxIconComponent>;
  let iconRegistry: jest.Mocked<IxIconRegistryService>;
  let mdiIconService: jest.Mocked<IxMdiIconService>;

  beforeEach(async () => {
    const iconRegistrySpy = {
      resolveIcon: jest.fn()
    } as jest.Mocked<Partial<IxIconRegistryService>>;

    const mdiIconServiceSpy = {
      ensureIconLoaded: jest.fn()
    } as jest.Mocked<Partial<IxMdiIconService>>;

    const domSanitizerSpy = {
      bypassSecurityTrustHtml: jest.fn()
    } as jest.Mocked<Partial<DomSanitizer>>;

    await TestBed.configureTestingModule({
      imports: [IxIconComponent],
      providers: [
        { provide: IxIconRegistryService, useValue: iconRegistrySpy },
        { provide: IxMdiIconService, useValue: mdiIconServiceSpy },
        { provide: DomSanitizer, useValue: domSanitizerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IxIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(IxIconRegistryService) as jest.Mocked<IxIconRegistryService>;
    mdiIconService = TestBed.inject(IxMdiIconService) as jest.Mocked<IxMdiIconService>;
  });

  it('should show fallback for unregistered MDI icon', async () => {
    mdiIconService.ensureIconLoaded.mockResolvedValue(false); // Icon not in catalog
    iconRegistry.resolveIcon.mockReturnValue(null); // Not found in registry

    component.name = 'nonexistent';
    component.library = 'mdi';
    fixture.detectChanges();
    await fixture.whenStable();

    // Should fall back to text abbreviation
    expect(component.iconResult.source).toBe('text');
    expect(component.iconResult.content).toContain('NO'); // First 2 characters of 'nonexistent'
  });

  it('should emit warning for missing icons in development', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mdiIconService.ensureIconLoaded.mockResolvedValue(false);
    iconRegistry.resolveIcon.mockReturnValue(null);

    component.name = 'missing';
    component.library = 'mdi';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Icon "missing" not found in MDI library')
    );

    consoleSpy.mockRestore();
  });

  it('should handle async MDI loading gracefully', async () => {
    mdiIconService.ensureIconLoaded.mockResolvedValue(true);
    iconRegistry.resolveIcon.mockReturnValue({
      source: 'svg',
      content: 'loaded-svg' as any
    });

    component.name = 'harddisk';
    component.library = 'mdi';
    fixture.detectChanges();

    // Should show loading state initially, then resolve
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.iconResult.source).toBe('svg');
  });
});