import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of, timer } from 'rxjs';
import type { Observable } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

/**
 * Fetches one page of options for a server-driven dropdown.
 *
 * Stateless on purpose: the page number is passed in rather than held by the
 * caller, so a source is a plain function of `(query, page)` and never has to
 * track — or roll back — a cursor of its own. {@link createTnOptionsDataSource}
 * owns the cursor, and rolls it back for you when a page fails.
 *
 * `page` is zero-based; page 0 is the first page of a fresh search.
 */
export type TnOptionsFetchFn<O> = (query: string, page: number) => Observable<O[]>;

/** Inputs {@link createTnOptionsDataSource} reads. All are signals so they stay live. */
export interface TnOptionsDataSourceConfig<O> {
  /** The fetch function, or `undefined` when the host has no async source bound. */
  source: Signal<TnOptionsFetchFn<O> | undefined>;
  /** Debounce applied to typing before a request goes out, in ms. */
  debounceMs: Signal<number>;
  /**
   * Rows per page. Only used to detect exhaustion: a page shorter than this is
   * the last one, after which further {@link TnOptionsDataSource.loadMore}
   * calls are dropped instead of issuing queries that can only return `[]`.
   */
  pageSize: Signal<number>;
  /** Identity of an option, used to drop duplicates when appending a page. */
  identity: (option: O) => unknown;
  /** Called once per failed request, so the host can surface it its own way. */
  onError: (error: unknown) => void;
  /**
   * Called after every request settles, successfully or not. Hosts use this to
   * release their own "a page is in flight" latches: a synchronous source
   * flips {@link TnOptionsDataSource.loading} true and back within one block,
   * so watching that signal misses the round trip entirely.
   */
  onSettled?: () => void;
}

/** The live state of a {@link createTnOptionsDataSource}. */
export interface TnOptionsDataSource<O> {
  /** Options fetched so far for the current query, in server order. */
  readonly options: Signal<O[]>;
  /** Whether a request is in flight. */
  readonly loading: Signal<boolean>;
  /** Whether the last page came back short, i.e. there is nothing more to page in. */
  readonly exhausted: Signal<boolean>;
  /** Run a fresh (debounced) search, resetting paging to page 0. */
  search(query: string): void;
  /**
   * Fetch page 0 for the current term immediately if nothing has been fetched
   * yet. For click-to-open pickers, where `search` never fires until the user
   * types. A no-op once a query has run *successfully*, so reopening the panel
   * does not refetch — but a request that failed is retried, as it is on the
   * `search` path.
   */
  prime(): void;
  /** Append the next page. No-op while loading, when exhausted, or with no source. */
  loadMore(): void;
  /**
   * Declare everything fetched so far out of date, without fetching anything.
   *
   * The other half of the stable-source contract. A host whose `[dataSource]`
   * is a fixed function reading live configuration — the shape that keeps a
   * source from being swapped out from under a search in flight — has nothing
   * here observing that configuration, so a change to it would otherwise take
   * effect only on the next keystroke. This is how the host says it changed.
   *
   * Clears {@link TnOptionsDataSource.prime}'s latch and rolls paging back to
   * page 0, so the next `prime` refetches instead of being answered from the
   * previous configuration's rows — and is not suppressed for repeating the
   * term already on screen. Deliberately does NOT issue a request itself: only
   * the host knows whether its panel is open, and a field nobody has touched
   * should not query the server because a sibling input moved. A host with rows
   * on screen calls `prime` straight after this.
   */
  refresh(): void;
}

/**
 * The part of a host component (`tn-autocomplete`, `tn-chip-input`) that an
 * outer component wrapping it drives directly.
 *
 * The engine is private to the host, so a composite field — one that builds the
 * `[dataSource]` itself and binds it once — needs this to invalidate what the
 * host has fetched when its own inputs move.
 */
export interface TnAsyncOptionsHost {
  /** See {@link TnOptionsDataSource.refresh}. */
  refreshOptions(): void;
}

