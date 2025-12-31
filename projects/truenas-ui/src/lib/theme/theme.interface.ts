/**
 * Enum of available theme names.
 * Use these constants instead of hardcoded strings.
 *
 * @example
 * ```typescript
 * themeService.setTheme(TnTheme.Dracula);
 * ```
 */
export enum TnTheme {
  Dark = 'tn-dark',
  Blue = 'tn-blue',
  Dracula = 'tn-dracula',
  Nord = 'tn-nord',
  Paper = 'tn-paper',
  SolarizedDark = 'tn-solarized-dark',
  Midnight = 'tn-midnight',
  HighContrast = 'tn-high-contrast',
}

/**
 * Represents a theme definition/configuration.
 */
export interface TnThemeDefinition {
  /** Unique identifier/name for the theme (from TnTheme enum) */
  name: TnTheme;

  /** Human-readable display name */
  label: string;

  /** CSS class name to apply to document root */
  className: string;

  /** Optional description of the theme */
  description?: string;
}
