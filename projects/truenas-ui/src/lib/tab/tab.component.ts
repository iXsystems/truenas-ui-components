import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { TemplateRef, AfterContentInit} from '@angular/core';
import { Component, input, output, ElementRef, inject, contentChild, computed, signal } from '@angular/core';

@Component({
  selector: 'tn-tab',
  standalone: true,
  imports: [CommonModule, A11yModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss'
})
export class TnTabComponent implements AfterContentInit {
  label = input<string>('');
  disabled = input<boolean>(false);
  icon = input<string | undefined>(undefined);
  iconTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  testId = input<string | undefined>(undefined);

  selected = output<void>();

  iconContent = contentChild<TemplateRef<unknown>>('iconContent');

  // Internal properties set by parent TnTabsComponent (public signals for parent control)
  index = signal<number>(0);
  isActive = signal<boolean>(false);
  tabsComponent?: { onKeydown: (event: KeyboardEvent, index: number) => void }; // Will be set by parent

  elementRef = inject(ElementRef<HTMLElement>);

  protected hasIconContent = signal<boolean>(false);

  ngAfterContentInit() {
    this.hasIconContent.set(!!this.iconContent());
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
    const classes = ['tn-tab'];

    if (this.isActive()) {
      classes.push('tn-tab--active');
    }

    if (this.disabled()) {
      classes.push('tn-tab--disabled');
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