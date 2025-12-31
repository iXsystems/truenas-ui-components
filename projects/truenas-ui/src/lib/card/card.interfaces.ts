export interface TnCardAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
  icon?: string;
}

export interface TnCardControl {
  label: string;
  checked: boolean;
  handler: (checked: boolean) => void;
  disabled?: boolean;
}

export interface TnCardHeaderStatus {
  label: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export interface TnCardFooterLink {
  label: string;
  handler: () => void;
}