/**
 * The stateful half of a server-driven dropdown: debounce, cancellation,
 * paging, exhaustion, and error recovery, so a host component only has to
 * render {@link TnOptionsDataSource.options} and forward its own events.
 *
 * Must be called in an injection context — it ties its subscription to the
 * caller's {@link DestroyRef}.
 *
 * Notable behaviours, each of which was a bug in a hand-rolled copy of this:
 *
 * - **Errors never kill the stream.** `catchError` sits inside the `switchMap`,
 *   so a failed request reports and yields an empty page while the outer
 *   subscription survives; without that, one transient failure freezes the
 *   field for the life of the panel.
 * - **A failed term is retryable.** `distinctUntilChanged` treats a repeat of a
 *   failed query as a change, so reopening a picker after an error refetches
 *   instead of being suppressed as a duplicate.
 * - **A failed page does not advance the cursor**, so the next scroll re-requests
 *   the page that errored rather than stepping over those rows. The cursor
 *   tracks the *next* page to ask for rather than the last one loaded, so page 0
 *   rolls back like every other page instead of being silently skipped.
 * - **A late page cannot contaminate a newer search.** Every response carries
 *   the generation it was requested in and is dropped if a search — or a
 *   {@link TnOptionsDataSource.refresh} — has since started. Cancellation is
 *   not enough on its own: `refresh` invalidates without issuing a request, so
 *   there is nothing for `switchMap` to unsubscribe the old one in favour of.
 */
