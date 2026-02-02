import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnIconRegistryService } from './icon-registry.service';
import { TnIconTesting } from './icon-testing';
import { TnIconComponent } from './icon.component';
import { TnSpriteLoaderService } from './sprite-loader.service';

describe('TnIconComponent - MDI Support', () => {
  let component: TnIconComponent;
  let fixture: ComponentFixture<TnIconComponent>;
  let iconRegistry: jest.Mocked<TnIconRegistryService>;
  let spriteLoader: jest.Mocked<TnSpriteLoaderService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [
        TnIconTesting.jest.providers({
          iconRegistry: {
            resolveIcon: jest.fn().mockImplementation((name: string) => {
              // Return sprite result only for MDI icons with URLs
              if (name.startsWith('mdi-')) {
                const loader = TestBed.inject(TnSpriteLoaderService) as jest.Mocked<TnSpriteLoaderService>;
                const url = loader.getIconUrl(name);
                if (url) {
                  return { source: 'sprite', content: '', spriteUrl: url };
                }
              }
              return null;
            }),
          },
        }),
      ],
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

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('settings', expect.any(Object));
  });

  it('should render MDI icon when library="mdi"', async () => {
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');

    fixture.componentRef.setInput('name', 'harddisk');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('sprite');
  });

  it('should maintain backward compatibility', async () => {
    fixture.componentRef.setInput('name', 'delete');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('delete', expect.any(Object));
  });

  it('should handle library parameter with fallback', async () => {
    spriteLoader.getIconUrl.mockReturnValue(null);
    iconRegistry.resolveIcon.mockReturnValue(null);

    fixture.componentRef.setInput('name', 'unknown-icon');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Icon should fall back to text abbreviation when sprite and registry don't resolve
    expect(component.iconResult().source).toBe('text');
  });
});

describe('TnIconComponent - Error Handling', () => {
  let component: TnIconComponent;
  let fixture: ComponentFixture<TnIconComponent>;
  let iconRegistry: jest.Mocked<TnIconRegistryService>;
  let spriteLoader: jest.Mocked<TnSpriteLoaderService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [
        TnIconTesting.jest.providers({
          iconRegistry: {
            resolveIcon: jest.fn().mockReturnValue(null),
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TnIconComponent);
    component = fixture.componentInstance;
    iconRegistry = TestBed.inject(TnIconRegistryService) as jest.Mocked<TnIconRegistryService>;
    spriteLoader = TestBed.inject(TnSpriteLoaderService) as jest.Mocked<TnSpriteLoaderService>;
  });

  it('should show fallback for unregistered MDI icon', async () => {
    fixture.componentRef.setInput('name', 'nonexistent');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('text');
    expect(component.iconResult().content).toContain('MN');
  });

  it('should fallback to text for missing icons', async () => {
    fixture.componentRef.setInput('name', 'missing');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('text');
    expect(component.iconResult().content).toBeTruthy();
  });

  it('should handle async MDI loading gracefully', async () => {
    spriteLoader.getIconUrl.mockReturnValue('#icon-mdi-harddisk');
    iconRegistry.resolveIcon.mockReturnValue({
      source: 'sprite',
      content: '',
      spriteUrl: '#icon-mdi-harddisk',
    });

    fixture.componentRef.setInput('name', 'harddisk');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('sprite');
  });
});

describe('TnIconComponent - Full Size', () => {
  let component: TnIconComponent;
  let fixture: ComponentFixture<TnIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnIconComponent);
    component = fixture.componentInstance;
  });

  it('should default to fullSize=false', () => {
    fixture.detectChanges();
    expect(component.fullSize()).toBe(false);
  });

  it('should set fullSize attribute on host when fullSize=true', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('full-size')).toBe('true');
  });

  it('should not set fullSize attribute when fullSize=false', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.getAttribute('full-size')).toBeNull();
  });

  it('should apply tn-icon--full class when fullSize=true', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const iconDiv = fixture.nativeElement.querySelector('.tn-icon');
    expect(iconDiv.classList.contains('tn-icon--full')).toBe(true);
    expect(iconDiv.classList.contains('tn-icon--md')).toBe(false);
  });

  it('should apply size class when fullSize=false', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', false);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    await fixture.whenStable();

    const iconDiv = fixture.nativeElement.querySelector('.tn-icon');
    expect(iconDiv.classList.contains('tn-icon--lg')).toBe(true);
    expect(iconDiv.classList.contains('tn-icon--full')).toBe(false);
  });
});
