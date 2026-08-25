import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, InjectionToken, computed, effect, input, isSignal, signal, inject } from '@angular/core';
import type { OnInit, Signal } from '@angular/core';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

/**
 * Chrome copy `tn-dialog-shell` renders itself. These were baked into the template as English
 * literals, which a consumer could not translate at all — there was no input to bind. Provide
 * {@link TN_DIALOG_LABELS} at the app root to wire them to an i18n service.
 */
export interface TnDialogLabels {
  /** Accessible name for the header close (X) button. */
  close: string;
  /** Accessible name for the fullscreen toggle while the dialog is windowed. */
  enterFullscreen: string;
  /** Accessible name for the fullscreen toggle while the dialog is fullscreen. */
  exitFullscreen: string;
}

/** English defaults used when no `TN_DIALOG_LABELS` provider is registered. */
export const TN_DIALOG_DEFAULT_LABELS: TnDialogLabels = {
  close: 'Close dialog',
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
};

/**
 * DI token for app-wide dialog chrome labels. Provide either a static object or a
 * `Signal<TnDialogLabels>` — the latter lets every dialog react to language changes when the
 * consumer wires it up to an i18n service.
 */
export const TN_DIALOG_LABELS = new InjectionToken<TnDialogLabels | Signal<TnDialogLabels>>(
  'TN_DIALOG_LABELS',
  { providedIn: 'root', factory: () => TN_DIALOG_DEFAULT_LABELS },
);

let nextUniqueId = 0;

@Component({
  selector: 'tn-dialog-shell',
  templateUrl: './dialog-shell.component.html',
  standalone: true,
  imports: [TnTestIdDirective],
  host: {
    'class': 'tn-dialog-shell'
  }
})
export class TnDialogShellComponent implements OnInit {
  private readonly providedLabels = inject(TN_DIALOG_LABELS);

  /**
   * Normalize the injected token into a Signal so consumers can supply either a plain object or
   * a reactive signal (e.g. derived from a TranslateService's onLangChange).
   */
  protected readonly labels: Signal<TnDialogLabels> = isSignal(this.providedLabels)
    ? this.providedLabels
    : signal(this.providedLabels).asReadonly();

  /** Accessible name for the fullscreen toggle, following its current state. */
  protected readonly fullscreenLabel = computed(
    () => (this.isFullscreen() ? this.labels().exitFullscreen : this.labels().enterFullscreen),
  );

  title = input<string>('');
  showFullscreenButton = input<boolean>(false);
  /**
   * Show the header close (X) button. Disable for dialogs that must not be
   * dismissed from the chrome — e.g. a running job that can only be minimized.
   */
  showCloseButton = input<boolean>(true);
  /**
   * Hide the content section. Use when the body is projected through an
   * always-present wrapper whose contents are conditional, so the section is
   * never truly `:empty` (consumers cannot project from inside an `@if`, see
   * the dialog docs). An empty section with no wrapper is hidden automatically
   * via the `:empty` rule in the theme, so this input is only needed for the
   * wrapper case.
   */
  hideContent = input<boolean>(false);
  /** Hide the actions footer. Same wrapper-case rationale as {@link hideContent}. */
  hideActions = input<boolean>(false);
  /**
   * Optional semantic base that scopes the shell's chrome buttons. The close
   * and fullscreen buttons emit `button-close` / `button-fullscreen` by default,
   * or `button-close-<testId>` / `button-fullscreen-<testId>` when a base is
   * provided (useful when more than one dialog can be open).
   */
  testId = input<TnTestIdValue>(undefined);

  /**
   * The `testId` base normalized to a flat segment array. Nothing is dropped
   * here — `composeTestId` (via the `[tnTestId]` directive) filters falsy
   * segments, so an unset base collapses to the bare role (`button-close`).
   */
  private readonly baseSegments = computed<(string | number | null | undefined)[]>(() => {
    const base = this.testId();
    return Array.isArray(base) ? base : [base];
  });

  /**
   * Role-first test-id segments for the close button: `button-close[-<base>]`.
   *
   * The close and fullscreen buttons are fixed dialog chrome, not content
   * children, so the role leads rather than the base (content children are
   * base-first via `scopeTestId`). This keeps every dialog's close button under
   * a shared `button-close-*` prefix — it matches webui's established
   * close-button ids and lets automation target "all close buttons" with one
   * selector.
   */
  protected closeTestId = computed(() => ['close', ...this.baseSegments()]);
  /** Role-first test-id segments for the fullscreen button: `button-fullscreen[-<base>]`. */
  protected fullscreenTestId = computed(() => ['fullscreen', ...this.baseSegments()]);

  /** Stable id for the title heading, referenced by the dialog's aria-labelledby. */
  readonly titleId = `tn-dialog-title-${nextUniqueId++}`;

  isFullscreen = signal<boolean>(false);
  private originalStyles: { [key: string]: string } = {};

  private ref = inject(DialogRef);
  private document = inject(DOCUMENT);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private data = inject(DIALOG_DATA, { optional: true });

  constructor() {
    // Give the CDK dialog container an accessible name by pointing its
    // aria-labelledby at the visible title heading. Tracked in an effect so a
    // title set after init is still reflected.
    effect(() => {
      if (!this.title()) {
        return;
      }
      const container = this.host.nativeElement.closest('cdk-dialog-container');
      container?.setAttribute('aria-labelledby', this.titleId);
    });
  }

  ngOnInit() {
    // Check if dialog was opened in fullscreen mode by looking for existing fullscreen class
    setTimeout(() => {
      const dialogPanel = this.document.querySelector('.tn-dialog-panel');
      if (dialogPanel?.classList.contains('tn-dialog--fullscreen')) {
        this.isFullscreen.set(true);
      }
    });
  }

  close(result?: unknown): void {
    this.ref.close(result);
  }
  
  toggleFullscreen() {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen() {
    const dialogPanel = this.document.querySelector('.tn-dialog-panel') as HTMLElement;

    if (dialogPanel) {
      // Store original styles
      this.originalStyles = {
        panelMaxWidth: dialogPanel.style.maxWidth,
        panelMaxHeight: dialogPanel.style.maxHeight,
        panelWidth: dialogPanel.style.width,
        panelHeight: dialogPanel.style.height,
        panelBorderRadius: dialogPanel.style.borderRadius
      };

      // Apply fullscreen styles
      dialogPanel.style.maxWidth = '100vw';
      dialogPanel.style.maxHeight = '100vh';
      dialogPanel.style.width = '100vw';
      dialogPanel.style.height = '100vh';
      dialogPanel.style.borderRadius = '0';

      // Add fullscreen class
      dialogPanel.classList.add('tn-dialog--fullscreen');

      this.isFullscreen.set(true);
    }
  }

  private exitFullscreen() {
    const dialogPanel = this.document.querySelector('.tn-dialog-panel') as HTMLElement;

    if (dialogPanel) {
      // Restore original styles
      dialogPanel.style.maxWidth = this.originalStyles['panelMaxWidth'] || '90vw';
      dialogPanel.style.maxHeight = this.originalStyles['panelMaxHeight'] || '90vh';
      dialogPanel.style.width = this.originalStyles['panelWidth'] || '';
      dialogPanel.style.height = this.originalStyles['panelHeight'] || '';
      dialogPanel.style.borderRadius = this.originalStyles['panelBorderRadius'] || '8px';

      // Remove fullscreen class
      dialogPanel.classList.remove('tn-dialog--fullscreen');

      this.isFullscreen.set(false);
    }
  }
}