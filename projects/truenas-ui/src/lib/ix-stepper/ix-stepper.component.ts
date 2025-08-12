import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { IxStepComponent } from './ix-step.component';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'ix-stepper',
  templateUrl: './ix-stepper.component.html',
  styleUrls: ['./ix-stepper.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class IxStepperComponent implements AfterContentInit {
  @Input() 
  orientation: 'horizontal' | 'vertical' | 'auto' = 'horizontal';
  
  @Input()
  linear = false;
  
  @Input()
  selectedIndex = 0;
  
  @Output()
  selectionChange = new EventEmitter<any>();
  
  @Output()
  completed = new EventEmitter<any>();
  
  @ContentChildren(IxStepComponent, { descendants: true }) 
  steps!: QueryList<IxStepComponent>;

  constructor(private cdr: ChangeDetectorRef) {}

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.cdr.detectChanges();
  }

  ngAfterContentInit(): void {
    // Check if all steps are completed when selection changes
    this.selectionChange.subscribe(() => {
      if (this.steps.toArray().every(step => step.completed)) {
        this.completed.emit(this._getStepData());
      }
    });
  }

  private _getStepData(): any[] {
    return this.steps.toArray().map(step => ({
      label: step.label,
      completed: step.completed,
      data: step.data
    }));
  }

  get isWideScreen(): boolean {
    return window.innerWidth > 768;
  }

  selectStep(index: number): void {
    if (!this.linear || this.canSelectStep(index)) {
      const previousIndex = this.selectedIndex;
      this.selectedIndex = index;
      this.selectionChange.emit({
        selectedIndex: index,
        previouslySelectedIndex: previousIndex
      });
    }
  }

  canSelectStep(index: number): boolean {
    if (!this.linear) return true;
    
    // In linear mode, can only select completed steps or the next step
    for (let i = 0; i < index; i++) {
      if (!this.steps.toArray()[i]?.completed) {
        return false;
      }
    }
    return true;
  }

  next(): void {
    if (this.selectedIndex < this.steps.length - 1) {
      this.selectStep(this.selectedIndex + 1);
    }
  }

  previous(): void {
    if (this.selectedIndex > 0) {
      this.selectStep(this.selectedIndex - 1);
    }
  }

  _trackByStepIndex(index: number): number {
    return index;
  }
}