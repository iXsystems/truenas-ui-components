import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, computed, effect, input, signal, inject } from '@angular/core';
import type { OnInit} from '@angular/core';
import { tnAccessibleName } from '../a11y/accessible-name';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

let nextUniqueId = 0;

/**
 * The accessible name a dialog falls back to when it renders no `title` and the
 * caller named it through neither this component nor the `DialogConfig` (#219).
 *
 * `title` defaults to `''`, so the DEFAULT rendering of this component put an
 * empty `<h2>` in the header and left the CDK container with no naming
 * attribute at all — measured as `empty-heading` on the heading and
 * `aria-dialog-name` on the dialog. A dialog with no name is announced as
 * "dialog" and nothing else, which is the whole of what a screen-reader user is
 * told about a surface that just took over the page and trapped their focus.
 *
 * "Dialog" is a poor name, and says almost exactly what the role already says.
 * It is still better than the two alternatives: leaving the surface unnamed, or
 * withholding `role="dialog"` until there is a name — the latter would move a
 * listener into a focus trap with no announcement that anything had opened. So
 * it is paired with the dev-mode warning `tnAccessibleName` raises, which is
 * what keeps the fallback from becoming a quiet way to ship a nameless dialog.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_DIALOG_SHELL_DEFAULT_LABEL = 'Dialog';

/**
 * The first value that is a name, or `null` if none of them is one.
 *
 * Blank is not a name — the rule `tnAccessibleName` already applies to what it
 * is handed, and this is the same rule applied one step earlier, while the
 * routes are still being chosen between. `??` would answer that a blank input
 * had been "provided" and stop there, so an empty `ariaLabel` on the shell
 * would shadow a real one passed to `TnDialog.open` and the dialog would take
 * the generic fallback instead — the one case where the fallback is worse than
 * doing nothing. Blank `ariaLabelledby` is the same shape and worse in effect:
 * it would clear the IDREF the config had put on the container.
 */
function firstNonBlank(...values: (string | null | undefined)[]): string | null {
  return values.find((value) => (value ?? '').trim() !== '') ?? null;
}

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
   * Accessible name for the dialog itself, for a dialog that renders no `title`.
   *
   * A `title` outranks it: the heading is what the user can see, and
   * `aria-labelledby` wins the ARIA name calculation while it resolves. The
   * attribute is still rendered beside the heading rather than suppressed — see
   * `tnAccessibleName`, which owns that rule for every component in this
   * library, and the reason it is safer than the alternative.
   */
  ariaLabel = input<string | null>(null);

  /**
   * IDREF naming the dialog from text elsewhere on the page, for a dialog that
   * renders no `title`. Same precedence: a `title` wins, because it is the
   * visible heading.
   */
  ariaLabelledby = input<string | null>(null);

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

  /**
   * Whether there is a heading to render, and to name the dialog from.
   *
   * Trimmed, because a whitespace-only title renders a heading that looks empty
   * to a sighted user and names the dialog with nothing — which is the state
   * this ticket fixed, arriving by a second route.
   */
  protected hasTitle = computed(() => this.title().trim() !== '');

  /**
   * What the dialog is named by, in the order ARIA resolves: the visible
   * heading when there is one, then the caller's IDREF, then one passed to
   * `TnDialog.open` in the `DialogConfig`.
   *
   * The config is consulted so that the fallback below cannot overwrite a name
   * the opener supplied through CDK's own route. Reading it back through
   * `ref.config` rather than leaving CDK's binding to render it, because this
   * component writes both attributes onto that element and would otherwise
   * clear one it did not set.
   */
  private resolvedAriaLabelledby = computed(() => (
    this.hasTitle() ? this.titleId : firstNonBlank(this.ariaLabelledby(), this.ref.config.ariaLabelledBy)
  ));

  /** An explicit label, from this component's input or from the `DialogConfig`. */
  private explicitAriaLabel = computed(
    () => firstNonBlank(this.ariaLabel(), this.ref.config.ariaLabel)
  );

  /**
   * The name to render as `aria-label`, or `null` to render none — and the
   * dev-mode warning when the dialog has no name from any route.
   *
   * Both halves live in `../a11y/accessible-name`, shared with `tn-side-panel`,
   * `tn-drawer` and the three progressbars, where the reasoning for each branch
   * is set out. `title` reaches it as the `ariaLabelledby` above, so a titled
   * dialog is named, takes no fallback and raises no warning.
   */
  private resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-dialog-shell',
    fallback: TN_DIALOG_SHELL_DEFAULT_LABEL,
    activity: 'open',
    hint: 'On this component the usual route is title, which is also the visible heading.',
    ariaLabel: this.explicitAriaLabel,
    ariaLabelledby: this.resolvedAriaLabelledby,
  });

  constructor() {
    // The CDK dialog container is what carries `role="dialog"`, and it is an
    // ANCESTOR of this component rather than part of its template — so the name
    // is written onto it here instead of being bound in the template. In an
    // effect so a title arriving, or being cleared, after init is reflected.
    effect(() => {
      // Both signals are read before the container is looked up, so that this
      // effect keeps its dependencies even on a run that finds no container and
      // writes nothing.
      const labelledby = this.resolvedAriaLabelledby();
      const label = this.resolvedAriaLabel();
      const container = this.host.nativeElement.closest('cdk-dialog-container');
      if (!container) {
        return;
      }
      // Removed rather than left behind when the value goes away: a dialog
      // whose title is cleared would otherwise keep an `aria-labelledby`
      // pointing at a heading that is no longer rendered, which resolves to
      // nothing and leaves the dialog unnamed.
      this.applyName(container, 'aria-labelledby', labelledby);
      this.applyName(container, 'aria-label', label);
    });
  }

  private applyName(container: Element, attribute: string, value: string | null): void {
    if (value) {
      container.setAttribute(attribute, value);
    } else {
      container.removeAttribute(attribute);
    }
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