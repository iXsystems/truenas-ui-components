import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, LIGHT_THEME, THEME_STORAGE_KEY, TN_THEME_DEFINITIONS } from './theme.constants';
import { TnTheme } from './theme.interface';
import { TnThemeService } from './theme.service';

describe('TnThemeService', () => {
  let service: TnThemeService;
  let localStorageMock: { [key: string]: string };
  let matchMediaListeners: Map<string, ((event: MediaQueryListEvent) => void)[]>;
  let prefersDarkMatch: boolean;

  const setupLocalStorageMock = () => {
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        },
      },
      writable: true,
    });
  };

  const setupMatchMediaMock = () => {
    matchMediaListeners = new Map();
    prefersDarkMatch = true;

    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? prefersDarkMatch : false,
        media: query,
        addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
          const listeners = matchMediaListeners.get(query) ?? [];
          listeners.push(listener);
          matchMediaListeners.set(query, listeners);
        },
        removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
          const listeners = matchMediaListeners.get(query) ?? [];
          matchMediaListeners.set(query, listeners.filter((l) => l !== listener));
        },
      }),
      writable: true,
    });
  };

  const fireColorSchemeChange = (prefersDark: boolean) => {
    const listeners = matchMediaListeners.get('(prefers-color-scheme: dark)') ?? [];
    listeners.forEach((listener) => {
      listener({ matches: prefersDark } as MediaQueryListEvent);
    });
  };

  const createService = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [TnThemeService],
    });
    return TestBed.inject(TnThemeService);
  };

  beforeEach(() => {
    setupLocalStorageMock();
    setupMatchMediaMock();

    TestBed.configureTestingModule({
      providers: [TnThemeService],
    });

    service = TestBed.inject(TnThemeService);
  });

  afterEach(() => {
    TN_THEME_DEFINITIONS.forEach((theme) => {
      document.documentElement.classList.remove(theme.className);
    });
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default theme when OS prefers dark', () => {
      expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should expose availableThemes array', () => {
      expect(service.availableThemes).toBe(TN_THEME_DEFINITIONS);
      expect(service.availableThemes.length).toBe(8);
    });
  });

  describe('Theme Initialization', () => {
    it('should use dark theme when OS prefers dark and localStorage is empty', () => {
      prefersDarkMatch = true;
      const newService = createService();
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);
      expect(newService.isUsingSystemTheme()).toBe(true);
    });

    it('should use light theme when OS prefers light and localStorage is empty', () => {
      prefersDarkMatch = false;
      const newService = createService();
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);
      expect(newService.isUsingSystemTheme()).toBe(true);
    });

    it('should restore theme from localStorage if available', () => {
      localStorageMock[THEME_STORAGE_KEY] = TnTheme.Dracula;
      const newService = createService();

      expect(newService.getCurrentTheme()).toBe(TnTheme.Dracula);
      expect(newService.isUsingSystemTheme()).toBe(false);
    });

    it('should use OS preference if localStorage contains invalid theme', () => {
      localStorageMock[THEME_STORAGE_KEY] = 'invalid-theme';
      prefersDarkMatch = false;
      const newService = createService();

      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);
      expect(newService.isUsingSystemTheme()).toBe(true);
    });

    it('should not persist OS-detected theme to localStorage', () => {
      prefersDarkMatch = true;
      const newService = createService();

      expect(newService.isUsingSystemTheme()).toBe(true);
      TestBed.flushEffects();
      expect(localStorageMock[THEME_STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('OS Color Scheme Changes', () => {
    it('should follow OS changes when no user preference is set', () => {
      prefersDarkMatch = true;
      const newService = createService();
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);

      fireColorSchemeChange(false);
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);

      fireColorSchemeChange(true);
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should ignore OS changes after user explicitly sets a theme', () => {
      prefersDarkMatch = true;
      const newService = createService();
      expect(newService.isUsingSystemTheme()).toBe(true);

      newService.setTheme(TnTheme.Dracula);
      expect(newService.isUsingSystemTheme()).toBe(false);

      fireColorSchemeChange(false);
      expect(newService.getCurrentTheme()).toBe(TnTheme.Dracula);
    });

    it('should resume following OS changes after clearPreference()', () => {
      prefersDarkMatch = true;
      const newService = createService();

      newService.setTheme(TnTheme.Nord);
      expect(newService.isUsingSystemTheme()).toBe(false);

      newService.clearPreference();
      expect(newService.isUsingSystemTheme()).toBe(true);
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);

      fireColorSchemeChange(false);
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);
    });

    it('should follow OS changes after clearPreference() when service started with stored theme', () => {
      prefersDarkMatch = true;
      localStorageMock[THEME_STORAGE_KEY] = TnTheme.Dracula;
      const newService = createService();

      expect(newService.getCurrentTheme()).toBe(TnTheme.Dracula);
      expect(newService.isUsingSystemTheme()).toBe(false);

      newService.clearPreference();
      expect(newService.isUsingSystemTheme()).toBe(true);
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);

      fireColorSchemeChange(false);
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);

      fireColorSchemeChange(true);
      expect(newService.getCurrentTheme()).toBe(DEFAULT_THEME);
    });
  });

  describe('setTheme()', () => {
    it('should set a valid theme', () => {
      const result = service.setTheme(TnTheme.Dracula);

      expect(result).toBe(true);
      expect(service.getCurrentTheme()).toBe(TnTheme.Dracula);
    });

    it('should update currentTheme signal', () => {
      service.setTheme(TnTheme.Nord);

      const currentTheme = service.currentTheme();
      expect(currentTheme?.name).toBe(TnTheme.Nord);
      expect(currentTheme?.label).toBe('Nord');
      expect(currentTheme?.className).toBe('tn-nord');
    });

    it('should update currentThemeClass signal', () => {
      service.setTheme(TnTheme.Paper);

      expect(service.currentThemeClass()).toBe('tn-paper');
    });

    it('should return false for invalid theme', () => {
      const result = service.setTheme('non-existent-theme' as TnTheme);

      expect(result).toBe(false);
    });

    it('should mark theme as user-selected', () => {
      expect(service.isUsingSystemTheme()).toBe(true);

      service.setTheme(TnTheme.SolarizedDark);

      expect(service.isUsingSystemTheme()).toBe(false);
    });

    it('should persist theme to localStorage', () => {
      service.setTheme(TnTheme.SolarizedDark);
      TestBed.flushEffects();

      expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.SolarizedDark);
    });

    it('should apply CSS class to document root', () => {
      service.setTheme(TnTheme.Midnight);
      TestBed.flushEffects();

      expect(document.documentElement.classList.contains('tn-midnight')).toBe(true);
    });

    it('should remove previous theme class when switching themes', () => {
      service.setTheme(TnTheme.Dracula);
      TestBed.flushEffects();

      service.setTheme(TnTheme.Nord);
      TestBed.flushEffects();

      const root = document.documentElement;
      expect(root.classList.contains('tn-dracula')).toBe(false);
      expect(root.classList.contains('tn-nord')).toBe(true);
    });

    it('should handle all 8 theme options', () => {
      const themes = [
        TnTheme.Dark,
        TnTheme.Blue,
        TnTheme.Dracula,
        TnTheme.Nord,
        TnTheme.Paper,
        TnTheme.SolarizedDark,
        TnTheme.Midnight,
        TnTheme.HighContrast,
      ];

      themes.forEach((theme) => {
        const result = service.setTheme(theme);
        expect(result).toBe(true);
        expect(service.getCurrentTheme()).toBe(theme);
      });
    });
  });

  describe('getCurrentTheme()', () => {
    it('should return the current theme enum value', () => {
      service.setTheme(TnTheme.HighContrast);

      expect(service.getCurrentTheme()).toBe(TnTheme.HighContrast);
    });

    it('should return reactive value', () => {
      const initialTheme = service.getCurrentTheme();
      service.setTheme(TnTheme.Blue);
      const updatedTheme = service.getCurrentTheme();

      expect(initialTheme).not.toBe(updatedTheme);
      expect(updatedTheme).toBe(TnTheme.Blue);
    });
  });

  describe('resetToDefault()', () => {
    it('should reset theme to OS-detected default', () => {
      service.setTheme(TnTheme.Dracula);
      service.resetToDefault();

      expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should clear localStorage and revert to OS detection', () => {
      service.setTheme(TnTheme.Nord);
      TestBed.flushEffects();
      expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Nord);

      service.resetToDefault();
      TestBed.flushEffects();

      expect(localStorageMock[THEME_STORAGE_KEY]).toBeUndefined();
      expect(service.isUsingSystemTheme()).toBe(true);
    });

    it('should apply default theme CSS class to DOM', () => {
      service.setTheme(TnTheme.Paper);
      TestBed.flushEffects();

      service.resetToDefault();
      TestBed.flushEffects();

      const root = document.documentElement;
      expect(root.classList.contains(service.currentTheme()!.className)).toBe(true);
      expect(root.classList.contains('tn-paper')).toBe(false);
    });
  });

  describe('clearPreference()', () => {
    it('should remove theme from localStorage', () => {
      service.setTheme(TnTheme.Dracula);
      TestBed.flushEffects();

      service.clearPreference();

      expect(localStorageMock[THEME_STORAGE_KEY]).toBeUndefined();
    });

    it('should revert to OS-detected theme', () => {
      prefersDarkMatch = false;
      const newService = createService();

      newService.setTheme(TnTheme.Midnight);
      expect(newService.getCurrentTheme()).toBe(TnTheme.Midnight);

      newService.clearPreference();
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);
    });

    it('should mark theme as system-detected', () => {
      service.setTheme(TnTheme.Nord);
      expect(service.isUsingSystemTheme()).toBe(false);

      service.clearPreference();
      expect(service.isUsingSystemTheme()).toBe(true);
    });
  });

  describe('hasTheme()', () => {
    it('should return true for valid themes', () => {
      expect(service.hasTheme(TnTheme.Dark)).toBe(true);
      expect(service.hasTheme(TnTheme.Dracula)).toBe(true);
      expect(service.hasTheme(TnTheme.Nord)).toBe(true);
    });

    it('should return false for invalid themes', () => {
      expect(service.hasTheme('fake-theme' as TnTheme)).toBe(false);
      expect(service.hasTheme('another-fake' as TnTheme)).toBe(false);
    });
  });

  describe('Signal Reactivity', () => {
    it('should provide reactive currentTheme signal', () => {
      const theme1 = service.currentTheme();
      service.setTheme(TnTheme.Midnight);
      const theme2 = service.currentTheme();

      expect(theme1?.name).not.toBe(theme2?.name);
      expect(theme2?.name).toBe(TnTheme.Midnight);
    });

    it('should provide reactive currentThemeClass signal', () => {
      const class1 = service.currentThemeClass();
      service.setTheme(TnTheme.HighContrast);
      const class2 = service.currentThemeClass();

      expect(class1).not.toBe(class2);
      expect(class2).toBe('tn-high-contrast');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save theme preference on every explicit theme change', () => {
      service.setTheme(TnTheme.Blue);
      TestBed.flushEffects();
      expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Blue);

      service.setTheme(TnTheme.Nord);
      TestBed.flushEffects();
      expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Nord);

      service.setTheme(TnTheme.Paper);
      TestBed.flushEffects();
      expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Paper);
    });

    it('should not persist OS-triggered theme changes', () => {
      prefersDarkMatch = true;
      const newService = createService();
      TestBed.flushEffects();

      expect(localStorageMock[THEME_STORAGE_KEY]).toBeUndefined();

      fireColorSchemeChange(false);
      TestBed.flushEffects();

      expect(localStorageMock[THEME_STORAGE_KEY]).toBeUndefined();
      expect(newService.getCurrentTheme()).toBe(LIGHT_THEME);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage is full');
      };

      expect(() => service.setTheme(TnTheme.Dracula)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('DOM Manipulation', () => {
    it('should apply only one theme class at a time', () => {
      service.setTheme(TnTheme.Dracula);
      TestBed.flushEffects();

      const root = document.documentElement;
      const appliedThemeClasses = TN_THEME_DEFINITIONS.filter((theme) =>
        root.classList.contains(theme.className)
      );

      expect(appliedThemeClasses.length).toBe(1);
      expect(appliedThemeClasses[0].className).toBe('tn-dracula');
    });

    it('should clean up all theme classes before applying new one', () => {
      document.documentElement.classList.add('tn-nord', 'tn-paper', 'tn-midnight');

      service.setTheme(TnTheme.HighContrast);
      TestBed.flushEffects();

      const root = document.documentElement;
      expect(root.classList.contains('tn-nord')).toBe(false);
      expect(root.classList.contains('tn-paper')).toBe(false);
      expect(root.classList.contains('tn-midnight')).toBe(false);
      expect(root.classList.contains('tn-high-contrast')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', () => {
      service.setTheme(TnTheme.Dracula);
      service.setTheme(TnTheme.Nord);
      service.setTheme(TnTheme.Paper);
      service.setTheme(TnTheme.Midnight);
      TestBed.flushEffects();

      expect(service.getCurrentTheme()).toBe(TnTheme.Midnight);
      expect(service.currentThemeClass()).toBe('tn-midnight');
    });

    it('should handle setting the same theme multiple times', () => {
      service.setTheme(TnTheme.Blue);
      const result1 = service.setTheme(TnTheme.Blue);
      const result2 = service.setTheme(TnTheme.Blue);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(service.getCurrentTheme()).toBe(TnTheme.Blue);
    });
  });

  describe('Console Warnings', () => {
    it('should warn when setting invalid theme', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      consoleSpy.mockImplementation(() => {});

      service.setTheme('invalid-theme' as TnTheme);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TnThemeService] Theme "invalid-theme" not found'),
        expect.any(Array)
      );

      consoleSpy.mockRestore();
    });
  });
});
