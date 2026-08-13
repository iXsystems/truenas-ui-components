export interface TnCardAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
  icon?: string;
  /**
   * Tooltip for the action button — useful for explaining why an action is unavailable.
   * Shows on pointer hover (including while the action is disabled, since hover
   * retargets to the button's host element) and on keyboard focus while enabled; a
   * disabled native button is not focusable, so for keyboard users the text is exposed
   * through the button's persistent `aria-describedby` description instead of visually.
   */
  tooltip?: string;
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
  /**
   * Test-id applied to the rendered footer link button. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId?: string;
}
