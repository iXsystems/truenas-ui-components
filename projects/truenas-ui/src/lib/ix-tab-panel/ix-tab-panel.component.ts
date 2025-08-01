import { Component, Input, TemplateRef, ViewChild, ElementRef, inject } from '@angular/core';
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
  @Input() label = '';
  @Input() lazyLoad = false;
  @Input() testId?: string;

  @ViewChild('content', { static: true }) content!: TemplateRef<any>;

  // Internal properties set by parent IxTabsComponent
  index = 0;
  isActive = false;
  hasBeenActive = false;

  elementRef = inject(ElementRef<HTMLElement>);

  get classes(): string {
    const classes = ['ix-tab-panel'];
    
    if (this.isActive) {
      classes.push('ix-tab-panel--active');
    }
    
    if (!this.isActive) {
      classes.push('ix-tab-panel--hidden');
    }

    return classes.join(' ');
  }

  get shouldRender(): boolean {
    if (!this.lazyLoad) {
      return true;
    }
    
    // For lazy loading, only render if it's currently active or has been active before
    return this.isActive || this.hasBeenActive;
  }

  onActivate() {
    this.hasBeenActive = true;
  }
}