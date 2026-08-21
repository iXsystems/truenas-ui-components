import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component, Directive, input, output, model, computed, effect, inject, signal,
  contentChildren, viewChild, afterNextRender, DestroyRef,
} from '@angular/core';
import type { ElementRef, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { mdiClose } from '@mdi/js';
import { take } from 'rxjs';
import type { Observable } from 'rxjs';
import { tnAccessibleName } from '../a11y/accessible-name';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

/**
 * The accessible name an open panel falls back to when it has no `title` and the
 * caller named neither `ariaLabel` nor `ariaLabelledby` (#214).
 *
 * `title` defaults to `''`, so the DEFAULT rendering of this component was a
 * `role="dialog"` with `aria-labelledby` pointing at an empty `<h2>` — measured
 * as an `aria-dialog-name` violation, alongside `empty-heading`. A dialog with no
 * name is announced as "dialog" and nothing else, which is the whole of what a
 * screen-reader user gets told about a surface that just covered the page.
 *
 * Withholding `role="dialog"` until there is a name would be the other way to
 * clear the rule, and it is worse: the panel traps focus either way, so a
 * listener would be moved into a region with no announcement that anything had
 * opened. A generic name is still a poor one, so it is paired with the dev-mode
 * warning `tnAccessibleName` raises.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_SIDE_PANEL_DEFAULT_LABEL = 'Side panel';

/**
 * Directive to mark an element as a side-panel footer action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-button tnSidePanelAction label="Save" />
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelAction]',
  standalone: true,
})
export class TnSidePanelActionDirective {}

/**
 * Directive to mark an element as a side-panel header action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-icon-button tnSidePanelHeaderAction name="fullscreen" />
 *   Content here
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelHeaderAction]',
  standalone: true,
})
export class TnSidePanelHeaderActionDirective {}

@Component({
  selector: 'tn-side-panel',
  standalone: true,
  imports: [CommonModule, A11yModule, TnIconButtonComponent, TnTestIdDirective],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  host: {
    'class': 'tn-side-panel',
    '[attr.data-tn-panel]': 'panelId',
  },
})
export class TnSidePanelComponent implements OnDestroy {
  private iconRegistry = inject(TnIconRegistryService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  private overlayRef = viewChild.required<ElementRef>('overlay');
  protected initialized = signal(false);

  // Two-way bindable via [(open)]
  open = model<boolean>(false);

  // Inputs
  title = input<string>('');
  width = input<string>('480px');
  hasBackdrop = input<boolean>(true);
  closeOnBackdropClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  /**
   * Optional gate evaluated before a user-initiated close (× button, backdrop click,
   * or Escape). Return an observable resolving to `false` to veto the close — e.g. to
   * prompt about unsaved changes and keep the panel open if the user cancels. The
   * observable is expected to emit once. Programmatic `open` changes made by the host
   * bypass this guard; when unset, the panel closes immediately.
   */
  closeGuard = input<(() => Observable<boolean>) | undefined>(undefined);
  /**
   * Test-id applied to the panel's root overlay element. Rendered under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<TnTestIdValue>(undefined);
  /**
   * Test-id applied to the panel's close (×) button.
   */
  closeButtonTestId = input<string | undefined>(undefined);

  /**
   * Accessible name for the close button. Defaults to "Dismiss"; override to translate it, or to
   * name what is being closed ("Close Add Dataset form") — a screen-reader user tabbing to it out
   * of context otherwise hears only "Dismiss".
   */
  closeButtonAriaLabel = input<string>('Dismiss');

  /**
   * Accessible name for the panel itself, for a panel that renders no `title`.
   *
   * A `title` outranks it: the heading is what the user can see, and
   * `aria-labelledby` wins the ARIA name calculation while it resolves. The
   * attribute is still rendered beside the heading rather than suppressed — see
   * `tnAccessibleName`, which owns that rule for every component in this
   * library, and the reason it is safer than the alternative.
   */
  ariaLabel = input<string | null>(null);

  /**
   * IDREF naming the panel from text elsewhere on the page, for a panel that
   * renders no `title`. Same precedence: a `title` wins, because it is the
   * visible heading.
   */
  ariaLabelledby = input<string | null>(null);

  // Outputs
  opened = output<void>();
  closed = output<void>();

  // Content projection queries
  private actionContent = contentChildren(TnSidePanelActionDirective);
  protected hasActions = computed(() => this.actionContent().length > 0);

  // Unique IDs for aria-labelledby and portal correlation
  readonly panelId = `tn-side-panel-${Math.random().toString(36).substring(2, 9)}`;
  readonly titleId = `${this.panelId}-title`;

  /**
   * Whether there is a heading to render, and to name the dialog from.
   *
   * Trimmed, because a whitespace-only title renders a heading that looks empty
   * to a sighted user and names the dialog with nothing — which is the state
   * that failed `aria-dialog-name` before #214, arriving by a second route.
   */
  protected hasTitle = computed(() => this.title().trim() !== '');

  /**
   * What the dialog is named by, in the order ARIA resolves: the visible heading
   * when there is one, the caller's IDREF otherwise.
   */
  protected resolvedAriaLabelledby = computed(
    () => (this.hasTitle() ? this.titleId : this.ariaLabelledby())
  );

  /**
   * The name to render as `aria-label`, or `null` to render none — and the
   * dev-mode warning when the panel has no name from any route.
   *
   * Both halves live in `../a11y/accessible-name`, shared with the three
   * progressbars, where the reasoning for each branch is set out. `title` reaches
   * it as the `ariaLabelledby` above, so a titled panel is named, takes no
   * fallback and raises no warning.
   */
  protected resolvedAriaLabel = tnAccessibleName({
    selector: 'tn-side-panel',
    fallback: TN_SIDE_PANEL_DEFAULT_LABEL,
    activity: 'open',
    hint: 'On this component the usual route is title, which is also the visible heading.',
    ariaLabel: this.ariaLabel,
    ariaLabelledby: this.resolvedAriaLabelledby,
  });

  // Focus restoration
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    this.registerMdiIcons();

    effect(() => {
      if (this.open()) {
        this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
      }
    });

    afterNextRender(() => {
      this.document.body.appendChild(this.overlayRef().nativeElement);
      this.initialized.set(true);
    });
  }

  ngOnDestroy(): void {
    this.overlayRef().nativeElement.remove();
  }

  protected dismiss(): void {
    const guard = this.closeGuard();
    if (!guard) {
      this.open.set(false);
      return;
    }

    guard()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((canClose) => {
        if (canClose) {
          this.open.set(false);
        }
      });
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.dismiss();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape() && this.open()) {
      event.stopPropagation();
      this.dismiss();
    }
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }

    if (this.open()) {
      this.opened.emit();
    } else {
      this.closed.emit();
      this.restoreFocus();
    }
  }

  private restoreFocus(): void {
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'close': mdiClose,
    };

    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      },
    });
  }
}
