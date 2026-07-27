export enum TnToastType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export enum TnToastPosition {
  Top = 'top',
  Bottom = 'bottom',
}

export interface TnToastConfig {
  /** Auto-dismiss duration in milliseconds. Default: 4000. Set to 0 to disable. */
  duration?: number;
  /** Visual style of the toast. Default: TnToastType.Info. */
  type?: TnToastType;
  /** Vertical position. Default: TnToastPosition.Top. */
  position?: TnToastPosition;
  /**
   * Test id applied to the action button. Rendered under whichever attribute name is
   * configured via `TN_TEST_ATTR` (default `data-testid`). Only relevant when an action
   * is provided.
   */
  actionTestId?: string;
}
