import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import type { ChangeDetectorRef } from '@angular/core';
import { Component, input, output, contentChildren, computed, effect, model } from '@angular/core';
import { IxStepComponent } from './ix-step.component';

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
  ],
  host: {
    '(window:resize)': 'onWindowResize($event)'
  }
})
export class IxStepperComponent {
  orientation = input<'horizontal' | 'vertical' | 'auto'>('horizontal');
  linear = input<boolean>(false);
  selectedIndex = model<number>(0);

  selectionChange = output<any>();
  completed = output<any>();

  steps = contentChildren(IxStepComponent, { descendants: true });

  constructor(private cdr: ChangeDetectorRef) {
    // Effect to check if all steps are completed
    effect(() => {
      // Trigger on any step completion change
      const stepsArray = this.steps();
      const allCompleted = stepsArray.every(step => step.completed());
      if (allCompleted && stepsArray.length > 0) {
        this.completed.emit(this._getStepData());
      }
    });
  }

  onWindowResize(event: any) {
    this.cdr.detectChanges();
  }

  private _getStepData(): any[] {
    return this.steps().map(step => ({
      label: step.label(),
      completed: step.completed(),
      data: step.data()
    }));
  }

  isWideScreen = computed(() => {
    // Note: This will only update on window resize due to ChangeDetectorRef trigger
    return window.innerWidth > 768;
  });

  selectStep(index: number): void {
    if (!this.linear() || this.canSelectStep(index)) {
      const previousIndex = this.selectedIndex();
      this.selectedIndex.set(index);
      this.selectionChange.emit({
        selectedIndex: index,
        previouslySelectedIndex: previousIndex
      });
    }
  }

  canSelectStep(index: number): boolean {
    if (!this.linear()) {return true;}

    // In linear mode, can only select completed steps or the next step
    const stepsArray = this.steps();
    for (let i = 0; i < index; i++) {
      if (!stepsArray[i]?.completed()) {
        return false;
      }
    }
    return true;
  }

  next(): void {
    const stepsLength = this.steps().length;
    if (this.selectedIndex() < stepsLength - 1) {
      this.selectStep(this.selectedIndex() + 1);
    }
  }

  previous(): void {
    if (this.selectedIndex() > 0) {
      this.selectStep(this.selectedIndex() - 1);
    }
  }

  _trackByStepIndex(index: number): number {
    return index;
  }
}