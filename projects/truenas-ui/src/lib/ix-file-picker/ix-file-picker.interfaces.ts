export interface FileSystemItem {
  path: string;
  name: string;
  type: 'file' | 'folder' | 'dataset' | 'zvol' | 'mountpoint';
  size?: number;
  modified?: Date;
  permissions?: 'read' | 'write' | 'none';
  icon?: string;
  disabled?: boolean;
}

export interface FilePickerCallbacks {
  getChildren?: (path: string) => Promise<FileSystemItem[]>;
  validatePath?: (path: string) => Promise<boolean>;
  createFolder?: (parentPath: string, name: string) => Promise<string>;
  createDataset?: (parentPath: string) => Promise<string>;
  createZvol?: (parentPath: string) => Promise<string>;
}

export interface CreateFolderEvent {
  parentPath: string;
  folderName: string;
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