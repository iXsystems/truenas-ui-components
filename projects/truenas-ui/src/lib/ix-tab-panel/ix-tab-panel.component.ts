import { Component, input, TemplateRef, ViewChild, ElementRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'ix-tab-panel',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './ix-tab-panel.component.html',
  styleUrl: './ix-tab-panel.component.scss'
})
export class IxTabPanelComponent {
  label = input<string>('');
  lazyLoad = input<boolean>(false);
  testId = input<string | undefined>(undefined);

  @ViewChild('content', { static: true }) content!: TemplateRef<any>;

  // Internal properties set by parent IxTabsComponent
  index = 0;
  isActive = false;
  hasBeenActive = false;

  elementRef = inject(ElementRef<HTMLElement>);

  classes = computed(() => {
    const classes = ['ix-tab-panel'];

    if (this.isActive) {
      classes.push('ix-tab-panel--active');
    }

    if (!this.isActive) {
      classes.push('ix-tab-panel--hidden');
    }

    return classes.join(' ');
  });

  shouldRender = computed(() => {
    if (!this.lazyLoad()) {
      return true;
    }

    // For lazy loading, only render if it's currently active or has been active before
    return this.isActive || this.hasBeenActive;
  });

  onActivate() {
    this.hasBeenActive = true;
  }
}