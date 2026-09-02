import { Directive, computed, effect, inject, input, output, signal } from '@angular/core';
import type { OnInit, Signal } from '@angular/core';
import type { AsyncValidatorFn, ControlValueAccessor, ValidationErrors } from '@angular/forms';
import { NgControl } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import {
  TN_USER_DIRECTORY,
  TN_USER_DIRECTORY_LABELS,
  formatDirectoryMessage,
  type TnDirectoryQuery,
  type TnPrincipalOption,
  type TnPrincipalValue,
  type TnUserDirectory,
} from './user-directory';
import { controlTestId, type TnTestIdValue } from '../test-id';
import { injectTnLabels } from '../utils/inject-labels';
import type { TnOptionsFetchFn } from '../utils/options-data-source';

/** Which side of the directory a field reads. */
export type TnPrincipalKind = 'user' | 'group';

/**
 * Shared behaviour of the four user/group fields: reaching the directory,
 * building the `[dataSource]` the inner control consumes, running existence
 * validation, and forwarding the `ControlValueAccessor` contract to that inner
 * control.
 *
 * A `Directive` rather than a plain class so Angular's DI works in its field
 * initializers; it is never applied to an element itself.
 *
 * **On the CVA forwarding.** Each field is the `ControlValueAccessor` its
 * `formControlName` binds to, and delegates to the `tn-autocomplete` /
 * `tn-chip-input` it renders. Angular hands a CVA its value and callbacks while
 * setting up the directive, which is *before* the inner view exists — so all
 * four are buffered here and replayed the moment the child registers itself.
 * Without that, the first `writeValue` of every edit form would land on nothing
 * and the field would render empty.
 */
@Directive()
export abstract class TnDirectoryFieldBase implements ControlValueAccessor {
  /** Which directory call this field reads. Fixed by each concrete field. */
  protected abstract readonly kind: TnPrincipalKind;

  /** Whether the value is a list (chips) or a single principal (autocomplete). */
  protected abstract readonly multiple: boolean;

  /**
   * The inner `tn-autocomplete` / `tn-chip-input`, declared by each concrete
   * field.
   *
   * It has to be declared *there* rather than here: a view query on an abstract
   * `@Directive()` never runs, because a directive has no view of its own for
   * Angular to query, and inheriting it does not attach it to the derived
   * component's view either. Declared on the base, this silently resolves to
   * `undefined` forever — every field renders, and nothing a user does ever
   * reaches the form control.
   */
  protected abstract readonly innerControl: Signal<ControlValueAccessor | undefined>;

  protected readonly directory = injectUserDirectory();
  protected readonly labels = injectTnLabels(TN_USER_DIRECTORY_LABELS);

  /** The `NgControl` this field is bound to, when it is in a form at all. */
  protected readonly ngControl = inject(NgControl, { optional: true, self: true });

  /**
   * Modifiers handed to the directory verbatim — how the app narrows the list
   * for this particular field. See {@link TnDirectoryQuery}.
   */
  readonly directoryOptions = input<TnDirectoryQuery>({});

  /** Placeholder for the text field; falls back to the label token. */
  readonly placeholder = input<string | undefined>(undefined);

  /** Whether the field is disabled independently of its form control. */
  readonly disabled = input<boolean>(false);

  /**
   * Reject a typed name that no user or group actually has.
   *
   * On by default: these fields accept free text, so a typo would otherwise
   * reach the API as a valid-looking name. Turn it off where the control is
   * restricted to the dropdown anyway and the extra lookups are waste.
   */
  readonly validateExistence = input<boolean>(true);

  /** Debounce before a lookup goes out, both for search and for validation. */
  readonly debounce = input<number>(250);

  /**
   * Options merged ahead of whatever the directory returns, deduplicated by
   * value.
   *
   * For a value the search cannot produce but the field must still name: an id
   * already on the record, resolved to its display name elsewhere. Without it
   * such a field shows the raw id until the user happens to search for it.
   */
  readonly extraOptions = input<TnPrincipalOption[]>([]);

  /** Test-id base, forwarded to the inner control. */
  readonly testId = input<TnTestIdValue>(undefined);

