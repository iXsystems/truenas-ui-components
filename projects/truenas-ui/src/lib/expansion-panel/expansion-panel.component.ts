import { CommonModule } from '@angular/common';
import { Component, input, output, computed, signal } from '@angular/core';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-expansion-panel',
  standalone: true,
  imports: [CommonModule, TnTestIdDirective],
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss']
})
export class TnExpansionPanelComponent {
  title = input<string | undefined>(undefined);
  elevation = input<'none' | 'low' | 'medium' | 'high'>('medium');
  padding = input<'small' | 'medium' | 'large'>('medium');
  bordered = input<boolean>(false);
  background = input<boolean>(true);
  expanded = input<boolean>(false);
  disabled = input<boolean>(false);
  titleStyle = input<'header' | 'body' | 'link'>('header');
  /**
   * Test-id applied to the panel's root element. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);
  /**
   * Test-id applied to the expand/collapse toggle header button.
   */
  toggleTestId = input<TnTestIdValue>(undefined);

  expandedChange = output<boolean>();
  toggleEvent = output<void>();

  // Internal state for tracking expansion (for uncontrolled usage)
  private internalExpanded = signal<boolean | null>(null);

  // Effective expanded state (prefers internal state if set, otherwise uses input)
  effectiveExpanded = computed(() => {
    const internal = this.internalExpanded();
    return internal !== null ? internal : this.expanded();
  });

  readonly contentId = `tn-expansion-panel-content-${Math.random().toString(36).substr(2, 9)}`;

  toggle(): void {
    if (this.disabled()) {
      return;
    }

    const newExpanded = !this.effectiveExpanded();
    this.internalExpanded.set(newExpanded);
    this.expandedChange.emit(newExpanded);
    this.toggleEvent.emit();
  }

  classes = computed(() => {
    const elevationClass = `tn-expansion-panel--elevation-${this.elevation()}`;
    const paddingClass = `tn-expansion-panel--padding-${this.padding()}`;
    const borderedClass = this.bordered() ? 'tn-expansion-panel--bordered' : '';
    const backgroundClass = this.background() ? 'tn-expansion-panel--background' : '';
    const expandedClass = this.effectiveExpanded() ? 'tn-expansion-panel--expanded' : '';
    const disabledClass = this.disabled() ? 'tn-expansion-panel--disabled' : '';
    const titleStyleClass = `tn-expansion-panel--title-${this.titleStyle()}`;

    return [
      'tn-expansion-panel',
      elevationClass,
      paddingClass,
      borderedClass,
      backgroundClass,
      expandedClass,
      disabledClass,
      titleStyleClass
    ].filter(Boolean);
  });
}