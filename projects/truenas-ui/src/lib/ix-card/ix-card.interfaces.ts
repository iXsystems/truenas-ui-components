export interface IxCardAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
  icon?: string;
}

export interface IxCardControl {
  label: string;
  checked: boolean;
  handler: (checked: boolean) => void;
  disabled?: boolean;
}

export interface IxCardHeaderStatus {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export interface IxCardFooterLink {
  label: string;
  handler: () => void;
}
