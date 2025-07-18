import { Component, Input, Output, EventEmitter, ElementRef, inject, TemplateRef, ContentChild, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'ix-tab',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './ix-tab.component.html',
  styleUrl: './ix-tab.component.scss'
})
export class IxTabComponent implements AfterContentInit {
  @Input() label = '';
  @Input() disabled = false;
  @Input() icon?: string;
  @Input() iconTemplate?: TemplateRef<any>;
  @Input() testId?: string;

  @Output() selected = new EventEmitter<void>();

  @ContentChild('iconContent') iconContent?: TemplateRef<any>;

  // Internal properties set by parent IxTabsComponent
  index = 0;
  isActive = false;
  tabsComponent?: any; // Will be set by parent

  elementRef = inject(ElementRef<HTMLElement>);
  
  hasIconContent = false;

  ngAfterContentInit() {
    this.hasIconContent = !!this.iconContent;
  }

  onClick() {
    if (!this.disabled) {
      this.selected.emit();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.tabsComponent) {
      this.tabsComponent.onKeydown(event, this.index);
    }
  }

  get classes(): string {
    const classes = ['ix-tab'];
    
    if (this.isActive) {
      classes.push('ix-tab--active');
    }
    
    if (this.disabled) {
      classes.push('ix-tab--disabled');
    }

    return classes.join(' ');
  }

  get tabIndex(): number {
    return this.isActive ? 0 : -1;
  }

  get hasIcon(): boolean {
    return !!(this.iconContent || this.iconTemplate || this.icon);
  }
}