import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import type { Observable } from 'rxjs';
import { TnChipInputComponent, TN_CHIP_INPUT_LABELS, type TnChipInputLabels } from './chip-input.component';
import type { TnChipInputOption } from './chip-input.component';
import type { TnOptionsFetchFn } from '../utils/options-data-source';

/**
 * The app-wide label default for `tn-chip-input` — the twin of
 * `autocomplete-labels.spec.ts`. No binding renders whatever
 * `TN_CHIP_INPUT_LABELS` supplies, an explicit `[loadingText]` still wins, and
 * a signal-valued token re-renders when the app switches language.
 *
 * `loading` is the only label the chip input has, and it is on screen only
 * while a `dataSource` request is in flight — so every case here leaves a
 * request hanging rather than answering it.
 */

type Option = TnChipInputOption<string>;

@Component({
  selector: 'tn-chip-input-labels-host',
  standalone: true,
  imports: [TnChipInputComponent],
  template: `
    <tn-chip-input [dataSource]="source" [dataSourceDebounce]="250" [loadingText]="loadingText()" />
  `,
})
class LabelsHostComponent {
  loadingText = signal<string | undefined>(undefined);
  responder: () => Observable<Option[]> = () => of([{ label: 'admins', value: 'admins' }]);
  readonly source: TnOptionsFetchFn<Option> = () => this.responder();
}

describe('TnChipInputComponent labels', () => {
  const french: TnChipInputLabels = { loading: 'Chargement…' };

  let fixture: ComponentFixture<LabelsHostComponent>;

  function setup(
    labels?: TnChipInputLabels | ReturnType<typeof signal<TnChipInputLabels>>,
  ): void {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent],
      providers: labels ? [{ provide: TN_CHIP_INPUT_LABELS, useValue: labels }] : [],
    });
    fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    jest.useFakeTimers();
  }

  /**
   * Open the panel on a page that lands, then type into a request that never
   * answers — one of the states the loading row is rendered in, and the one
   * that exercises the label against rows already on screen.
   */
  function loadingText(): string {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    fixture.componentInstance.responder = () => new Subject<Option[]>();
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    jest.advanceTimersByTime(250);
    fixture.detectChanges();

    const row = TestBed.inject(OverlayContainer).getContainerElement()
      .querySelector('.tn-chip-input__loading');
    return row?.textContent?.trim() ?? '';
  }

  afterEach(() => {
    jest.useRealTimers();
    TestBed.inject(OverlayContainer).ngOnDestroy();
    TestBed.resetTestingModule();
  });

  it('falls back to the English default when no token is provided', () => {
    setup();

    expect(loadingText()).toContain('Loading...');
  });

  it('renders the app-wide text from a plain-object token', () => {
    setup(french);

    expect(loadingText()).toContain('Chargement…');
  });

  it('lets an explicit [loadingText] win over the token', () => {
    setup(french);
    fixture.componentInstance.loadingText.set('Searching the directory…');
    fixture.detectChanges();

    expect(loadingText()).toContain('Searching the directory…');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnChipInputLabels>({ loading: 'Loading...' });
    setup(labels);
    expect(loadingText()).toContain('Loading...');

    labels.set(french);
    fixture.detectChanges();

    expect(TestBed.inject(OverlayContainer).getContainerElement()
      .querySelector('.tn-chip-input__loading')?.textContent).toContain('Chargement…');
  });
});
