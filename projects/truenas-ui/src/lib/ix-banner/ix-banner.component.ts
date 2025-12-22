import { CommonModule } from '@angular/common';
import { Component, input, inject } from '@angular/core';
import { IxIconComponent } from '../ix-icon/ix-icon.component';
import { IxIconRegistryService } from '../ix-icon/ix-icon-registry.service';
import {
  mdiInformation,
  mdiAlert,
  mdiAlertCircle,
  mdiCheckCircle,
} from '@mdi/js';

export type IxBannerType = 'info' | 'warning' | 'error' | 'success';

const ICON_MAP = {
  'info': 'information',
  'warning': 'alert',
  'error': 'alert-circle',
  'success': 'check-circle',
} as const;

@Component({
  selector: 'ix-banner',
  standalone: true,
  imports: [CommonModule, IxIconComponent],
  templateUrl: './ix-banner.component.html',
  styleUrls: ['./ix-banner.component.scss'],
})
export class IxBannerComponent {
  private iconRegistry = inject(IxIconRegistryService);

  // Signal-based inputs (modern Angular 19+)
  heading = input.required<string>();
  message = input<string | undefined>(undefined);
  type = input<IxBannerType>('info');

  constructor() {
    this.registerMdiIcons();
  }

  /**
   * Register all MDI icons used by the banner component
   * Makes component self-contained with zero external configuration
   */
  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'information': mdiInformation,
      'alert': mdiAlert,
      'alert-circle': mdiAlertCircle,
      'check-circle': mdiCheckCircle,
    };

    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      }
    });
  }

  /**
   * Get the appropriate icon name based on banner type
   */
  public get iconName(): string {
    return ICON_MAP[this.type()];
  }

  /**
   * Get ARIA role based on banner type
   * Error/warning use 'alert' for immediate attention
   * Info/success use 'status' for polite announcements
   */
  public get ariaRole(): 'alert' | 'status' {
    return this.type() === 'error' || this.type() === 'warning'
      ? 'alert'
      : 'status';
  }

  /**
   * Generate CSS classes using BEM methodology
   */
  public get classes(): string[] {
    return [
      'ix-banner',
      `ix-banner--${this.type()}`,
    ];
  }
}
