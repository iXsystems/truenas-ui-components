import { InjectionToken, computed, inject, isSignal, signal } from '@angular/core';
import type { Signal } from '@angular/core';

/**
 * Every generic name this library falls back to when a caller names neither
 * `ariaLabel` nor `ariaLabelledby`, in one bundle a consumer provides once.
 *
 * WHY A TOKEN AND NOT CONSTANTS ALONE
 * -----------------------------------
 * The constants below are English, and a spinner announcing "Loading" to a
 * screen reader in a Spanish app is the same untranslated-chrome bug that
 * `TN_SELECT_LABELS` and `TN_TABLE_LABELS` were added for: a string this
 * library renders into a consumer's UI has to be translatable, and the only
 * route to these was an `ariaLabel` on every single call site. In webui that
 * came to nineteen spinners and nineteen bars each carrying an identical
 * `[ariaLabel]="'Loading' | translate"` — the copy-on-every-instance shape
 * those two tokens already exist to remove.
 *
 * A per-instance `ariaLabel` still wins, and is still the right answer wherever
 * a name can say WHAT is loading or WHAT is open. This token is for the rest:
 * the generic name the component would otherwise render in English.
 *
 * WHY ONE BUNDLE, AND WHICH NAMES ARE IN IT
 * -----------------------------------------
 * Exactly the fallbacks `tnAccessibleName` renders — the four progressbars and
 * the three surfaces — because they already share one rule, and a consumer
 * translating one of them wants all seven. Separate keys rather than one shared
 * string, because the least-bad generic name differs by what the component is
 * ("Progress" for a bar, "Loading" for a spinner, "Dialog" for a dialog), and
 * `tn-branded-spinner` differs again for a reason
 * {@link TN_BRANDED_SPINNER_DEFAULT_LABEL} sets out.
 *
 * Not in it: `TN_SIDE_PANEL_CONTENT_LABEL`, `TN_DRAWER_CONTENT_LABEL`,
 * `TN_TAB_PANEL_CONTENT_LABEL` and `TN_TABLE_SCROLL_REGION_LABEL`. Those name a
 * scrolling REGION rather than the component, each already has a per-instance
 * input a consumer can translate through, and none of them warns — so they are
 * a separate decision from this one rather than part of it.
 *
 * WHAT PROVIDING IT DOES TO THE DEV WARNING
 * -----------------------------------------
 * It stands the warning down for the components whose fallback it supplies.
 * That is the same exception `tn-table-pager` already has, for the same reason,
 * written out at `resolvedTablePaginationLabel`: a name the consumer configured
 * is a DESIGNED name, not a last resort for one someone forgot, so warning
 * about it fires on the ordinary case and teaches readers to ignore the warning
 * where it means something. Registering this provider is a deliberate app-wide
 * decision about what an unnamed spinner or surface should say; the warning has
 * been heard, and an app that has answered it should not have every test that
 * renders a spinner fail on the answer.
 *
 * The half of `tnAccessibleName` that is NOT about the warning is unchanged: an
 * explicit `ariaLabel` still always survives, and the fallback — configured or
 * not — is still withheld beside an `ariaLabelledby`, so a dangling IDREF still
 * fails its axe name rule loudly instead of being masked by a name that says
 * nothing.
 *
 * Unlike its neighbours in this folder (`accessible-name.ts`, `live-region.ts`),
 * this file IS part of the public API: it is how a consumer answers the
 * question those two only ask.
 */
export interface TnFallbackLabels {
  /** Fallback name for `tn-spinner`. */
  spinner: string;
  /** Fallback name for `tn-branded-spinner`. */
  brandedSpinner: string;
  /** Fallback name for `tn-progress-bar`. */
  progressBar: string;
  /** Fallback name for `tn-particle-progress-bar`. */
  particleProgressBar: string;
  /** Fallback name for the `tn-dialog-shell` surface itself, for a dialog with no `title`. */
  dialog: string;
  /** Fallback name for the `tn-side-panel` surface itself, for a panel with no `title`. */
  sidePanel: string;
  /** Fallback name for `tn-drawer`, in both of its modes. */
  drawer: string;
}

/**
 * The accessible name a spinner falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#202). Same reasoning as
 * {@link TN_PROGRESS_BAR_DEFAULT_LABEL}, and the case is sharper here: the
 * spinner defaults to indeterminate mode, so its unnamed default rendering
 * reached assistive technology as a progressbar with neither a name nor a
 * value.
 *
 * `branded-spinner.component.ts` already fell back this way —
 * `ariaLabel() || "Loading..."` inline — so a fallback is the shape this
 * library had already settled on; what it lacked was the warning. It has both
 * since #206, through the same `tnAccessibleName` that component uses, which is
 * why the two constants sit side by side and differ.
 */
export const TN_SPINNER_DEFAULT_LABEL = 'Loading';

/**
 * The name `tn-branded-spinner` falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby`. Same reasoning as
 * {@link TN_SPINNER_DEFAULT_LABEL} and {@link TN_PROGRESS_BAR_DEFAULT_LABEL}.
 *
 * It differs from `TN_SPINNER_DEFAULT_LABEL` — `"Loading..."` against
 * `"Loading"` — only because this is the string the component already rendered,
 * inline in its host binding, before #206 gave it the shared resolver. Aligning
 * the two would change what a screen reader announces for every unnamed branded
 * spinner already in the wild, which is a louder change than the consistency
 * fix it would be part of. Exported so specs assert against it by name rather
 * than by a copied string literal.
 */
export const TN_BRANDED_SPINNER_DEFAULT_LABEL = 'Loading...';