  /**
   * The base the inner control stamps its ids from.
   *
   * `controlTestId` is `self`-scoped so that a composite control cannot leak
   * its name onto the children it embeds — which means the inner
   * `tn-autocomplete` / `tn-chip-input`, having no `NgControl` of its own (this
   * field claimed it), would resolve to nothing and drop every `data-test`.
   * Resolving here, where the `NgControl` actually is, and passing the result
   * down is what keeps `formControlName="owner"` emitting an id.
   */
  protected readonly resolvedTestId = controlTestId(this.testId);

  /** Accessible name, forwarded to the inner control. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Rows per page, as the registered directory reports them. */
  protected readonly pageSize = computed(() => this.directory.pageSize ?? 50);

  protected readonly resolvedPlaceholder = computed(() => this.placeholder()
    ?? (this.kind === 'user' ? this.labels().userPlaceholder : this.labels().groupPlaceholder));

  /**
   * The `[dataSource]` the inner control consumes. A stable function identity —
   * it reads `directoryOptions()` when called rather than closing over it, so
   * changing that input does not swap the source out from under a live search.
   */
  protected readonly optionsSource: TnOptionsFetchFn<TnPrincipalOption> = (search, page) => {
    const options = this.directoryOptions();
    const rows$ = this.kind === 'user'
      ? this.directory.queryUsers(search, page, options)
      : this.directory.queryGroups(search, page, options);

    return rows$.pipe(map((rows) => {
      // Only ahead of the FIRST page: later pages append, and re-inserting
      // these each time would push duplicates through the paging dedupe.
      const extra = page === 0 ? this.extraOptions() : [];
      if (extra.length === 0) {
        return rows;
      }
      const pinned = new Set(extra.map((option) => option.value));
      return [...extra, ...rows.filter((row) => !pinned.has(row.value))];
    }));
  };

  // ── CVA forwarding ──

  /** The inner control, once its view exists. */
  private inner = signal<ControlValueAccessor | null>(null);

  /**
   * The instance {@link registerInner} last replayed into.
   *
   * The registering effect re-runs whenever change detection re-reads its view
   * query — which is often — and replaying `writeValue` on each of those runs
   * overwrites whatever the user is currently typing with the last committed
   * value. The draft is then blank at blur, so nothing is ever committed and
   * the field silently refuses every typed value. Replay only on a genuinely
   * new instance.
   */
  private registeredInner: ControlValueAccessor | null = null;

  private pendingValue: unknown;
  private hasPendingValue = false;
  private pendingChange?: (value: unknown) => void;
  private pendingTouched?: () => void;
  private pendingDisabled?: boolean;

  constructor() {
    // Claiming the accessor here rather than through NG_VALUE_ACCESSOR keeps the
    // field from also being discovered as an accessor for its own inner control.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // An effect rather than ngAfterViewInit, so a control recreated by a
    // structural directive in a parent template re-registers and comes back
    // holding the current value. Reading `innerControl` lazily is also what
    // lets an abstract member be driven from here: by the time an effect first
    // runs, the subclass field that declares the query exists.
    effect(() => {
      const control = this.innerControl();
      if (control) {
        this.registerInner(control);
      }
    });
  }

  /**
   * Called by each field's template once the inner control exists. Replays
   * whatever the forms layer already handed us.
   */
  protected registerInner(control: ControlValueAccessor): void {
    if (this.registeredInner === control) {
      return;
    }
    this.registeredInner = control;
    this.inner.set(control);

    if (this.pendingChange) {
      control.registerOnChange(this.pendingChange);
    }
    if (this.pendingTouched) {
      control.registerOnTouched(this.pendingTouched);
    }
    if (this.pendingDisabled !== undefined) {
      control.setDisabledState?.(this.pendingDisabled);
    }
    if (this.hasPendingValue) {
      control.writeValue(this.pendingValue);
    }
  }

