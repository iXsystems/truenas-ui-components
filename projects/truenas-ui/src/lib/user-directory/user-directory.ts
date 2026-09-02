import { InjectionToken, type Signal } from '@angular/core';
import type { Observable } from 'rxjs';
import type { TnSelectOption } from '../select/select.component';

/**
 * The value a user or group field commits. A name at nearly every call site,
 * but an id where the API takes one — so it is deliberately not narrowed.
 */
export type TnPrincipalValue = string | number;

/** An option in a user or group field: the name is displayed, the value committed. */
export type TnPrincipalOption = TnSelectOption<TnPrincipalValue>;

/**
 * App-defined modifiers passed to {@link TnUserDirectory} verbatim.
 *
 * The library has no opinion about what a deployment's user store can be
 * narrowed by — SMB-only, local-only, a set of excluded ids, which record field
 * is the value — so the fields here are the app's to define and the adapter's to
 * interpret. Bound on a field with `[directoryOptions]`.
 *
 * @example
 * ```html
 * <tn-group-autocomplete
 *   formControlName="group"
 *   [directoryOptions]="{ localOnly: true, valueField: 'id' }" />
 * ```
 */
export type TnDirectoryQuery = Readonly<Record<string, unknown>>;

/**
 * The application's user and group store, as the library's user/group fields
 * need it.
 *
 * This is the whole seam between `tn-user-*` / `tn-group-*` and a product: the
 * components own the search, paging, validation and "create a new user" flow,
 * and an app supplies only the four (or five) calls below. Nothing here mentions
 * a transport, a cache, or a query language — an adapter is free to cache
 * aggressively, dedupe in-flight requests, or answer from memory, and several
 * of these are called often enough that it should.
 *
 * Register one at the app root with {@link provideTnUserDirectory}.
 */
export interface TnUserDirectory {
  /**
   * One page of users matching `search`. `page` is zero-based, and a page
   * shorter than {@link pageSize} ends pagination.
   */
  queryUsers(
    search: string,
    page: number,
    options: TnDirectoryQuery,
  ): Observable<TnPrincipalOption[]>;

  /** One page of groups matching `search`, on the same terms as `queryUsers`. */
  queryGroups(
    search: string,
    page: number,
    options: TnDirectoryQuery,
  ): Observable<TnPrincipalOption[]>;

  /**
   * Whether a user of exactly this name exists.
   *
   * Called on every validation pass of a field that accepts free text, so an
   * adapter should answer from a cache where it can. Errors are treated as
   * "does not exist"; an adapter that would rather not fail closed on a
   * transport error should catch and return `true` itself.
   */
  userExists(username: string): Observable<boolean>;

  /** Whether a group of exactly this name exists, on the same terms. */
  groupExists(groupName: string): Observable<boolean>;

  /**
   * Open whatever "create a user" flow the app has, resolving to the new user —
   * or to `null` if it was dismissed.
   *
   * Optional: a field only offers its create row when this is implemented AND
   * the field sets `allowCreate`. The library never renders the form itself,
   * since creating a user is entirely the product's business.
   */
  createUser?(options: TnDirectoryQuery): Observable<TnPrincipalOption | null>;

  /**
   * Rows a query page returns. Read for exhaustion detection, so it must match
   * what `queryUsers`/`queryGroups` actually return. Defaults to 50.
   */
  readonly pageSize?: number;
}

/**
 * DI token for the app's {@link TnUserDirectory}.
 *
 * Left without a factory on purpose: there is no sensible default user store,
 * and a field that silently found an empty one would look like a directory
 * outage rather than a missing provider. The components raise a clear error
 * instead.
 */
export const TN_USER_DIRECTORY = new InjectionToken<TnUserDirectory>('TN_USER_DIRECTORY');

/**
 * Register the app's user/group store for every `tn-user-*` and `tn-group-*`
 * field.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideTnUserDirectory(TrueNasUserDirectory)],
 * });
 * ```
 */
export function provideTnUserDirectory(directory: new (...args: never[]) => TnUserDirectory) {
  return { provide: TN_USER_DIRECTORY, useExisting: directory };
}

/**
 * Copy rendered by the user/group fields that is the same for every instance in
 * an app. Provide {@link TN_USER_DIRECTORY_LABELS} at the app root rather than
 * repeating it per call site.
 *
 * The `*DoesNotExist` messages interpolate `{name}`; the plural ones interpolate
 * `{names}` with an already-joined list.
 */
export interface TnUserDirectoryLabels {
  /** Placeholder for a user field. */
  userPlaceholder: string;
  /** Placeholder for a group field. */
  groupPlaceholder: string;
  /** The create row pinned above a user field's results. */
  addUser: string;
  /** Validation message for one missing user. `{name}` is the typed name. */
  userDoesNotExist: string;
  /** Validation message for one missing group. `{name}` is the typed name. */
  groupDoesNotExist: string;
  /** Validation message for missing users. `{names}` is a joined list. */
  usersDoNotExist: string;
  /** Validation message for missing groups. `{names}` is a joined list. */
  groupsDoNotExist: string;
}

/** English defaults used when no {@link TN_USER_DIRECTORY_LABELS} is registered. */
export const TN_USER_DIRECTORY_DEFAULT_LABELS: TnUserDirectoryLabels = {
  userPlaceholder: 'Type to search users...',
  groupPlaceholder: 'Type to search groups...',
  addUser: 'Add New',
  userDoesNotExist: 'User "{name}" does not exist',
  groupDoesNotExist: 'Group "{name}" does not exist',
  usersDoNotExist: 'The following users do not exist: {names}',
  groupsDoNotExist: 'The following groups do not exist: {names}',
};

/**
 * DI token for app-wide user/group field copy. Provide a static object or a
 * `Signal<TnUserDirectoryLabels>` — the latter lets every field react to a
 * language change. Explicit input bindings still win over these defaults.
 */
export const TN_USER_DIRECTORY_LABELS = new InjectionToken<
  TnUserDirectoryLabels | Signal<TnUserDirectoryLabels>
>('TN_USER_DIRECTORY_LABELS', {
  providedIn: 'root',
  factory: () => TN_USER_DIRECTORY_DEFAULT_LABELS,
});

/** Substitutes `{name}` / `{names}` into one of the message templates above. */
export function formatDirectoryMessage(template: string, values: Record<string, string>): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
