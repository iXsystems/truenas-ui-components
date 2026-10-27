import { InjectionToken, type Signal } from '@angular/core';

/**
 * Every string `tn-file-picker` and its popup render or announce. Consumers
 * translate them once at the app root by providing `TN_FILE_PICKER_LABELS` —
 * typically wired to an i18n service — instead of per call site. A
 * `placeholder` input bound to anything but its English default wins over
 * `placeholder` here.
 *
 * Strings that carry a value (a count, a path, a name) are functions, so the
 * consumer decides how to place it: a word order, an ICU plural, a translated
 * template — the library imposes no placeholder syntax.
 */
export interface TnFilePickerLabels {
  /** Empty path input. */
  placeholder: string;
  /** Accessible name of the folder button that opens the popup. */
  openPicker: string;
  /** Accessible name of the breadcrumb `nav`. */
  breadcrumb: string;
  /** Accessible name of a collapsed (`…`) or nameless breadcrumb segment. */
  navigateTo: (path: string) => string;
  loading: string;
  /** The listing's empty state. */
  noItems: string;
  /** Visually hidden header of the multi-select checkbox column. */
  selectColumn: string;
  /** Accessible name of an item's multi-select checkbox. */
  selectItem: (name: string) => string;
  /** Accessible name and tooltip of a directory's open (chevron) button. */
  openItem: (name: string) => string;
  nameColumn: string;
  sizeColumn: string;
  modifiedColumn: string;
  /** Footer, while items are picked. */
  itemsSelected: (count: number) => string;
  /** Footer, when the browsed directory itself would be picked. */
  currentDirectorySelected: string;
  /** Footer, when nothing is picked and the directory cannot be. */
  noItemsSelected: string;
  clearSelection: string;
  /** The footer button that applies the selection. */
  select: string;
  /** Accessible name of the inline creation row's input, from the action's label. */
  inlineCreateName: (actionLabel: string) => string;
  /** Inline creation row, when the `create` callback rejects with something other than an Error. */
  inlineCreateFailed: string;
  /** Modified column, for an item changed today / yesterday; `time` is already formatted. */
  today: (time: string) => string;
  yesterday: (time: string) => string;

  /** Error messages — shown in the popup and carried by the `error` output. */
  pathOutsideRoot: (rootPath: string) => string;
  invalidPath: (path: string) => string;
  pathValidationFailed: string;
  loadFailed: string;
  createFailed: string;
  createdOutsideRoot: (rootPath: string) => string;
}

/** English defaults used when no `TN_FILE_PICKER_LABELS` provider is registered. */
export const TN_FILE_PICKER_DEFAULT_LABELS: TnFilePickerLabels = {
  placeholder: 'Select file or folder',
  openPicker: 'Open file picker',
  breadcrumb: 'File path',
  navigateTo: (path) => `Navigate to ${path}`,
  loading: 'Loading...',
  noItems: 'No items found',
  selectColumn: 'Select',
  selectItem: (name) => `Select ${name}`,
  openItem: (name) => `Open ${name}`,
  nameColumn: 'Name',
  sizeColumn: 'Size',
  modifiedColumn: 'Modified',
  itemsSelected: (count) => `${count} item${count !== 1 ? 's' : ''} selected`,
  currentDirectorySelected: 'Current directory selected',
  noItemsSelected: 'No items selected',
  clearSelection: 'Clear Selection',
  select: 'Select',
  inlineCreateName: (actionLabel) => `${actionLabel} name`,
  inlineCreateFailed: 'Creation failed',
  today: (time) => `Today ${time}`,
  yesterday: (time) => `Yesterday ${time}`,
  pathOutsideRoot: (rootPath) => `Path is outside of ${rootPath}`,
  invalidPath: (path) => `Invalid path: ${path}`,
  pathValidationFailed: 'Path validation failed',
  loadFailed: 'Failed to load directory',
  createFailed: 'Failed to create item',
  createdOutsideRoot: (rootPath) => `Created item is outside of ${rootPath}`,
};

/**
 * DI token for app-wide file picker labels. Provide either a static object or a
 * `Signal<TnFilePickerLabels>` — the latter lets an open picker follow a
 * language change.
 */
export const TN_FILE_PICKER_LABELS = new InjectionToken<TnFilePickerLabels | Signal<TnFilePickerLabels>>(
  'TN_FILE_PICKER_LABELS',
  { providedIn: 'root', factory: () => TN_FILE_PICKER_DEFAULT_LABELS },
);
