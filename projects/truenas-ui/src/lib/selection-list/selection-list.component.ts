
import { Component, input, output, contentChildren, signal, computed, forwardRef, effect } from '@angular/core';
import type { ControlValueAccessor} from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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

  selectionChange = output<TnSelectionChange>();

  options = contentChildren(TnListOptionComponent, { descendants: true });

  private formDisabled = signal<boolean>(false);

  // Computed disabled state (combines input and form state)
  isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * The option the user has moved to, or `null` while they have not moved yet.
   *
   * Kept separate from `activeIndex` rather than seeded with a starting value,
   * because "where the user last was" and "where a user who has not arrived yet
   * would land" are different questions and only the second one should follow
   * the selection around. See `activeIndex`.
   */
  private visitedIndex = signal<number | null>(null);

  /**
   * Which option carries the listbox's single tab stop.
   *
   * Before the user has touched the list this tracks the first selected option,
   * which is what APG asks for — tabbing into a list that already has a
   * selection should land where the user left off rather than at the top. Once
   * they have moved, `visitedIndex` pins it and the selection no longer drags
   * the tab stop around underneath them.
   *
   * Clamped rather than stored as a plain index, because the options are
   * content children and the caller can remove them: an index held in a field
   * outlives the option it pointed at, and the next keypress reads past the end
   * of the array.
   */
  private activeIndex = computed(() => {
    const opts = this.options();
    if (opts.length === 0) {
      return -1;
    }

    const visited = this.visitedIndex();
    if (visited !== null) {
      return Math.min(visited, opts.length - 1);
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
    // Effect to update options when they change
    effect(() => {
      const opts = this.options();
      const currentColor = this.color();
      opts.forEach(option => {
        option.selectionList = this;
        option.internalColor.set(currentColor);
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
   * ArrowUp / ArrowDown / Home / End, and deliberately nothing else.
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
   * claim that a disabled list cannot be toggled. It cannot be toggled by
   * mouse — `.tn-selection-list--disabled` sets `pointer-events: none` — and it
   * cannot be toggled through a reactive form, because `setDisabledState`
   * pushes down to each `option.internalDisabled` and the option's own guard
   * then refuses. But the plain `[disabled]` INPUT reaches neither: it feeds
   * `isDisabled()`, which drives that class and nothing else, so Space on an
   * option of a `[disabled]` list still toggles it. That gap predates the
   * keyboard handling added here and is not widened by it — arrow keys move
   * focus and never toggle — so it is reported on the PR rather than fixed
   * under a ticket about navigation.
   */
  onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;
    if (count === 0) {
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
    // moved something.
    event.preventDefault();
    this.visitedIndex.set(next);
    this.options()[next].focus();
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

    const index = this.options()
      .findIndex(option => (option.elementRef.nativeElement as HTMLElement).contains(target));

    if (index !== -1) {
      this.visitedIndex.set(index);
      this.focusedOptionElement = this.options()[index].elementRef.nativeElement as HTMLElement;
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

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    const opts = this.options();
    opts.forEach(option => {
      option.internalDisabled.set(isDisabled);
    });
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