  writeValue(value: unknown): void {
    // Kept even after forwarding: the inner control can be recreated (an @if in
    // a parent template), and it must come back holding the current value.
    this.pendingValue = value;
    this.hasPendingValue = true;
    this.inner()?.writeValue(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.pendingChange = fn;
    this.inner()?.registerOnChange(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.pendingTouched = fn;
    this.inner()?.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.pendingDisabled = isDisabled;
    this.inner()?.setDisabledState?.(isDisabled);
  }

  /**
   * Commits a value the field chose itself, rather than one the user picked
   * from the dropdown — currently only the freshly created user. Goes through
   * the bound control so the form sees it as a real edit; falls back to the
   * accessor callbacks when the field is used outside a form.
   */
  protected writeValueAndNotify(value: TnPrincipalValue): void {
    const control = this.ngControl?.control;
    if (control) {
      control.setValue(value);
      control.markAsDirty();
      return;
    }
    this.writeValue(value);
    this.pendingChange?.(value);
  }

  // ── Existence validation ──

  /**
   * Attaches the existence validator to the bound control.
   *
   * `updateValueAndValidity` is deliberately NOT called: an edit form would
   * otherwise open with every loaded value already flagged, before the user has
   * touched anything. Validation runs on the first change, or on submit.
   */
  protected attachExistenceValidator(): void {
    const control = this.ngControl?.control;
    if (!control || !this.validateExistence()) {
      return;
    }
    control.addAsyncValidators(this.existenceValidator());
  }

  private existenceValidator(): AsyncValidatorFn {
    return (control): Observable<ValidationErrors | null> => {
      const names = this.namesToCheck(control.value);
      if (names.length === 0) {
        return of(null);
      }

      // Debounce inside the validator, separately from the search debounce: a
      // typed name that matches nothing still has to be checked, and the two
      // have different lifecycles.
      return timer(this.debounce()).pipe(
        first(),
        switchMap(() => {
          // The value can move while the timer runs; a verdict about a name the
          // control no longer holds would be a stale error.
          if (this.namesToCheck(control.value).join(' ') !== names.join(' ')) {
            return of<ValidationErrors | null>(null);
          }
          return this.findMissing(names).pipe(
            map((missing) => (missing.length ? this.existenceError(missing) : null)),
          );
        }),
      );
    };
  }

  /** Normalizes either shape of control value to the names worth checking. */
  private namesToCheck(value: unknown): string[] {
    const candidates = this.multiple ? (Array.isArray(value) ? value : []) : [value];
    return candidates
      // Only a typed name can be wrong. A numeric value came from an option the
      // directory itself returned, so checking it by name would be meaningless.
      .filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim() !== '');
  }

  private findMissing(names: string[]): Observable<string[]> {
    const checks = names.map((name) => this.exists(name).pipe(
      // A lookup that fails is not evidence the name is wrong — treat the
      // transport error as "cannot say" rather than flagging a real user.
      catchError(() => of(true)),
      map((exists) => ({ name, exists })),
    ));

    return checks.length === 1
      ? checks[0].pipe(map((result) => (result.exists ? [] : [result.name])))
      : forkJoinCompat(checks).pipe(
        map((results) => results.filter((result) => !result.exists).map((result) => result.name)),
      );
  }

  private exists(name: string): Observable<boolean> {
    return this.kind === 'user'
      ? this.directory.userExists(name)
      : this.directory.groupExists(name);
  }

  private existenceError(missing: string[]): ValidationErrors {
    const labels = this.labels();
    const isUser = this.kind === 'user';

    if (this.multiple) {
      return {
        [isUser ? 'usersDoNotExist' : 'groupsDoNotExist']: {
          message: formatDirectoryMessage(
            isUser ? labels.usersDoNotExist : labels.groupsDoNotExist,
            { names: missing.join(', ') },
          ),
        },
      };
    }

    return {
      [isUser ? 'userDoesNotExist' : 'groupDoesNotExist']: {
        message: formatDirectoryMessage(
          isUser ? labels.userDoesNotExist : labels.groupDoesNotExist,
          { name: missing[0] },
        ),
      },
    };
  }
}

/**
 * The single-valued fields, `tn-user-autocomplete` and `tn-group-autocomplete`.
 * Adds the inputs that only make sense for one principal, and the optional
 * create row.
 */
@Directive()
export abstract class TnDirectoryAutocompleteBase extends TnDirectoryFieldBase implements OnInit {
  protected readonly multiple = false;

