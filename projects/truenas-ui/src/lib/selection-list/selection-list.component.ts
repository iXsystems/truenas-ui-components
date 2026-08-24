
import { Component, ElementRef, input, output, contentChildren, signal, computed, forwardRef, effect, inject } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectTnFormFieldAria } from '../form-field/form-field-context';
import { TnListOptionComponent } from '../list-option/list-option.component';
import { TnTestIdDirective } from '../test-id';

export interface TnSelectionChange {
  source: TnSelectionListComponent;
  options: TnListOptionComponent[];
}

@Component({
  selector: 'tn-selection-list',
  standalone: true,
  imports: [],
  templateUrl: './selection-list.component.html',
  styleUrl: './selection-list.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TnSelectionListComponent),
      multi: true
    }
  ],
  hostDirectives: [{ directive: TnTestIdDirective, inputs: ['tnTestId: testId'] }],
  host: {
    'class': 'tn-selection-list',
    '[class.tn-selection-list--dense]': 'dense()',
    '[class.tn-selection-list--disabled]': 'isDisabled()',
    'role': 'listbox',
    // The naming attributes are NOT host bindings — see `applyName`.
    //
    // The listbox states its own disabled-ness rather than leaving assistive
    // technology to infer it from its children (#225). Inferring is not the same
    // claim and is wrong in two ordinary cases: an empty disabled list has no
    // children to read it off, and a consumer who disables every option
    // individually has not disabled the LIST. `isDisabled()` and not the
    // `disabled` input, so the plain input and `setDisabledState()` reach it by
    // the same route the options do — see the effect in the constructor.
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.aria-multiselectable]': 'multiple()',
    // Both listeners are on the host and rely on bubbling from the options,
    // rather than being bound per option: contentChildren gives components, not
    // template bindings, so there is nowhere to attach a per-option listener
    // without the option knowing about its parent. Keydown bubbles from the
    // focused option to here, which is also what lets tn-list-option keep its
    // own Space/Enter handlers untouched — see onKeydown.
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)'
  }
})
export class TnSelectionListComponent implements ControlValueAccessor {
  dense = input<boolean>(false);
  disabled = input<boolean>(false);
  multiple = input<boolean>(true);
  color = input<'primary' | 'accent' | 'warn'>('primary');

  /**
   * Explicit accessible name for the listbox. Inside a `tn-form-field` with a
   * label this is unnecessary — the field names the list automatically — but a
   * list with neither is announced as an unlabelled listbox.
   *
   * ALIASED to the attribute name, unlike the plain `ariaLabel` most controls in
   * this library take, and the divergence is forced rather than chosen: this
   * component's `role="listbox"` is on the HOST, so `<tn-selection-list
   * aria-label="Mailboxes">` is valid markup that named the list before this
   * input existed. The host binding below rewrites that attribute on every
   * change-detection pass, so an unaliased input would silently STRIP a name
   * that used to work. The alias makes the same markup set the input instead,
   * and the binding writes it straight back.
   */
  ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** Id of visible text naming the listbox. Wins over `ariaLabel` where it resolves. */
  ariaLabelledby = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * The `ariaLabel` input with a blank one normalised away.
   *
   * Blank is not a name: `aria-label=""` names the listbox as emptily as no
   * attribute at all, while satisfying axe's `aria-input-field-name` rule — a
   * green check on a control a screen reader announces as "listbox".
   *
   * `injectTnFormFieldAria` reads THIS rather than the raw input, and that is
   * load-bearing: it suppresses the field's label whenever the explicit one is
   * truthy, and `'   '` is truthy — so passing the raw input would leave a
   * whitespace-only `aria-label` inside a labelled field with no name from
   * either side. Declared before `fieldAria` because that call captures it.
   */
  private readonly explicitAriaLabel = computed(() => {
    const label = this.ariaLabel();
    return label !== undefined && label.trim() !== '' ? label : undefined;
  });

  /**
   * ARIA wiring from an enclosing `tn-form-field`. Only `labelledby` is read:
   * #235 is about the listbox having no accessible name, and the field's
   * `describedby`/`invalid`/`required` are a separate question this list has
   * never answered either way.
   */
  private readonly fieldAria = injectTnFormFieldAria(this.explicitAriaLabel);

  /** The `aria-label` this component supplies, or `null` when it supplies none. */
  private readonly resolvedAriaLabel = computed(() => this.explicitAriaLabel() ?? null);

