export interface TnCardAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
  icon?: string;
  /**
   * Test-id applied to the rendered action button. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId?: string;
}

export interface TnCardControl {
  label: string;
  checked: boolean;
  handler: (checked: boolean) => void;
  disabled?: boolean;
  /**
   * Test-id applied to the rendered slide-toggle. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId?: string;
}

export interface TnCardHeaderStatus {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /**
   * Test-id applied to the rendered status pill `<div>`. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId?: string;
}

export interface TnCardFooterLink {
  label: string;
  handler: () => void;
}