/**
 * The accessible name a bar falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#202).
 *
 * Deliberately generic, and deliberately not silent: the host carries
 * `role="progressbar"` unconditionally, so without a fallback the default
 * rendering is a progressbar assistive technology announces with no name at all
 * — "progress bar, 40%", with nothing to say what is progressing. The
 * alternative fix, withholding the role until there is a name for it, trades
 * that for no announcement whatever, which is worse: a screen reader would not
 * learn that anything is in progress, and on a determinate bar it would lose
 * the value too.
 *
 * A generic name is still a poor one, so it is paired with the dev-mode warning
 * `tnAccessibleName` raises. Exported so specs assert against it by name rather
 * than by a copied string literal.
 */
export const TN_PROGRESS_BAR_DEFAULT_LABEL = 'Progress';

/**
 * The accessible name `tn-particle-progress-bar` falls back to when the caller
 * names neither `ariaLabel` nor `ariaLabelledby` (#209).
 *
 * The same string and the same reasoning as
 * {@link TN_PROGRESS_BAR_DEFAULT_LABEL} next door, and deliberately a separate
 * constant rather than an alias of it: `tnAccessibleName` takes a fallback PER
 * COMPONENT because the least-bad generic name differs by what the component is
 * ("Progress" for a bar, "Loading" for a spinner), and sharing the binding would
 * make a future divergence in one a silent change to the other. Exported so
 * specs assert against it by name rather than by a copied string literal.
 */
export const TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL = 'Progress';

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
 * The accessible name a drawer falls back to when the caller names neither
 * `ariaLabel` nor `ariaLabelledby` (#214).
 *
 * `ariaLabel` defaults to `undefined`, so the DEFAULT rendering in `over` mode
 * was a `role="dialog"` with `aria-modal="true"` and no name — measured as an
 * `aria-dialog-name` violation. In `side` mode the same omission leaves a
 * `role="navigation"` landmark unnamed, which axe does not report while there is
 * only one of them on the page, and which stops telling them apart the moment
 * there are two.
 *
 * One fallback for both modes rather than one per mode: the drawer is the same
 * surface either way, the name answers the same question ("what is this?"), and
 * a rule that changes with the mode is one more thing for a caller to be wrong
 * about. A generic name is still a poor one, so it is paired with the dev-mode
 * warning `tnAccessibleName` raises.
 *
 * Exported so specs assert against it by name rather than by a copied literal.
 */
export const TN_DRAWER_DEFAULT_LABEL = 'Drawer';

/** English defaults used when no {@link TN_FALLBACK_LABELS} provider is registered. */
export const TN_DEFAULT_FALLBACK_LABELS: TnFallbackLabels = {
  spinner: TN_SPINNER_DEFAULT_LABEL,
  brandedSpinner: TN_BRANDED_SPINNER_DEFAULT_LABEL,
  progressBar: TN_PROGRESS_BAR_DEFAULT_LABEL,
  particleProgressBar: TN_PARTICLE_PROGRESS_BAR_DEFAULT_LABEL,
  dialog: TN_DIALOG_SHELL_DEFAULT_LABEL,
  sidePanel: TN_SIDE_PANEL_DEFAULT_LABEL,
  drawer: TN_DRAWER_DEFAULT_LABEL,
};

/**
 * What the token resolves to when nobody provided it — a COPY of
 * {@link TN_DEFAULT_FALLBACK_LABELS} rather than that object itself, and the
 * difference is the whole of how `configured` below is decided.
 *
 * Comparing against the exported constant would make a consumer who provides it
 * deliberately — `{ provide: TN_FALLBACK_LABELS, useValue: TN_DEFAULT_FALLBACK_LABELS }`,
 * which is what a test environment mirroring an app's providers writes — read as
 * nobody having provided anything. Held privately, this object is reachable only
 * by not providing one, so identity answers exactly the question being asked.
 */
const builtInLabels: TnFallbackLabels = { ...TN_DEFAULT_FALLBACK_LABELS };

/**
 * DI token for the app-wide fallback names above. Provide either a static
 * object or a `Signal<TnFallbackLabels>` — the latter lets every component
 * react to language changes when the consumer wires it up to an i18n service.
 *
 * An `ariaLabel` on a particular instance still wins over these, and is still
 * what to reach for when a name can say what is loading or what is open.
 */
export const TN_FALLBACK_LABELS = new InjectionToken<TnFallbackLabels | Signal<TnFallbackLabels>>(
  'TN_FALLBACK_LABELS',
  { providedIn: 'root', factory: () => builtInLabels },
);

/** One component's fallback name, and where it came from. */
export interface TnFallbackName {
  /** The name to render when the caller names neither input. */
  label: Signal<string>;
  /**
   * Whether that name came from a consumer's provider rather than this
   * library's English default — which is what decides whether an unnamed
   * instance warns. See the file comment above.
   */
  configured: boolean;
}

/**
 * Reads one component's fallback name out of {@link TN_FALLBACK_LABELS}.
 *
 * Not `injectTnLabels`, which normalizes the token to a Signal and drops the
 * value it started from: telling a configured bundle from the built-in one is an
 * identity check against `builtInLabels`, so this needs the raw injected value.
 * A consumer who provides a bundle equal to the defaults — the exported constant
 * included — still counts as configured, which is the right way round: they said
 * so on purpose.
 *
 * **Must be called from an injection context.**
 */
export function injectTnFallbackName(key: keyof TnFallbackLabels): TnFallbackName {
  const provided = inject(TN_FALLBACK_LABELS);
  const labels = isSignal(provided) ? provided : signal(provided).asReadonly();

  return {
    label: computed(() => labels()[key]),
    configured: provided !== builtInLabels,
  };
}