  /**
   * The `aria-labelledby` this component supplies, or `null` when it supplies
   * none.
   *
   * The explicit input wins over the enclosing field, so a consumer who points
   * the list at their own visible text keeps it. With neither, a list outside a
   * field gets `null` and stays unnamed — deliberately: a generic fallback
   * ("List") would satisfy axe while announcing nothing the user can act on, and
   * only the consumer knows what this list holds.
   */
  private readonly resolvedAriaLabelledby = computed(() => {
    const labelledby = this.ariaLabelledby();
    if (labelledby !== undefined && labelledby.trim() !== '') {
      return labelledby;
    }
    return this.fieldAria.labelledby();
  });

  private readonly hostElement = inject(ElementRef<HTMLElement>).nativeElement;

  /**
   * The naming attributes this component has written to the host, so that it
   * only ever removes its own. See {@link applyName}.
   */
  private readonly written = new Set<string>();

  selectionChange = output<TnSelectionChange>();

  options = contentChildren(TnListOptionComponent, { descendants: true });

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * The option the user has moved to, and the slot it occupied at the time —
   * or `null` while they have not moved yet.
   *
   * Kept separate from `activeIndex` rather than seeded with a starting value,
   * because "where the user last was" and "where a user who has not arrived yet
   * would land" are different questions and only the second one should follow
   * the selection around. See `activeIndex`.
   *
   * The OPTION and not merely its index, because the options are content
   * children and the caller can add or remove them ABOVE the one the user is
   * standing on. An index survives that edit while quietly changing meaning —
   * it names whichever option shifted into the slot — so the tab stop and the
   * arrow keys' starting point both come away from the option holding focus,
   * and one ArrowDown lands two options from where the user is. A reference
   * cannot drift that way. The index rides along only as the fallback for the
   * one case a reference cannot answer: the option itself being removed.
   */
  private visited = signal<{ option: TnListOptionComponent; index: number } | null>(null);

  /**
   * Which option carries the listbox's single tab stop.
   *
   * Before the user has touched the list this tracks the first selected option,
   * which is what APG asks for — tabbing into a list that already has a
   * selection should land where the user left off rather than at the top. Once
   * they have moved, `visited` pins it and the selection no longer drags the
   * tab stop around underneath them.
   *
   * Resolved against the current options on every read rather than stored, so
   * that a list edited underneath the user still points at the option they were
   * on. Only once that option has left the list is there nothing to resolve,
   * and the remembered slot is the best answer left — clamped, because an index
   * held across a removal otherwise reads past the end of the array.
   */
  private activeIndex = computed(() => {
    const opts = this.options();
    if (opts.length === 0) {
      return -1;
    }

    const visited = this.visited();
    if (visited !== null) {
      const current = opts.indexOf(visited.option);
      return current === -1 ? Math.min(visited.index, opts.length - 1) : current;
    }

    const firstSelected = opts.findIndex(option => option.effectiveSelected());
    return firstSelected === -1 ? 0 : firstSelected;
  });

  /**
   * The option host that currently holds DOM focus, or `null`.
   *
   * Held as an element rather than an index, because the whole point of it is
   * to outlive the option: an index still resolves after a removal, to whatever
   * option moved into that slot.
   */
  private focusedOptionElement: HTMLElement | null = null;

  private onChange = (_: unknown[]) => {};
  private onTouched = () => {};

