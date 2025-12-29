import { Component, input, output, ElementRef, inject, TemplateRef, ContentChild, AfterContentInit, computed, signal } from '@angular/core';
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
  label = input<string>('');
  disabled = input<boolean>(false);
  icon = input<string | undefined>(undefined);
  iconTemplate = input<TemplateRef<any> | undefined>(undefined);
  testId = input<string | undefined>(undefined);

  selected = output<void>();

  @ContentChild('iconContent') iconContent?: TemplateRef<any>;

  // Internal properties set by parent IxTabsComponent (public signals for parent control)
  public index = signal<number>(0);
  public isActive = signal<boolean>(false);
  tabsComponent?: any; // Will be set by parent

  elementRef = inject(ElementRef<HTMLElement>);

  protected hasIconContent = signal<boolean>(false);

  ngAfterContentInit() {
    this.hasIconContent.set(!!this.iconContent);
  }

  onClick() {
    if (!this.disabled()) {
      this.selected.emit();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (this.tabsComponent) {
      this.tabsComponent.onKeydown(event, this.index());
    }
  }

  classes = computed(() => {
    const classes = ['ix-tab'];

    if (this.isActive()) {
      classes.push('ix-tab--active');
    }

    if (this.disabled()) {
      classes.push('ix-tab--disabled');
    }

    return classes.join(' ');
  });

  tabIndex = computed(() => {
    return this.isActive() ? 0 : -1;
  });

  hasIcon = computed(() => {
    return !!(this.hasIconContent() || this.iconTemplate() || this.icon());
  });
}