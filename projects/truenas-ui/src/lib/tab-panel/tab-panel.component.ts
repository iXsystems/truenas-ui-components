import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { TemplateRef} from '@angular/core';
import { Component, input, viewChild, ElementRef, inject, computed, signal } from '@angular/core';

@Component({
  selector: 'tn-tab-panel',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './tab-panel.component.html',
  styleUrl: './tab-panel.component.scss'
})
export class TnTabPanelComponent {
  label = input<string>('');
  lazyLoad = input<boolean>(false);
  testId = input<string | undefined>(undefined);

  content = viewChild.required<TemplateRef<unknown>>('content');

  // Internal properties set by parent TnTabsComponent (public signals for parent control)
  index = signal<number>(0);
  isActive = signal<boolean>(false);
  hasBeenActive = signal<boolean>(false);

  elementRef = inject(ElementRef<HTMLElement>);

  classes = computed(() => {
    const classes = ['ix-tab-panel'];

    if (this.isActive()) {
      classes.push('ix-tab-panel--active');
    }

    if (!this.isActive()) {
      classes.push('ix-tab-panel--hidden');
    }

    return classes.join(' ');
  });

  shouldRender = computed(() => {
    if (!this.lazyLoad()) {
      return true;
    }

    // For lazy loading, only render if it's currently active or has been active before
    return this.isActive() || this.hasBeenActive();
  });

  onActivate() {
    this.hasBeenActive.set(true);
  }
}