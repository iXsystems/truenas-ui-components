import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, THEME_STORAGE_KEY, TN_THEME_DEFINITIONS } from './theme.constants';
import { TnTheme } from './theme.interface';
import { TnThemeService } from './theme.service';

describe('TnThemeService', () => {
  let service: TnThemeService;
  let localStorageMock: { [key: string]: string };

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

  beforeEach(() => {
    setupLocalStorageMock();

    TestBed.configureTestingModule({
      providers: [TnThemeService]
    });

    service = TestBed.inject(TnThemeService);
  });

  afterEach(() => {
    // Clean up DOM classes after each test
    TN_THEME_DEFINITIONS.forEach((theme) => {
      document.documentElement.classList.remove(theme.className);
    });
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default theme', () => {
      expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should expose availableThemes array', () => {
      expect(service.availableThemes).toBe(TN_THEME_DEFINITIONS);
      expect(service.availableThemes.length).toBe(8);
    });
  });

  describe('Theme Initialization', () => {
    it('should use default theme when localStorage is empty', () => {
      const currentTheme = service.currentTheme();
      expect(currentTheme?.name).toBe(DEFAULT_THEME);
    });

    it('should restore theme from localStorage if available', () => {
      // Set up localStorage before creating service
      localStorageMock[THEME_STORAGE_KEY] = TnTheme.Dracula;

      // Reset and reconfigure TestBed with new localStorage state
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TnThemeService]
      });

      const newService = TestBed.inject(TnThemeService);

      expect(newService.getCurrentTheme()).toBe(TnTheme.Dracula);
    });

    it('should use default theme if localStorage contains invalid theme', () => {
      // Set up localStorage with invalid theme before creating service
      localStorageMock[THEME_STORAGE_KEY] = 'invalid-theme';

      // Reset and reconfigure TestBed with new localStorage state
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TnThemeService]
      });

      const newService = TestBed.inject(TnThemeService);

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
      expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should persist theme to localStorage', (done) => {
      service.setTheme(TnTheme.SolarizedDark);

      // Effects run asynchronously, wait for next tick
      setTimeout(() => {
        expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.SolarizedDark);
        done();
      }, 0);
    });

    it('should apply CSS class to document root', (done) => {
      service.setTheme(TnTheme.Midnight);

      // Effects run asynchronously, wait for next tick
      setTimeout(() => {
        const root = document.documentElement;
        expect(root.classList.contains('tn-midnight')).toBe(true);
        done();
      }, 0);
    });

    it('should remove previous theme class when switching themes', (done) => {
      service.setTheme(TnTheme.Dracula);

      setTimeout(() => {
        service.setTheme(TnTheme.Nord);

        setTimeout(() => {
          const root = document.documentElement;
          expect(root.classList.contains('tn-dracula')).toBe(false);
          expect(root.classList.contains('tn-nord')).toBe(true);
          done();
        }, 0);
      }, 0);
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
    it('should reset theme to default', () => {
      service.setTheme(TnTheme.Dracula);
      service.resetToDefault();

      expect(service.getCurrentTheme()).toBe(DEFAULT_THEME);
    });

    it('should persist default theme to localStorage', (done) => {
      service.setTheme(TnTheme.Nord);

      setTimeout(() => {
        service.resetToDefault();

        setTimeout(() => {
          expect(localStorageMock[THEME_STORAGE_KEY]).toBe(DEFAULT_THEME);
          done();
        }, 0);
      }, 0);
    });

    it('should apply default theme CSS class to DOM', (done) => {
      service.setTheme(TnTheme.Paper);

      setTimeout(() => {
        service.resetToDefault();

        setTimeout(() => {
          const root = document.documentElement;
          const defaultThemeClass = service.currentTheme()?.className;
          expect(root.classList.contains(defaultThemeClass!)).toBe(true);
          expect(root.classList.contains('tn-paper')).toBe(false);
          done();
        }, 0);
      }, 0);
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
    it('should save theme preference on every theme change', (done) => {
      service.setTheme(TnTheme.Blue);

      setTimeout(() => {
        expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Blue);

        service.setTheme(TnTheme.Nord);

        setTimeout(() => {
          expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Nord);

          service.setTheme(TnTheme.Paper);

          setTimeout(() => {
            expect(localStorageMock[THEME_STORAGE_KEY]).toBe(TnTheme.Paper);
            done();
          }, 10);
        }, 10);
      }, 10);
    });

    it('should handle localStorage errors gracefully', () => {
      // Override setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage is full');
      };

      // Should not throw
      expect(() => service.setTheme(TnTheme.Dracula)).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe('DOM Manipulation', () => {
    it('should apply only one theme class at a time', (done) => {
      service.setTheme(TnTheme.Dracula);

      setTimeout(() => {
        const root = document.documentElement;
        const appliedThemeClasses = TN_THEME_DEFINITIONS.filter((theme) =>
          root.classList.contains(theme.className)
        );

        expect(appliedThemeClasses.length).toBe(1);
        expect(appliedThemeClasses[0].className).toBe('tn-dracula');
        done();
      }, 0);
    });

    it('should clean up all theme classes before applying new one', (done) => {
      // Manually add multiple theme classes to simulate a dirty state
      document.documentElement.classList.add('tn-nord', 'tn-paper', 'tn-midnight');

      service.setTheme(TnTheme.HighContrast);

      setTimeout(() => {
        const root = document.documentElement;
        expect(root.classList.contains('tn-nord')).toBe(false);
        expect(root.classList.contains('tn-paper')).toBe(false);
        expect(root.classList.contains('tn-midnight')).toBe(false);
        expect(root.classList.contains('tn-high-contrast')).toBe(true);
        done();
      }, 0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', (done) => {
      service.setTheme(TnTheme.Dracula);
      service.setTheme(TnTheme.Nord);
      service.setTheme(TnTheme.Paper);
      service.setTheme(TnTheme.Midnight);

      setTimeout(() => {
        expect(service.getCurrentTheme()).toBe(TnTheme.Midnight);
        expect(service.currentThemeClass()).toBe('tn-midnight');
        done();
      }, 50);
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
