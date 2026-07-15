export interface FileSystemItem {
  path: string;
  name: string;
  type: 'file' | 'folder' | 'dataset' | 'zvol' | 'mountpoint';
  size?: number;
  modified?: Date;
  permissions?: 'read' | 'write' | 'none';
  icon?: string;
  disabled?: boolean;
  isCreating?: boolean;      // Item is in creation/edit mode
  tempId?: string;           // Temporary ID for pending items
  creationError?: string;    // Inline error message during creation
}

export interface FilePickerCallbacks {
  getChildren?: (path: string) => Promise<FileSystemItem[]>;
  validatePath?: (path: string) => Promise<boolean>;
  createFolder?: (parentPath: string, name: string) => Promise<string>;
}

export interface CreateFolderEvent {
  parentPath: string;
  folderName: string;
}

/**
 * A consumer-defined creation flow surfaced as a button in the picker header,
 * e.g. creating a dataset or zvol through a dialog. Unlike the built-in
 * "New Folder" flow, the creation itself happens outside the picker.
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

export type FilePickerMode = 'file' | 'folder' | 'dataset' | 'zvol' | 'any';