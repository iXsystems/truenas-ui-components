import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of, timer } from 'rxjs';
import type { Observable } from 'rxjs';
import { catchError, debounce, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

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
   * Fetch page 0 immediately if nothing has been fetched yet. For click-to-open
   * pickers, where `search` never fires until the user types. A no-op once any
   * query has run, so reopening the panel does not refetch.
   */
  prime(): void;
  /** Append the next page. No-op while loading, when exhausted, or with no source. */
  loadMore(): void;
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
 *   the page that errored rather than stepping over those rows.
 * - **A late page cannot contaminate a newer search.** Pages carry the
 *   generation they were requested in and are dropped if a search has since
 *   started.
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
  /** Index of the last page successfully loaded for `query`. */
  let page = 0;
  /** Whether any query has run — gates {@link prime}. */
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

  const requests$ = new Subject<{ query: string; immediate: boolean }>();

  requests$
    .pipe(
      // `prime` must not sit behind the typing debounce — an empty first page
      // should be on screen as the panel opens, not a quarter-second later.
      debounce((request) => (request.immediate ? of(0) : timer(config.debounceMs()))),
      distinctUntilChanged(
        (previous, current) => previous.query === current.query && !lastRequestFailed,
      ),
      tap((request) => {
        query = request.query;
        page = 0;
        primed = true;
        lastRequestFailed = false;
        generation++;
        loading.set(true);
      }),
      switchMap((request) => {
        const fetch = config.source();
        if (!fetch) {
          return of<O[]>([]);
        }
        return fetch(request.query, 0).pipe(
          catchError((error: unknown) => {
            lastRequestFailed = true;
            config.onError(error);
            return of<O[]>([]);
          }),
        );
      }),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe((rows) => {
      loading.set(false);
      // An empty page from a failure is not evidence that the source is
      // exhausted — leave paging open so a retry can still reach page 1.
      exhausted.set(lastRequestFailed ? false : rows.length < config.pageSize());
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
      if (primed || !config.source()) {
        return;
      }
      requests$.next({ query: '', immediate: true });
    },

    loadMore(): void {
      const fetch = config.source();
      if (!fetch || loading() || exhausted()) {
        return;
      }

      const requestedPage = page + 1;
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
            page = requestedPage;
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
            // `page` deliberately not advanced: the next scroll re-requests
            // this page instead of skipping the rows it would have held.
            config.onError(error);
            config.onSettled?.();
          },
        });
    },
  };
}
