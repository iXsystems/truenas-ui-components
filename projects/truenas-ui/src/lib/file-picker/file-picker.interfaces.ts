export interface FileSystemItem {
  path: string;
  name: string;
  type: 'file' | 'folder' | 'dataset' | 'zvol' | 'mountpoint';
  size?: number;
  modified?: Date;
  permissions?: 'read' | 'write' | 'none';
  /**
   * Fully-qualified sprite icon id overriding the type-based default, e.g.
   * 'mdi-folder' or 'tn-dataset'. Mark the icon for sprite inclusion with
   * `tnIconMarker` in the consuming code.
   */
  icon?: string;
  disabled?: boolean;
}

export interface FilePickerCallbacks {
  getChildren?: (path: string) => Promise<FileSystemItem[]>;
  validatePath?: (path: string) => Promise<boolean>;
}

/**
 * A consumer-defined creation flow surfaced as a button in the picker footer,
 * e.g. creating a dataset or zvol through a dialog. The creation itself
 * happens outside the picker.
 */
export interface FilePickerCreateAction {
  /** Identifies the action in `createAction` events, e.g. 'dataset'. */
  id: string;
  /** Button label. */
  label: string;
}

export interface FilePickerCreateActionEvent {
  actionId: string;
  /** Directory being browsed when the action was triggered. */
  parentPath: string;
}

export interface FilePickerError {
  type: 'navigation' | 'permission' | 'creation' | 'validation';
  message: string;
  path?: string;
}

export interface PathSegment {
  name: string;
  path: string;
}

export type FileSystemItemType = FileSystemItem['type'];

export type FilePickerMode = 'file' | 'folder' | 'dataset' | 'zvol' | 'any';