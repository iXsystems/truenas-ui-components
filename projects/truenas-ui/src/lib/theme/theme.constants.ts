import type { TnThemeDefinition } from './theme.interface';
import { TnTheme } from './theme.interface';

/**
 * Default theme used when no theme is set
 */
export const DEFAULT_THEME = TnTheme.Dark;

/**
 * localStorage key for storing the current theme name
 */
export const THEME_STORAGE_KEY = 'tn-theme';

/**
 * All available theme definitions in the TrueNAS UI Components library.
 * These themes correspond to CSS classes defined in themes.css
 */
export const TN_THEME_DEFINITIONS: readonly TnThemeDefinition[] = [
  {
    name: TnTheme.Dark,
    label: 'TN Dark',
    className: 'tn-dark',
    description: 'TrueNAS default dark theme',
  },
  {
    name: TnTheme.Blue,
    label: 'TN Blue',
    className: 'tn-blue',
    description: 'Official TrueNAS colors on light background',
  },
  {
    name: TnTheme.Dracula,
    label: 'Dracula',
    className: 'tn-dracula',
    description: 'Popular Dracula color scheme',
  },
  {
    name: TnTheme.Nord,
    label: 'Nord',
    className: 'tn-nord',
    description: 'Nord color palette inspired theme',
  },
  {
    name: TnTheme.Paper,
    label: 'Paper',
    className: 'tn-paper',
    description: 'FreeNAS 11.2 legacy theme',
  },
  {
    name: TnTheme.SolarizedDark,
    label: 'Solarized Dark',
    className: 'tn-solarized-dark',
    description: 'Solarized dark color scheme',
  },
  {
    name: TnTheme.Midnight,
    label: 'Midnight',
    className: 'tn-midnight',
    description: 'Dark theme with blues and greys',
  },
  {
    name: TnTheme.HighContrast,
    label: 'High Contrast',
    className: 'tn-high-contrast',
    description: 'High contrast theme for accessibility',
  },
] as const;

/**
 * Map of theme enum values to theme definition objects for quick lookup
 */
export const THEME_MAP = new Map<TnTheme, TnThemeDefinition>(
  TN_THEME_DEFINITIONS.map((theme) => [theme.name, theme])
);
