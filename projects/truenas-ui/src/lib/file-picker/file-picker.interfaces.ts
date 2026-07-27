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
 * always happens outside the picker — either in a fully consumer-owned flow
 * (`createAction` event) or through the pluggable inline flow (`create`).
 */
export interface FilePickerCreateAction {
  /** Identifies the action in `createAction` events, e.g. 'dataset'. */
  id: string;
  /** Button label. */
  label: string;
  /**
   * Fully-qualified sprite icon id shown in the inline creation row,
   * e.g. 'tn-dataset'. Defaults to 'mdi-folder'.
   */
  icon?: string;
  /**
   * Opts into the built-in inline creation row. Pressing the action's button
   * then renders an editable name row at the top of the listing instead of
   * emitting `createAction`; submitting calls this with the browsed directory
   * and the entered name — the implementation does the real work (e.g. a
   * websocket API call). Resolve with the created path: the picker refreshes
   * the listing and selects it. Reject with an Error to show its message as
   * the inline error and keep the row editable for retry. Name validation
   * (duplicates, invalid characters, …) belongs in this callback.
   *
   * The row auto-submits when it loses focus with a non-empty name
   * (matching inline-rename conventions), so this callback can also fire
   * when the user clicks away — including on a click that navigates
   * elsewhere, which abandons the row and silently discards the resolved
   * path even though the item was created. Implementations should tolerate
   * that (e.g. creation is cheap to leave behind, or idempotent).
   */
  create?: (parentPath: string, name: string) => Promise<string>;
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