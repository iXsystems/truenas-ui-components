/**
 * Marks an icon name for inclusion in the sprite generation.
 *
 * This is an identity function that simply returns the icon name unchanged.
 * Its purpose is to provide a marker that the build scripts can detect when
 * scanning for icons that need to be included in the sprite.
 *
 * Use this when icon names are computed dynamically or come from variables,
 * to ensure they're included in the sprite at build time.
 *
 * @example
 * ```typescript
 * // Static icon name - automatically detected from template
 * <ix-icon name="folder"></ix-icon>
 *
 * // Dynamic icon name - needs iconMarker() to be detected
 * const iconName = condition ? iconMarker('edit') : iconMarker('delete');
 * <ix-icon [name]="iconName"></ix-icon>
 *
 * // Array of dynamic icons
 * const actions = [
 *   { name: 'Save', icon: iconMarker('save') },
 *   { name: 'Cancel', icon: iconMarker('close') }
 * ];
 * ```
 *
 * @param iconName - The icon name to mark for sprite inclusion
 * @returns The same icon name (identity function)
 */
export function iconMarker(iconName: string): string {
  return iconName;
}
