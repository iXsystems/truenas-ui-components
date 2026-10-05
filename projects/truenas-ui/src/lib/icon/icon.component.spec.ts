import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnIconRegistryService } from './icon-registry.service';
import { TnIconTesting } from './icon-testing';
import { TnIconComponent } from './icon.component';
import type { SpriteConfig } from './sprite-loader.service';
import { defaultSpriteConfigPath, TnSpriteLoaderService } from './sprite-loader.service';

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

  it('should resolve custom library icon with app- prefix', async () => {
    iconRegistry.resolveIcon.mockImplementation((name: string) => {
      if (name.startsWith('app-')) {
        return { source: 'sprite', content: '', spriteUrl: `#icon-${name}` };
      }
      return null;
    });

    fixture.componentRef.setInput('name', 'hdd');
    fixture.componentRef.setInput('library', 'custom');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('app-hdd', expect.any(Object));
    expect(component.iconResult().source).toBe('sprite');
  });

  it('should not double-prefix custom icons already starting with app-', async () => {
    iconRegistry.resolveIcon.mockImplementation((name: string) => {
      if (name === 'app-hdd') {
        return { source: 'sprite', content: '', spriteUrl: '#icon-app-hdd' };
      }
      return null;
    });

    fixture.componentRef.setInput('name', 'app-hdd');
    fixture.componentRef.setInput('library', 'custom');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(iconRegistry.resolveIcon).toHaveBeenCalledWith('app-hdd', expect.any(Object));
  });

  it('should handle library parameter with fallback', async () => {
    spriteLoader.getIconUrl.mockReturnValue(null);
    iconRegistry.resolveIcon.mockReturnValue(null);
    // Falling back silently would leave a developer with a two-letter
    // abbreviation and no way to find out why, so the warning naming the icon
    // is as much the behaviour here as the fallback itself.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture.componentRef.setInput('name', 'unknown-icon');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    // Icon should fall back to text abbreviation when sprite and registry don't resolve
    expect(component.iconResult().source).toBe('text');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Icon 'mdi-unknown-icon' not found in sprite")
    );

    warn.mockRestore();
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
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture.componentRef.setInput('name', 'nonexistent');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('text');
    expect(component.iconResult().content).toContain('MN');
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Icon 'mdi-nonexistent' not found in sprite")
    );

    warn.mockRestore();
  });

  it('should fallback to text for missing icons', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    fixture.componentRef.setInput('name', 'missing');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.iconResult().source).toBe('text');
    expect(component.iconResult().content).toBeTruthy();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Icon 'mdi-missing' not found in sprite")
    );

    warn.mockRestore();
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

  it('should set host width and height to 100% when fullSize=true', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.style.width).toBe('100%');
    expect(hostEl.style.height).toBe('100%');
  });

  it('should relax host min-width/min-height to 0 when fullSize=true', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.style.minWidth).toBe('0');
    expect(hostEl.style.minHeight).toBe('0');
  });

  it('should not set inline width/height when fullSize=false', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', false);
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.style.width).toBe('');
    expect(hostEl.style.height).toBe('');
    expect(hostEl.style.minWidth).toBe('');
    expect(hostEl.style.minHeight).toBe('');
  });
});

describe('TnIconComponent - Custom Size', () => {
  let fixture: ComponentFixture<TnIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [TnIconTesting.jest.providers()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnIconComponent);
  });

  it('should set host inline width, height, and font-size from customSize', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('customSize', '48px');
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.style.width).toBe('48px');
    expect(hostEl.style.height).toBe('48px');
    expect(hostEl.style.minWidth).toBe('48px');
    expect(hostEl.style.minHeight).toBe('48px');
    expect(hostEl.style.fontSize).toBe('48px');
  });

  it('should override fullSize when both are set', async () => {
    fixture.componentRef.setInput('name', 'test');
    fixture.componentRef.setInput('fullSize', true);
    fixture.componentRef.setInput('customSize', '48px');
    fixture.detectChanges();
    await fixture.whenStable();

    const hostEl = fixture.nativeElement as HTMLElement;
    expect(hostEl.style.width).toBe('48px');
    expect(hostEl.style.height).toBe('48px');
  });
});

/**
 * The real registry and the real sprite loader, with the sprite config answered
 * by the spec rather than stubbed away (#341).
 *
 * Resolution gates on `TnSpriteLoaderService.isSpriteLoaded()`, which is false
 * until a fire-and-forget fetch from the loader's own constructor lands — so an
 * icon created in the same tick as the app resolves before the sprite exists and
 * takes the text-abbreviation fallback. These cover that it does not STAY there,
 * which is what the loaded state being reactive buys.
 */
describe('TnIconComponent - a sprite that lands after the first render', () => {
  const config: SpriteConfig = {
    iconUrl: 'assets/tn-icons/sprite.svg?v=abc123',
    icons: ['mdi-star'],
  };

  let fixture: ComponentFixture<TnIconComponent>;
  let httpMock: HttpTestingController;
  let loader: TnSpriteLoaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    // Creating the component injects the registry, which injects the loader,
    // which fires the request — so the request is pending from here on, and
    // every render below happens with the sprite unloaded unless a test lands
    // it. Nothing is flushed in this hook, deliberately.
    fixture = TestBed.createComponent(TnIconComponent);
    loader = TestBed.inject(TnSpriteLoaderService);
  });

  /** First render, with the sprite config still in flight. */
  async function renderWithSpriteInFlight(name: string): Promise<void> {
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  /** Answer the loader's pending request, then let the view catch up. */
  async function landSprite(): Promise<void> {
    httpMock.expectOne(defaultSpriteConfigPath).flush(config);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function spriteHref(): string | null | undefined {
    return (fixture.nativeElement as HTMLElement)
      .querySelector('svg.tn-icon__sprite use')
      ?.getAttribute('href');
  }

  function abbreviation(): string | undefined {
    return (fixture.nativeElement as HTMLElement)
      .querySelector('span.tn-icon__text')
      ?.textContent?.trim();
  }

  it('renders the text abbreviation while the config is still in flight', async () => {
    await renderWithSpriteInFlight('mdi-star');

    // Matched but not flushed: the state under test is a request that has not
    // answered yet. Matching it is also what keeps `verify()` below quiet.
    httpMock.expectOne(defaultSpriteConfigPath);

    expect(loader.isSpriteLoaded()).toBe(false);
    expect(abbreviation()).toBe('MS');
    expect(spriteHref()).toBeUndefined();
  });

  it('re-resolves to the sprite glyph once the config lands', async () => {
    await renderWithSpriteInFlight('mdi-star');
    expect(abbreviation()).toBe('MS');

    await landSprite();

    expect(loader.isSpriteLoaded()).toBe(true);
    expect(spriteHref()).toBe(`${config.iconUrl}#mdi-star`);
    expect(abbreviation()).toBeUndefined();
  });

  it('keeps the text fallback, and warns once, for a name the sprite does not have', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    // Unique to this spec: `warnMissingSpriteIcon` deduplicates per icon name
    // in a static set that outlives a TestBed, so a name another spec in this
    // file renders would already be marked as warned.
    await renderWithSpriteInFlight('mdi-absent-from-this-sprite');

    // Nothing to warn about yet — an unloaded sprite cannot say an icon is
    // missing from it.
    expect(warn).not.toHaveBeenCalled();

    await landSprite();

    expect(abbreviation()).toBe('MA');
    expect(spriteHref()).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(
      "Icon 'mdi-absent-from-this-sprite' not found in sprite"
    );

    warn.mockRestore();
  });

  afterEach(() => httpMock.verify());
});