export function createTnOptionsDataSource<O>(
  config: TnOptionsDataSourceConfig<O>,
): TnOptionsDataSource<O> {
  const destroyRef = inject(DestroyRef);

  const options = signal<O[]>([]);
  const loading = signal(false);
  const exhausted = signal(false);

  /** Current query, replayed by `loadMore` so a page matches what is on screen. */
  let query = '';
  /**
   * Index of the next page to request for `query`.
   *
   * Deliberately "next to request" rather than "last loaded": those two only
   * differ on page 0, which is exactly where the difference bites. A fresh
   * search resets the cursor *before* anything has landed, so a "last loaded"
   * counter reads 0 both for "page 0 is on screen" and for "page 0 failed" —
   * and the next `loadMore` would step over the first page of matches instead
   * of retrying it.
   */
  let nextPage = 0;
  /** Whether a query has run successfully — gates {@link prime}. */
  let primed = false;
  /**
   * Set when a request fails, cleared when the next one starts. Read by the
   * `distinctUntilChanged` comparator so the same term can be retried.
   */
  let lastRequestFailed = false;
  /**
   * Bumped by every fresh search. A `loadMore` response from an older
   * generation is discarded rather than appended to a different result set.
   */
  let generation = 0;
  /**
   * Set by `refresh`, cleared when the request it queued starts. Read by the
   * `distinctUntilChanged` comparator, the same way `lastRequestFailed` is: a
   * refresh re-asks the term already on screen, which is exactly the shape that
   * comparator exists to suppress.
   */
  let refreshRequested = false;

  const requests$ = new Subject<{ query: string; immediate: boolean }>();

  requests$
    .pipe(
      // `prime` must not sit behind the typing debounce — an empty first page
      // should be on screen as the panel opens, not a quarter-second later.
      debounce((request) => (request.immediate ? of(0) : timer(config.debounceMs()))),
      distinctUntilChanged(
        (previous, current) => previous.query === current.query
          && !lastRequestFailed
          && !refreshRequested,
      ),
      tap((request) => {
        query = request.query;
        nextPage = 0;
        lastRequestFailed = false;
        refreshRequested = false;
        generation++;
        loading.set(true);
      }),
      switchMap((request) => {
        // Stamped with the generation it was asked for in, the way `loadMore`
        // stamps its pages: `refresh` retires a request in flight without
        // pushing anything through this subject, so `switchMap` alone never
        // cancels it and its rows would otherwise land as if still current.
        const requestedGeneration = generation;
        const fetch = config.source();
        if (!fetch) {
          return of({ rows: [] as O[], failed: false, requestedGeneration });
        }
        return fetch(request.query, 0).pipe(
          map((rows) => ({ rows, failed: false, requestedGeneration })),
          catchError((error: unknown) => {
            config.onError(error);
            return of({ rows: [] as O[], failed: true, requestedGeneration });
          }),
        );
      }),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe(({ rows, failed, requestedGeneration }) => {
      // No other request can be outstanding — a newer one through this subject
      // would have unsubscribed this response — so the flag is released either
      // way, stale or not.
      loading.set(false);
      if (requestedGeneration !== generation) {
        // Fetched under a configuration `refresh` has since retired. Latching
        // `primed` on it would answer the next `prime` from the invalidated
        // pages for good, which is the exact failure `refresh` exists to
        // prevent; `lastRequestFailed` is left alone for the same reason.
        config.onSettled?.();
        return;
      }
      lastRequestFailed = failed;
      // An empty page from a failure is not evidence that the source is
      // exhausted — leave paging open so a retry can still reach page 1.
      exhausted.set(failed ? false : rows.length < config.pageSize());
      // A failed page 0 leaves the cursor on 0, so the next `loadMore` retries
      // it; `primed` likewise only latches on a request that arrived.
      nextPage = failed ? 0 : 1;
      primed = primed || !failed;
      options.set(rows);
      config.onSettled?.();
    });

  return {
    options: options.asReadonly(),
    loading: loading.asReadonly(),
    exhausted: exhausted.asReadonly(),

    search(next: string): void {
      requests$.next({ query: next, immediate: false });
    },

    prime(): void {
      // `lastRequestFailed` is what makes a failed term retryable on the
      // `search` path; without it here, one transient failure would empty a
      // click-to-open picker for the life of the field — reopening the panel
      // would issue no request at all.
      if ((primed && !lastRequestFailed) || !config.source()) {
        return;
      }
      // The current term, not `''`: on the retry path the field may already
      // hold the text whose lookup failed, and re-priming with an empty query
      // would answer it with a list that does not match what is typed.
      requests$.next({ query, immediate: true });
    },

    loadMore(): void {
      const fetch = config.source();
      if (!fetch || loading() || exhausted()) {
        return;
      }

      const requestedPage = nextPage;
      const requestedGeneration = generation;
      loading.set(true);

      fetch(query, requestedPage)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (rows) => {
            if (requestedGeneration !== generation) {
              // A fresh search started while this page was in flight; its
              // result set is already on screen and owns `loading`.
              return;
            }
            loading.set(false);
            // Only a page that arrived counts as read — see the error branch.
            nextPage = requestedPage + 1;
            primed = true;
            exhausted.set(rows.length < config.pageSize());
            options.update((current) => {
              const seen = new Set(current.map(config.identity));
              return [...current, ...rows.filter((row) => !seen.has(config.identity(row)))];
            });
            config.onSettled?.();
          },
          error: (error: unknown) => {
            if (requestedGeneration !== generation) {
              return;
            }
            loading.set(false);
            // `nextPage` deliberately not advanced: the next scroll re-requests
            // this page instead of skipping the rows it would have held.
            config.onError(error);
            config.onSettled?.();
          },
        });
    },

    refresh(): void {
      primed = false;
      nextPage = 0;
      exhausted.set(false);
      // Any page still in flight was asked for under the old configuration —
      // bump the generation so it is dropped rather than appended to whatever
      // the next request produces.
      generation++;
      // The refetch re-asks the term already on screen, which is exactly what
      // the duplicate-term guard suppresses. Left armed until a request
      // actually starts, so a host that refreshes while closed is still not
      // suppressed when it primes on its next open.
      refreshRequested = true;
      // `options` is deliberately left alone: a panel that is open keeps
      // showing the previous rows until the replacements land, rather than
      // blinking empty for a round trip.
    },
  };
}