  constructor() {
    // The naming attributes, written here rather than as host bindings.
    //
    // A `role="listbox"` is an ARIA input field, and one with no accessible name
    // is announced as bare "listbox" — the options say what is IN the list,
    // never what it is FOR (#235).
    //
    // WHY NOT A HOST BINDING, WHICH IS WHAT EVERY OTHER ATTRIBUTE HERE USES
    // ---------------------------------------------------------------------
    // Because the role is on the HOST, `<tn-selection-list aria-label="…">` and
    // `[attr.aria-labelledby]="…"` are valid markup that named this list before
    // it had any naming input at all — and a host binding writes its attribute
    // on every pass whether or not this component has a name to write. Measured
    // on Angular 21: with `[attr.aria-label]` and `[attr.aria-labelledby]` bound
    // in the PARENT template, a host binding of the same attributes ran last and
    // left the element with neither, so the list went from named to unnamed and
    // nothing said so. The parent's write reappeared only on a later pass, and
    // only for the attribute whose bound value had changed.
    //
    // So the rule is ownership rather than precedence: this component writes an
    // attribute when it has a name for it, and removes it only if the value it
    // removes is one this component put there. Anything a consumer set by any
    // route is left alone.
    //
    // Both attributes are written, rather than one suppressing the other,
    // because ARIA prefers `aria-labelledby` only while it RESOLVES — dropping
    // an explicit `aria-label` beside a dangling IDREF would leave the list
    // unnamed in exactly the case where a name was supplied. Same reasoning as
    // `a11y/accessible-name.ts`.
    effect(() => {
      this.applyName('aria-label', this.resolvedAriaLabel());
      this.applyName('aria-labelledby', this.resolvedAriaLabelledby());
    });

    // Push what the list decides for all of its options down onto each of them,
    // re-running both when the decision changes and when the set of options
    // does — an option added after the list was rendered has to arrive carrying
    // the list's current state rather than its own defaults.
    //
    // `isDisabled()` and not the `disabled` input, so that the plain input and
    // `setDisabledState()` reach the options by the same route and cannot come
    // apart again (#221). It lands on `option.listDisabled`, a signal of the
    // option's own that is ORed with its `[disabled]` input rather than
    // overwriting it — see TnListOptionComponent.effectiveDisabled.
    effect(() => {
      const opts = this.options();
      const currentColor = this.color();
      const disabled = this.isDisabled();
      opts.forEach(option => {
        option.selectionList = this;
        option.internalColor.set(currentColor);
        option.listDisabled.set(disabled);
      });
    });

    // The roving tabindex itself: one stop for the whole listbox, moved rather
    // than added to. Written from an effect because it has to re-run both when
    // the active option changes and when the set of options does — an option
    // added after the list was rendered would otherwise arrive with no tabindex
    // assigned and fall back to its standalone value, putting a second stop in
    // the tab order.
    effect(() => {
      const opts = this.options();
      const active = this.activeIndex();
      opts.forEach((option, index) => {
        option.rovingTabindex.set(index === active ? 0 : -1);
      });

      // Moving the tab STOP is not enough when the option that held focus is
      // the one that went away: the browser drops focus to <body>, so a
      // keyboard user who filtered the list from inside it finds their next Tab
      // starting at the top of the document. Put focus on whichever option the
      // stop landed on, which is where they were.
      //
      // Both halves of the test carry weight. `isConnected` distinguishes an
      // option that was REMOVED from one the user merely left, and
      // `document.body` says nothing else has claimed focus since — without it
      // an unrelated re-render could pull focus away from elsewhere on the page.
      const lost = this.focusedOptionElement;
      if (lost !== null && !lost.isConnected) {
        this.focusedOptionElement = null;
        if (active !== -1 && document.activeElement === document.body) {
          opts[active].focus();
        }
      }
    });
  }

