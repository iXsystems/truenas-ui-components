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
  /**
   * Lists a directory. Reject with an Error to fail the navigation: the popup
   * shows its message above the listing (and `error` emits a `navigation`
   * error) until a later listing succeeds.
   */
  getChildren?: (path: string) => Promise<FileSystemItem[]>;
  validatePath?: (path: string) => Promise<boolean>;
}

/**
 * Everything that decides what the picker browses and how its value is
 * expressed, as one object — for consumers that build it from their own data
 * source and would otherwise bind the same four inputs at every call site.
 * Each field mirrors the input of the same name; an input that is bound
 * explicitly wins over the field.
 */
export interface FilePickerSource {
  callbacks?: FilePickerCallbacks;
  rootPath?: string;
  startPath?: string;
  valueRoot?: string;
}

/**
 * A consumer-defined creation flow surfaced as a button in the picker footer,
 * e.g. creating a dataset or zvol through a dialog. The creation itself
 * always happens outside the picker — through the pluggable inline flow
 * (`create`), a consumer-owned flow the picker awaits (`run`), or, with
 * neither, a fully consumer-owned flow driven by the `createAction` event.
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
  /**
   * A consumer-owned creation flow the picker awaits, e.g. one that opens a
   * dialog or side panel. Called with the browsed directory when the button is
   * pressed (and `create` is not set). Resolve with the created path to have
   * the picker refresh the listing and select it, exactly as after an inline
   * `create`; resolve with `null` when the user cancelled. Reject with an
   * Error to show its message in the popup (and emit a `creation` error).
   * Without `create` or `run`, pressing the button emits `createAction`.
   */
  run?: (parentPath: string) => Promise<string | null>;
  /**
   * Whether the action applies in the directory being browsed. Called with
   * that directory's path and its listed item — `null` when the picker has not
   * listed it, e.g. the start directory or the root. The button is hidden
   * where this returns false. Omit it to show the action everywhere.
   */
  canCreateAt?: (parentPath: string, directory: FileSystemItem | null) => boolean;
}

export interface FilePickerCreateActionEvent {
  actionId: string;
  /** Directory being browsed when the action was triggered. */
  parentPath: string;
}

/**
 * Payload of `itemSelectionChange`: the committed value together with the
 * listed items it refers to, for consumers that need more than the path
 * (e.g. to require that a FILE was picked).
 */
export interface FilePickerSelection {
  /** The committed value — the same payload `selectionChange` carries. */
  value: string | string[];
  /**
   * One entry per selected path, in value order. `null` when the picker has
   * not listed that path in this session — e.g. a typed path the user never
   * browsed to, or the browsed directory itself submitted on an empty
   * selection before its parent was listed. Empty for a cleared selection.
   */
  items: (FileSystemItem | null)[];
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