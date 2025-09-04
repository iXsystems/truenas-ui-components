import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  @Input()
  title?: string;

  @Input()
  elevation: 'none' | 'low' | 'medium' | 'high' = 'medium';

  @Input()
  padding: 'small' | 'medium' | 'large' = 'medium';

  @Input()
  bordered = false;

  @Input()
  background = true;

  @Input()
  expanded = false;

  @Input()
  disabled = false;

  @Input()
  titleStyle: 'header' | 'body' | 'link' = 'header';

  @Output()
  expandedChange = new EventEmitter<boolean>();

  @Output()
  toggleEvent = new EventEmitter<void>();

  public readonly contentId = `ix-expansion-panel-content-${Math.random().toString(36).substr(2, 9)}`;

  public toggle(): void {
    if (this.disabled) {
      return;
    }
    
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
    this.toggleEvent.emit();
  }

  public get classes(): string[] {
    const elevationClass = `ix-expansion-panel--elevation-${this.elevation}`;
    const paddingClass = `ix-expansion-panel--padding-${this.padding}`;
    const borderedClass = this.bordered ? 'ix-expansion-panel--bordered' : '';
    const backgroundClass = this.background ? 'ix-expansion-panel--background' : '';
    const expandedClass = this.expanded ? 'ix-expansion-panel--expanded' : '';
    const disabledClass = this.disabled ? 'ix-expansion-panel--disabled' : '';
    const titleStyleClass = `ix-expansion-panel--title-${this.titleStyle}`;
    
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
  }
}