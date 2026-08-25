import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TnDialogShellComponent, TN_DIALOG_LABELS, type TnDialogLabels } from './dialog-shell.component';

/**
 * The close and fullscreen labels used to be English literals in the template with no input to
 * bind, so a translated app could not reach them at all. These pin the DI route that replaced them.
 */
describe('TnDialogShellComponent labels', () => {
  const french: TnDialogLabels = {
    close: 'Fermer la boîte de dialogue',
    enterFullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
  };

  function setup(labels?: TnDialogLabels | ReturnType<typeof signal<TnDialogLabels>>) {
    TestBed.configureTestingModule({
      imports: [TnDialogShellComponent],
      providers: [
        // `config` must be present: the component reads `ref.config.ariaLabel` unguarded.
        { provide: DialogRef, useValue: { close: () => {}, config: {} } },
        { provide: DIALOG_DATA, useValue: {} },
        ...(labels ? [{ provide: TN_DIALOG_LABELS, useValue: labels }] : []),
      ],
    });
    const fixture = TestBed.createComponent(TnDialogShellComponent);
    fixture.componentRef.setInput('showFullscreenButton', true);
    fixture.detectChanges();
    return fixture;
  }

  const closeLabel = (fixture: ReturnType<typeof setup>): string | null =>
    fixture.nativeElement.querySelector('.tn-dialog__close')?.getAttribute('aria-label') ?? null;

  afterEach(() => TestBed.resetTestingModule());

  it('falls back to the English defaults when no token is provided', () => {
    expect(closeLabel(setup())).toBe('Close dialog');
  });

  it('renders the app-wide close label from a plain-object token', () => {
    expect(closeLabel(setup(french))).toBe('Fermer la boîte de dialogue');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnDialogLabels>({
      close: 'Close dialog', enterFullscreen: 'Enter fullscreen', exitFullscreen: 'Exit fullscreen',
    });
    const fixture = setup(labels);
    expect(closeLabel(fixture)).toBe('Close dialog');

    labels.set(french);
    fixture.detectChanges();

    expect(closeLabel(fixture)).toBe('Fermer la boîte de dialogue');
  });
});
