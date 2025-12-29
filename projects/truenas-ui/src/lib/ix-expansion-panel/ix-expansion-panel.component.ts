import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, input, output, computed, signal } from '@angular/core';

@Component({
  selector: 'ix-expansion-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ix-expansion-panel.component.html',
  styleUrls: ['./ix-expansion-panel.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
        display: 'none'
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
        overflow: 'visible',
        display: 'block'
      })),
      transition('collapsed => expanded', [
        style({ display: 'block', height: '0px', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '*', opacity: 1 }))
      ]),
      transition('expanded => collapsed', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ height: '0px', opacity: 0 })),
        style({ display: 'none' })
      ])
    ])
  ]
})
export class IxExpansionPanelComponent {
  title = input<string | undefined>(undefined);
  elevation = input<'none' | 'low' | 'medium' | 'high'>('medium');
  padding = input<'small' | 'medium' | 'large'>('medium');
  bordered = input<boolean>(false);
  background = input<boolean>(true);
  expanded = input<boolean>(false);
  disabled = input<boolean>(false);
  titleStyle = input<'header' | 'body' | 'link'>('header');

  expandedChange = output<boolean>();
  toggleEvent = output<void>();

  // Internal state for tracking expansion (for uncontrolled usage)
  private internalExpanded = signal<boolean | null>(null);

  // Effective expanded state (prefers internal state if set, otherwise uses input)
  effectiveExpanded = computed(() => {
    const internal = this.internalExpanded();
    return internal !== null ? internal : this.expanded();
  });

  readonly contentId = `ix-expansion-panel-content-${Math.random().toString(36).substr(2, 9)}`;

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
    const elevationClass = `ix-expansion-panel--elevation-${this.elevation()}`;
    const paddingClass = `ix-expansion-panel--padding-${this.padding()}`;
    const borderedClass = this.bordered() ? 'ix-expansion-panel--bordered' : '';
    const backgroundClass = this.background() ? 'ix-expansion-panel--background' : '';
    const expandedClass = this.effectiveExpanded() ? 'ix-expansion-panel--expanded' : '';
    const disabledClass = this.disabled() ? 'ix-expansion-panel--disabled' : '';
    const titleStyleClass = `ix-expansion-panel--title-${this.titleStyle()}`;

    return [
      'ix-expansion-panel',
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