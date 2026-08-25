import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TnDialogShellComponent, TN_DIALOG_CHROME_LABELS, type TnDialogChromeLabels } from './dialog-shell.component';
import { TnDialogHarness } from './dialog.harness';

/**
 * The close and fullscreen labels used to be English literals in the template with no input to
 * bind, so a translated app could not reach them at all. These pin the DI route that replaced them.
 */
describe('TnDialogShellComponent labels', () => {
  const french: TnDialogChromeLabels = {
    close: 'Fermer la boîte de dialogue',
    enterFullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
  };

  function setup(labels?: TnDialogChromeLabels | ReturnType<typeof signal<TnDialogChromeLabels>>) {
    TestBed.configureTestingModule({
      imports: [TnDialogShellComponent],
      providers: [
        // `config` must be present: the component reads `ref.config.ariaLabel` unguarded.
        { provide: DialogRef, useValue: { close: () => {}, config: {} } },
        { provide: DIALOG_DATA, useValue: {} },
        ...(labels ? [{ provide: TN_DIALOG_CHROME_LABELS, useValue: labels }] : []),
      ],
    });
    const fixture = TestBed.createComponent(TnDialogShellComponent);
    fixture.componentRef.setInput('showFullscreenButton', true);
    fixture.detectChanges();
    return fixture;
  }

  const closeLabel = (fixture: ReturnType<typeof setup>): string | null =>
    fixture.nativeElement.querySelector('.tn-dialog__close')?.getAttribute('aria-label') ?? null;

  const fullscreenLabel = (fixture: ReturnType<typeof setup>): string | null =>
    fixture.nativeElement.querySelector('.tn-dialog__fullscreen')?.getAttribute('aria-label') ?? null;

  /** Drives the one label in this token that branches on component state. */
  function setFullscreen(fixture: ReturnType<typeof setup>, value: boolean): void {
    fixture.componentInstance.isFullscreen.set(value);
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('falls back to the English defaults when no token is provided', () => {
    expect(closeLabel(setup())).toBe('Close dialog');
  });

  it('renders the app-wide close label from a plain-object token', () => {
    expect(closeLabel(setup(french))).toBe('Fermer la boîte de dialogue');
  });

  it('names the fullscreen toggle for the action it performs, in both states', () => {
    const fixture = setup();
    expect(fullscreenLabel(fixture)).toBe('Enter fullscreen');

    setFullscreen(fixture, true);

    expect(fullscreenLabel(fixture)).toBe('Exit fullscreen');
  });

  it('takes both fullscreen labels from the token', () => {
    const fixture = setup(french);
    expect(fullscreenLabel(fixture)).toBe('Plein écran');

    setFullscreen(fixture, true);

    expect(fullscreenLabel(fixture)).toBe('Quitter le plein écran');
  });

  // The regression this pins: `isFullscreen()` used to string-compare the button's `aria-label`
  // to 'Exit fullscreen', so providing this very token — the whole point of it — made the harness
  // answer `false` for a dialog that was fullscreen, silently, in every translated app.
  it('reports fullscreen to the harness even when the labels are translated', async () => {
    const fixture = setup(french);
    // `harnessForFixture` rather than a loader: the fixture's own root element IS the
    // `tn-dialog-shell` host here, and a loader only searches inside it.
    const dialog = await TestbedHarnessEnvironment.harnessForFixture(fixture, TnDialogHarness);
    expect(await dialog.isFullscreen()).toBe(false);

    setFullscreen(fixture, true);

    expect(await dialog.isFullscreen()).toBe(true);
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnDialogChromeLabels>({
      close: 'Close dialog', enterFullscreen: 'Enter fullscreen', exitFullscreen: 'Exit fullscreen',
    });
    const fixture = setup(labels);
    expect(closeLabel(fixture)).toBe('Close dialog');

    labels.set(french);
    fixture.detectChanges();

    expect(closeLabel(fixture)).toBe('Fermer la boîte de dialogue');
  });
});
