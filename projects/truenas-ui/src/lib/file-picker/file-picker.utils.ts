import type { FilePickerMode, FileSystemItemType } from './file-picker.interfaces';

/** Item types selectable under `mode`; null means every type is selectable. */
export function getSelectableTypes(mode: FilePickerMode | FileSystemItemType[]): FileSystemItemType[] | null {
  if (Array.isArray(mode)) {
    return mode;
  }
  return mode === 'any' ? null : [mode];
}

const directoryLikeTypes: FileSystemItemType[] = ['folder', 'dataset', 'mountpoint'];

/**
 * Whether the browsed directory itself is a valid selection under `mode`,
 * i.e. whether any selectable type is directory-like. An empty selection
 * then stands for the current directory, which keeps empty directories
 * selectable.
 */
export function allowsCurrentDirectorySelection(mode: FilePickerMode | FileSystemItemType[]): boolean {
  const selectableTypes = getSelectableTypes(mode);
  return !selectableTypes || selectableTypes.some((type) => directoryLikeTypes.includes(type));
}
