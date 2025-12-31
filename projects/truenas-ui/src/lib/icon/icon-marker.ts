/**
 * Marks an icon name for inclusion in the sprite generation.
 *
 * This function serves two purposes:
 * 1. At runtime: Applies library-specific prefixes (e.g., mdi-, app-)
 * 2. At build time: Marker for the scanner to detect icons for sprite inclusion
 *
 * Use this when icon names are computed dynamically or come from variables,
 * to ensure they're included in the sprite at build time.
 *
 * @example
 * // Static icon name - automatically detected from template
 * <tn-icon name="folder"></tn-icon>
 *
 * @example
 * // Dynamic MDI icon
 * const iconName = condition ? iconMarker("pencil", "mdi") : iconMarker("delete", "mdi");
 * <tn-icon [name]="iconName"></tn-icon>
 *
 * @example
 * // Dynamic custom icon (consumer's own icon)
 * const logo = iconMarker("your-logo-name", "custom");
 * <tn-icon [name]="logo"></tn-icon>
 *
 * @example
 * // Array of dynamic icons
 * const actions = [
 *   { name: "Save", icon: iconMarker("content-save", "mdi") },
 *   { name: "Cancel", icon: iconMarker("close", "mdi") }
 * ];
 *
 * @param iconName - The icon name to mark for sprite inclusion
 * @param library - Optional library type: 'mdi', 'material', or 'custom'
 * @returns The icon name with appropriate prefix applied
 * @public
 */
export function iconMarker(
  iconName: string,
  library?: 'mdi' | 'material' | 'custom'
): string {
  // Apply library-specific prefixes
  if (library === 'mdi' && !iconName.startsWith('mdi-')) {
    return `mdi-${iconName}`;
  }
  if (library === 'custom' && !iconName.startsWith('app-')) {
    return `app-${iconName}`;
  }
  if (library === 'material' && !iconName.startsWith('mat-')) {
    return `mat-${iconName}`;
  }
  return iconName;
}

/**
 * INTERNAL LIBRARY USE ONLY
 *
 * Marks an icon name for inclusion in the sprite generation with library namespace.
 * This function MUST be used by library component code for custom icons.
 *
 * The TypeScript type enforces that the icon name starts with 'tn-' prefix,
 * which reserves this namespace exclusively for library-provided custom icons.
 *
 * @example
 * ```typescript
 * // ✅ Correct - Library component code
 * const icon = libIconMarker('tn-dataset');
 *
 * // ❌ Wrong - Will cause TypeScript error
 * const icon = libIconMarker('dataset');
 * ```
 *
 * @param iconName - The icon name with 'tn-' prefix (enforced by TypeScript)
 * @returns The same icon name (identity function)
 * @internal
 */
export function libIconMarker(iconName: `tn-${string}`): string {
  return iconName;
}
