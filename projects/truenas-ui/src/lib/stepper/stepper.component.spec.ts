import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TnStepComponent } from './step.component';
import { TnStepperNextDirective } from './stepper-next.directive';
import { TnStepperPreviousDirective } from './stepper-previous.directive';
import { TnStepperComponent } from './stepper.component';
import { TnStepperHarness } from './stepper.harness';
import { TnButtonComponent } from '../button/button.component';

@Component({
  selector: 'tn-stepper-test-host',
  standalone: true,
  imports: [
    TnStepperComponent,
    TnStepComponent,
    TnStepperNextDirective,
    TnStepperPreviousDirective,
    TnButtonComponent,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-stepper
      [orientation]="orientation()"
      [linear]="linear()">
      <tn-step label="One" [completed]="step0Completed()">
        <p>Step one content</p>
        <tn-button tnStepperNext label="Next" />
      </tn-step>
      <tn-step
        label="Two"
        [completed]="step1Completed()"
        [hasError]="step1Error()"
        [errorMessage]="step1ErrorMessage()">
        <p>Step two content</p>
        <tn-button tnStepperPrevious label="Back" />
        <tn-button tnStepperNext label="Next" />
      </tn-step>
      <tn-step label="Three" [completed]="step2Completed()">
        <p>Step three content</p>
        <tn-button tnStepperPrevious label="Back" />
      </tn-step>
    </tn-stepper>
  `,
})
class StepperTestHostComponent {
  orientation = signal<'horizontal' | 'vertical' | 'auto'>('horizontal');
  linear = signal(false);
  step0Completed = signal(false);
  step1Completed = signal(false);
  step2Completed = signal(false);
  step1Error = signal(false);
  step1ErrorMessage = signal<string | undefined>(undefined);
}

describe('TnStepperComponent', () => {
  let fixture: ComponentFixture<StepperTestHostComponent>;
  let host: StepperTestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperTestHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  /** Clicks the first `<tn-button>` whose visible label matches `text`. */
  function clickButton(text: string): void {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const button = buttons.find((b) => b.textContent?.trim() === text);
    if (!button) {
      throw new Error(`No button labelled "${text}"`);
    }
    button.click();
    fixture.detectChanges();
  }

  function headers(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tn-stepper__step-header'));
  }

  it('renders each step label', async () => {
    const stepper = await loader.getHarness(TnStepperHarness);
    expect(await stepper.getStepCount()).toBe(3);
    expect(await stepper.getStepLabels()).toEqual(['One', 'Two', 'Three']);
  });

  describe('selection', () => {
    it('selects any step when non-linear', async () => {
      const stepper = await loader.getHarness(TnStepperHarness);
      await stepper.selectStep(2);
      expect(await stepper.getSelectedIndex()).toBe(2);
    });

    it('gates ahead-of-sequence steps in linear mode until prior steps complete', async () => {
      host.linear.set(true);
      fixture.detectChanges();

      const stepper = await loader.getHarness(TnStepperHarness);
      // Step 0 is not completed, so step 2 cannot be selected.
      await stepper.selectStep(2);
      expect(await stepper.getSelectedIndex()).toBe(0);

      // Completing the prior steps opens the gate.
      host.step0Completed.set(true);
      host.step1Completed.set(true);
      fixture.detectChanges();
      await stepper.selectStep(2);
      expect(await stepper.getSelectedIndex()).toBe(2);
    });
  });

  describe('navigation directives', () => {
    it('advances to the next step via tnStepperNext', async () => {
      const stepper = await loader.getHarness(TnStepperHarness);
      expect(await stepper.getSelectedIndex()).toBe(0);

      clickButton('Next');
      expect(await stepper.getSelectedIndex()).toBe(1);
    });

    it('returns to the previous step via tnStepperPrevious', async () => {
      const stepper = await loader.getHarness(TnStepperHarness);
      clickButton('Next');
      expect(await stepper.getSelectedIndex()).toBe(1);

      clickButton('Back');
      expect(await stepper.getSelectedIndex()).toBe(0);
    });
  });

  describe('indicator states', () => {
    it('shows the plain number on a completed current step (no edit affordance)', () => {
      host.step0Completed.set(true);
      fixture.detectChanges();

      const indicator = headers()[0];
      expect(indicator.querySelector('.tn-stepper__step-number')).not.toBeNull();
      expect(indicator.querySelector('.tn-stepper__step-edit')).toBeNull();
    });

    it('reveals the edit pencil once a completed step is visited and left', () => {
      host.step0Completed.set(true);
      fixture.detectChanges();

      // Move off step 0 — it becomes visited, completed, and non-current → pencil.
      clickButton('Next');

      const step0 = headers()[0];
      expect(step0.querySelector('.tn-stepper__step-edit')).not.toBeNull();
      expect(step0.querySelector('.tn-stepper__step-number')).toBeNull();
    });

    it('keeps the number (not the pencil) on a completed step never visited', () => {
      // Step 2 is completed but we stay on step 0, so it was never reached.
      host.step2Completed.set(true);
      fixture.detectChanges();

      const step2 = headers()[2];
      expect(step2.querySelector('.tn-stepper__step-number')).not.toBeNull();
      expect(step2.querySelector('.tn-stepper__step-edit')).toBeNull();
    });

    it('renders the error glyph and errorMessage for a step in error', () => {
      host.step1Error.set(true);
      host.step1ErrorMessage.set('Two disks required');
      fixture.detectChanges();

      const step1 = headers()[1];
      expect(step1.querySelector('.tn-stepper__step-error')).not.toBeNull();
      expect(step1.querySelector('.tn-stepper__step-error-message')?.textContent?.trim()).toBe(
        'Two disks required',
      );
    });
  });

  describe('orientation', () => {
    it('is horizontal by default', async () => {
      const stepper = await loader.getHarness(TnStepperHarness);
      expect(await stepper.getOrientation()).toBe('horizontal');
    });

    it('is vertical when orientation="vertical"', async () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      const stepper = await loader.getHarness(TnStepperHarness);
      expect(await stepper.getOrientation()).toBe('vertical');
    });

    it('resolves "auto" to horizontal on a wide viewport (jsdom default)', async () => {
      host.orientation.set('auto');
      fixture.detectChanges();

      const stepper = await loader.getHarness(TnStepperHarness);
      expect(await stepper.getOrientation()).toBe('horizontal');
    });
  });

  describe('accessibility', () => {
    it('marks the active step with aria-current="step"', () => {
      const [first, second] = headers();
      expect(first.getAttribute('aria-current')).toBe('step');
      expect(second.getAttribute('aria-current')).toBeNull();
    });

    it('marks linear-gated steps as aria-disabled and removes them from the tab order', () => {
      host.linear.set(true);
      fixture.detectChanges();

      // Step 0 is active and selectable; step 2 is gated (step 0 incomplete).
      const [first, , third] = headers();
      expect(first.getAttribute('aria-disabled')).toBeNull();
      expect(first.getAttribute('tabindex')).toBe('0');
      expect(third.getAttribute('aria-disabled')).toBe('true');
      expect(third.getAttribute('tabindex')).toBe('-1');
    });
  });
});
