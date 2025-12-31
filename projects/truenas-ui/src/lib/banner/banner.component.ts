import { CommonModule } from '@angular/common';
import { Component, input, inject, computed } from '@angular/core';
import {
  mdiInformation,
  mdiAlert,
  mdiAlertCircle,
  mdiCheckCircle,
} from '@mdi/js';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconComponent } from '../icon/icon.component';

export type TnBannerType = 'info' | 'warning' | 'error' | 'success';

const ICON_MAP = {
  'info': 'information',
  'warning': 'alert',
  'error': 'alert-circle',
  'success': 'check-circle',
} as const;

@Component({
  selector: 'ix-banner',
  standalone: true,
  imports: [CommonModule, TnIconComponent],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class TnBannerComponent {
  private iconRegistry = inject(TnIconRegistryService);

  // Signal-based inputs (modern Angular 19+)
  heading = input.required<string>();
  message = input<string | undefined>(undefined);
  type = input<TnBannerType>('info');

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
  iconName = computed(() => {
    return ICON_MAP[this.type()];
  });

  /**
   * Get ARIA role based on banner type
   * Error/warning use 'alert' for immediate attention
   * Info/success use 'status' for polite announcements
   */
  ariaRole = computed(() => {
    return this.type() === 'error' || this.type() === 'warning'
      ? 'alert'
      : 'status';
  });

  /**
   * Generate CSS classes using BEM methodology
   */
  classes = computed(() => {
    return [
      'ix-banner',
      `ix-banner--${this.type()}`,
    ];
  });
}
