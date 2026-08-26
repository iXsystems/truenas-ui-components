import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  TN_DEFAULT_FALLBACK_LABELS,
  TN_FALLBACK_LABELS,
  type TnFallbackLabels,
} from './fallback-labels';
import { TnParticleProgressBarComponent } from '../progress-bar/particle-progress-bar.component';
import { TnProgressBarComponent } from '../progress-bar/progress-bar.component';
import { TnSidePanelComponent } from '../side-panel/side-panel.component';
import { TnBrandedSpinnerComponent } from '../spinner/branded-spinner.component';
import { TnSpinnerComponent } from '../spinner/spinner.component';

/**
 * `TN_FALLBACK_LABELS` is what a consumer provides so the four `role="progressbar"`
 * components fall back to a name in THEIR language rather than to this library's
 * English. These pin the four guarantees it is for: the no-provider default, a plain
 * object, a live Signal, and the dev warning standing down once a fallback is
 * configured — plus the two halves of `tnAccessibleName` that must NOT change with it.
 */
@Component({
  selector: 'tn-progress-labels-host',
  standalone: true,
  imports: [
    TnSpinnerComponent,
    TnBrandedSpinnerComponent,
    TnProgressBarComponent,
    TnParticleProgressBarComponent,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-spinner />
    <tn-branded-spinner />
    <tn-progress-bar />
    <tn-particle-progress-bar />
    <tn-spinner class="named" [ariaLabel]="ariaLabel()" />
    <tn-spinner class="labelledby" [ariaLabelledby]="'heading'" />
  `
})
class LabelsHostComponent {
  ariaLabel = signal<string | null>('Loading datasets');
}

describe('TN_FALLBACK_LABELS', () => {
  const french: TnFallbackLabels = {
    spinner: 'Chargement',
    brandedSpinner: 'Chargement...',
    progressBar: 'Progression',
    particleProgressBar: 'Progression',
    dialog: 'Boîte de dialogue',
    sidePanel: 'Panneau latéral',
    drawer: 'Tiroir',
  };

  type Fixture = ComponentFixture<LabelsHostComponent>;

  beforeEach(() => {
    // jsdom has no canvas, so `tn-particle-progress-bar`'s first `clearRect`
    // would throw before any of these assertions ran. Same stub, and the same
    // reasoning, as `particle-progress-bar-a11y.spec.ts`: this file is about the
    // names in the DOM, so it needs the real template rendered.
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      clearRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), fillStyle: ''
    } as unknown as CanvasRenderingContext2D);
    jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(123);
  });

  afterEach(() => jest.restoreAllMocks());

  function setup(
    labels?: TnFallbackLabels | ReturnType<typeof signal<TnFallbackLabels>>,
  ): Fixture {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent],
      providers: labels ? [{ provide: TN_FALLBACK_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  const nameOf = (fixture: Fixture, selector: string): string | null =>
    (fixture.nativeElement as HTMLElement).querySelector(selector)!.getAttribute('aria-label');

  it('names an unnamed side panel from the bundle, and warns without one', () => {
    // The three surfaces take the same rule as the progressbars; the panel stands
    // in for all three, since what differs between them is only the key.
    const withBundle = TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      providers: [{ provide: TN_FALLBACK_LABELS, useValue: french }],
    }).createComponent(TnSidePanelComponent);
    withBundle.componentRef.setInput('open', true);
    withBundle.detectChanges();

    // The overlay is portaled to document.body, not left in the fixture — the same
    // reason `side-panel-a11y.spec.ts` reaches for it there.
    expect(document.body.querySelector('.tn-side-panel__overlay')?.getAttribute('aria-label'))
      .toBe('Panneau latéral');
  });

  it('falls back to the English defaults when no provider is registered', () => {
    const fixture = setup();

    expect(nameOf(fixture, 'tn-spinner')).toBe(TN_DEFAULT_FALLBACK_LABELS.spinner);
    expect(nameOf(fixture, 'tn-branded-spinner')).toBe(TN_DEFAULT_FALLBACK_LABELS.brandedSpinner);
    expect(nameOf(fixture, 'tn-progress-bar')).toBe(TN_DEFAULT_FALLBACK_LABELS.progressBar);
    expect(nameOf(fixture, 'tn-particle-progress-bar'))
      .toBe(TN_DEFAULT_FALLBACK_LABELS.particleProgressBar);
  });

  it('names every unnamed progressbar from a plain-object bundle', () => {
    const fixture = setup(french);

    expect(nameOf(fixture, 'tn-spinner')).toBe('Chargement');
    expect(nameOf(fixture, 'tn-branded-spinner')).toBe('Chargement...');
    expect(nameOf(fixture, 'tn-progress-bar')).toBe('Progression');
    expect(nameOf(fixture, 'tn-particle-progress-bar')).toBe('Progression');
  });

  it('re-renders the names when the bundle is a Signal that changes', () => {
    const labels = signal(TN_DEFAULT_FALLBACK_LABELS);
    const fixture = setup(labels);
    expect(nameOf(fixture, 'tn-spinner')).toBe('Loading');

    labels.set(french);
    fixture.detectChanges();

    expect(nameOf(fixture, 'tn-spinner')).toBe('Chargement');
    expect(nameOf(fixture, 'tn-progress-bar')).toBe('Progression');
  });

  it('lets an explicit ariaLabel win over the provided bundle', () => {
    const fixture = setup(french);

    expect(nameOf(fixture, 'tn-spinner.named')).toBe('Loading datasets');
  });

  // The half of `tnAccessibleName` the token must NOT change: a name here would
  // mask a dangling IDREF with one that says nothing, clean to axe and useless.
  it('still withholds a configured fallback beside an ariaLabelledby', () => {
    expect(nameOf(setup(french), 'tn-spinner.labelledby')).toBeNull();
  });

  it('still withholds the default fallback beside an ariaLabelledby', () => {
    expect(nameOf(setup(), 'tn-spinner.labelledby')).toBeNull();
  });

  describe('the dev-mode warning', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => warn.mockRestore());

    it('fires for an unnamed progressbar while the fallback is this library\'s English', () => {
      setup();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[tn-spinner]'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[tn-progress-bar]'));
    });

    it('stands down once the consumer configures the fallback', () => {
      setup(french);

      expect(warn).not.toHaveBeenCalled();
    });

    it('stands down for a consumer who provides the exported defaults themselves', () => {
      // The case the identity check has to get right: a test environment mirroring
      // an app's providers writes exactly this, and it is still a decision.
      setup(TN_DEFAULT_FALLBACK_LABELS);

      expect(warn).not.toHaveBeenCalled();
    });
  });
});
