import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef, Component, input, output, contentChildren, computed, effect, model, signal, inject,
} from '@angular/core';
import { TnStepComponent } from './step.component';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  standalone: true,
  imports: [CommonModule, TnTestIdDirective, LabelMarkupPipe, TnIconComponent],
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
export class TnStepperComponent {
  orientation = input<'horizontal' | 'vertical' | 'auto'>('horizontal');
  linear = input<boolean>(false);
  selectedIndex = model<number>(0);
  /**
   * Test-id applied to the stepper root. Rendered under whichever attribute name
   * is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);

  selectionChange = output<{ selectedIndex: number; previouslySelectedIndex: number }>();
  completed = output<Array<{ label: string; completed: boolean; data: unknown }>>();

  steps = contentChildren(TnStepComponent, { descendants: true });

  // Highest step index the user has navigated to. Used to reveal the "edit" (pencil)
  // affordance only on steps that have actually been visited — a step that is valid by
  // default but never reached stays a plain number.
  readonly maxReachedIndex = signal(0);

  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const index = this.selectedIndex();
      this.maxReachedIndex.update((max) => Math.max(max, index));
    });

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

  onWindowResize(_event: Event) {
    this.cdr.detectChanges();
  }

  private _getStepData(): Array<{ label: string; completed: boolean; data: unknown }> {
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

  // Vertical mode lays the active step's content out inline beneath its header
  // (mat-vertical-stepper style), so it fits narrow containers such as side panels.
  isVertical = computed(() => {
    return this.orientation() === 'vertical' || (this.orientation() === 'auto' && !this.isWideScreen());
  });

  // Per-index "editable" flags. A step shows the "edit" (pencil) icon once it has been
  // visited and is valid (completed) but isn't the current step — signalling the user can
  // go back and change it. Computed (not a per-call method) so it's evaluated once per
  // change-detection cycle and cheaply indexed in the template, even as step counts grow.
  readonly stepEditable = computed<boolean[]>(() => {
    const max = this.maxReachedIndex();
    const current = this.selectedIndex();
    return this.steps().map(
      (step, index) => !!step.completed() && index <= max && index !== current,
    );
  });

  /** Whether the step at `index` shows the edit (pencil) affordance. */
  isStepEditable(index: number): boolean {
    return this.stepEditable()[index] ?? false;
  }

  // Per-index "gated" flags for linear mode: a step is gated (not yet selectable) while
  // any prior step is incomplete. Memoized so the header's aria-disabled / tabindex
  // bindings don't re-run canSelectStep() for every step on each change-detection cycle.
  readonly stepGated = computed<boolean[]>(() => {
    if (!this.linear()) {
      return this.steps().map(() => false);
    }
    return this.steps().map((_step, index) => !this.canSelectStep(index));
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