  /**
   * ArrowUp / ArrowDown / Home / End — unmodified, and pressed on an option
   * host — and deliberately nothing else.
   *
   * Space and Enter are absent because `tn-list-option` has handled them since
   * before this component had any keyboard handling at all, and its keydown
   * bubbles up to here. Toggling from both places would toggle twice — select
   * then immediately deselect — which reads as the key doing nothing rather
   * than as a bug, so it is worth stating why it is missing rather than leaving
   * a later reader to add it.
   *
   * Every other key is left alone, Tab included: `preventDefault()` on an
   * unrecognised key is how a widget traps a keyboard user inside it.
   *
   * Navigation is not gated on `isDisabled()`, because moving focus selects
   * nothing: a disabled list a user can still read through is the same
   * reasoning that has the arrow keys visit disabled options at all.
   *
   * That is a statement about NAVIGATION only, and deliberately not the wider
   * claim that a disabled list can be toggled. It cannot: `isDisabled()` is
   * pushed onto every option's `listDisabled` by the effect in the constructor
   * (#221), so the option's own guard refuses the toggle whichever route asked
   * for it — mouse, Space, Enter or a reactive form. What a disabled list still
   * allows is moving through it, which selects nothing.
   *
   * Only keys pressed ON an option host are the listbox's. The handler is on
   * the host and hears everything that bubbles through it, so without that test
   * a consumer who projects a focusable control into an option — a text input,
   * a slider — would have Home and End taken off its caret and the arrows taken
   * off its value, and get a `preventDefault()` for it. Nothing in this library
   * projects such a control today, which is why this is a target check rather
   * than a redesign.
   */
  onKeydown(event: KeyboardEvent): void {
    const opts = this.options();
    const count = opts.length;
    if (count === 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!opts.some(option => option.elementRef.nativeElement === target)) {
      return;
    }

    // A MODIFIED navigation key belongs to someone else. Ctrl/Cmd+Home and
    // Ctrl/Cmd+End are the browser's jump to the top and bottom of the
    // document, and Shift+ArrowDown is APG's extend-the-selection, which this
    // listbox does not implement — claiming any of them swallows a shortcut and
    // gives nothing back. Tested inline rather than through
    // `@angular/cdk/keycodes`, matching `select.component.ts`.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const current = this.activeIndex();
    let next: number;

    switch (event.key) {
      case 'ArrowDown':
        next = (current + 1) % count;
        break;
      case 'ArrowUp':
        next = (current - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }

    // After the switch, so it happens only for the keys actually handled — and
    // only once the list is known to be non-empty, so a swallowed key always
    // has an option to land on. It may land on the one already focused: End at
    // the last option, Home at the first, either arrow on a one-option list.
    // Consuming those is still right — the key IS the listbox's and its default
    // action is scrolling the page out from under a user who asked to move
    // within the list.
    event.preventDefault();
    this.visited.set({ option: opts[next], index: next });
    opts[next].focus();
  }

  /**
   * Keep the tab stop under whichever option actually holds focus.
   *
   * Covers the routes into the list that are not the arrow keys — a click, and
   * a Tab that lands here — so that leaving the list and coming back returns to
   * the option the user was last on, rather than to the one the arrow keys
   * happened to leave the index at.
   *
   * `contains` rather than an identity check on the target, because focus can
   * land on something projected into the option rather than on the option host.
   */
  onFocusIn(event: FocusEvent): void {
    const target = event.target as Node | null;
    if (target === null) {
      return;
    }

    const opts = this.options();
    const index = opts
      .findIndex(option => (option.elementRef.nativeElement as HTMLElement).contains(target));

    if (index !== -1) {
      this.visited.set({ option: opts[index], index });
      this.focusedOptionElement = opts[index].elementRef.nativeElement as HTMLElement;
    }
  }

  /**
   * Forget the focused option once focus leaves it under its own steam.
   *
   * Guarded on the option still being in the document, because a `focusout`
   * fired BY a removal — Firefox fires one, Chrome does not — is exactly the
   * case the restore in the constructor exists for, and clearing on it would
   * defeat that restore in one browser and not the other.
   */
  onFocusOut(event: FocusEvent): void {
    const from = event.target as HTMLElement | null;
    if (from !== null && from.isConnected) {
      this.focusedOptionElement = null;
    }
  }

  /**
   * Write one naming attribute to the host, or take back one this component
   * previously wrote — and never touch one it did not.
   *
   * The `written` guard is the whole point: without it, `value === null` means
   * "remove", which removes a name the consumer put on the element directly.
   * With it, `null` means "this component has nothing to say about this
   * attribute", and whatever is there stays there. See the constructor.
   */
  private applyName(attribute: string, value: string | null): void {
    if (value !== null) {
      this.hostElement.setAttribute(attribute, value);
      this.written.add(attribute);
      return;
    }
    if (this.written.has(attribute)) {
      this.hostElement.removeAttribute(attribute);
      this.written.delete(attribute);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: unknown[]): void {
    if (value) {
      const opts = this.options();
      opts.forEach(option => {
        option.internalSelected.set(value.includes(option.value()));
      });
    }
  }

  registerOnChange(fn: (value: unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Records the form's state and stops there — the effect in the constructor is
   * what reaches the options, via `isDisabled()`.
   *
   * It used to also write each `option.internalDisabled` directly, which is the
   * only reason this route enforced anything while `[disabled]` enforced
   * nothing. Two problems, both fixed by routing it through the same signal the
   * input uses: the two paths could disagree, and `internalDisabled` is the
   * slot an option's own `[disabled]` input falls back to — so `control.enable()`
   * wrote `false` over an option the consumer had disabled independently, and
   * never gave it back.
   */
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onOptionSelectionChange(): void {
    this.onTouched();
    const opts = this.options();
    const selectedValues = opts
      .filter(option => option.effectiveSelected())
      .map(option => option.value());

    this.onChange(selectedValues);

    this.selectionChange.emit({
      source: this,
      options: opts.filter(option => option.effectiveSelected())
    });
  }

  get selectedOptions(): TnListOptionComponent[] {
    const opts = this.options();
    return opts.filter(option => option.effectiveSelected());
  }
}