  /** Whether this field can offer a create row at all. Only users can. */
  protected readonly supportsCreate: boolean = false;

  /**
   * Commit a typed name that matched nothing. On by default, because a name
   * from a directory the search cannot reach is still a legitimate value —
   * {@link TnDirectoryFieldBase.validateExistence} is what catches typos.
   */
  readonly allowCustomValue = input<boolean>(true);

  /** Restrict the value to the dropdown; an unmatched term reverts on blur. */
  readonly requireSelection = input<boolean>(false);

  /**
   * Text shown when nothing matched. Worth overriding from `(directoryError)`,
   * so a lookup that failed does not read as "this user does not exist".
   */
  readonly noResultsText = input<string | undefined>(undefined);

  /**
   * Offer a row above the results that opens the app's create-user flow.
   * Ignored unless the registered directory implements `createUser`.
   */
  readonly allowCreate = input<boolean>(false);

  /** Emits the newly created principal after it has been selected. */
  readonly created = output<TnPrincipalOption>();

  /** Emits a failed directory lookup; the field recovers on its own. */
  readonly directoryError = output<unknown>();

  ngOnInit(): void {
    this.attachExistenceValidator();
  }

  /** The pinned create row, or undefined when this field does not offer one. */
  protected readonly createOption = computed<TnPrincipalOption | undefined>(() => {
    if (!this.supportsCreate || !this.allowCreate() || !this.directory.createUser) {
      return undefined;
    }
    return { label: this.labels().addUser, value: createSentinel };
  });

  /**
   * The create row was chosen. Nothing is committed until the flow resolves, so
   * a dismissed dialog leaves the previous selection exactly as it was.
   */
  protected onCreate(): void {
    this.directory.createUser?.(this.directoryOptions()).pipe(first()).subscribe((created) => {
      if (!created) {
        return;
      }
      this.writeValueAndNotify(created.value);
      this.created.emit(created);
    });
  }
}

/**
 * The list-valued fields, `tn-user-chips` and `tn-group-chips`.
 */
@Directive()
export abstract class TnDirectoryChipsBase extends TnDirectoryFieldBase implements OnInit {
  protected readonly multiple = true;

  ngOnInit(): void {
    this.attachExistenceValidator();
  }

  /** Commit typed names that matched nothing, as the single-valued fields do. */
  readonly allowCustomValue = input<boolean>(true);

  /** Maximum number of chips; unset means no limit. */
  readonly maxChips = input<number | undefined>(undefined);

  /** Emits a failed directory lookup; the field recovers on its own. */
  readonly directoryError = output<unknown>();
}

/**
 * The value the create row carries. Never reaches a form control — the field
 * intercepts the row before anything is committed — but `tn-autocomplete`
 * requires every option to have one.
 */
const createSentinel = '__tn_create__';

/**
 * Resolves the app's directory, failing loudly when none is registered — an
 * unprovided token would otherwise surface as a field that simply never has any
 * options, which reads like a directory outage.
 */
function injectUserDirectory(): TnUserDirectory {
  const directory = inject(TN_USER_DIRECTORY, { optional: true });
  if (!directory) {
    throw new Error(
      'No TnUserDirectory is registered. A tn-user-* / tn-group-* field needs one — '
      + 'call provideTnUserDirectory(YourDirectory) in the application providers.',
    );
  }
  return directory;
}

/**
 * `forkJoin` over a fixed list. Inlined rather than imported so this file keeps
 * to the operator set already bundled, and so an empty list — which cannot
 * happen here — is not a silent no-emit.
 */
function forkJoinCompat<T>(sources: Observable<T>[]): Observable<T[]> {
  return new Observable<T[]>((subscriber) => {
    const results = new Array<T>(sources.length);
    let remaining = sources.length;
    const subscriptions = sources.map((source, index) => source.pipe(first()).subscribe({
      next: (value) => {
        results[index] = value;
        remaining--;
        if (remaining === 0) {
          subscriber.next(results);
          subscriber.complete();
        }
      },
      error: (error: unknown) => subscriber.error(error),
    }));

    return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
  });
}
