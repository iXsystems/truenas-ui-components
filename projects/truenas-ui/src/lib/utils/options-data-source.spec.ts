import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import type { Observable } from 'rxjs';
import { createTnOptionsDataSource } from './options-data-source';
import type { TnOptionsDataSource, TnOptionsFetchFn } from './options-data-source';

/**
 * The engine on its own, for the parts of its contract no component surfaces.
 *
 * `tn-autocomplete` and `tn-chip-input` cover it end to end through their own
 * `*-data-source.spec.ts`; what belongs here is behaviour of the exported
 * signals that a component either hides or self-heals, so a spec driven through
 * one cannot see it fail.
 */

interface Row { id: number }

describe('createTnOptionsDataSource', () => {
  const pageSize = 2;

  let source: ReturnType<typeof signal<TnOptionsFetchFn<Row> | undefined>>;
  let engine: TnOptionsDataSource<Row>;
  /** Every `(query, page)` asked for, in order. */
  let requests: { query: string; page: number }[];
  let responder: (query: string, page: number) => Observable<Row[]>;

  function page(count: number): Row[] {
    return Array.from({ length: count }, (_, index) => ({ id: index }));
  }

  beforeEach(() => {
    requests = [];
    responder = () => of(page(pageSize));
    source = signal<TnOptionsFetchFn<Row> | undefined>((query, pageIndex) => {
      requests.push({ query, page: pageIndex });
      return responder(query, pageIndex);
    });

    TestBed.configureTestingModule({});
    engine = TestBed.runInInjectionContext(() => createTnOptionsDataSource<Row>({
      source,
      debounceMs: signal(250),
      pageSize: signal(pageSize),
      identity: (row) => row.id,
      onError: () => {},
    }));
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    TestBed.resetTestingModule();
  });

  /** A full first page, so paging is open and `loadMore` will issue. */
  function loadFirstPage(): void {
    engine.prime();
  }

  describe('loading', () => {
    it('releases the flag when refresh() retires a page still in flight', () => {
      // `refresh` bumps the generation without issuing anything, so the page it
      // retires is the only thing that can release the flag it set. Returning
      // on the premise that "a newer request owns loading" left it stuck true —
      // and `loadMore` is a no-op behind it, so the engine paged no further
      // until something happened to prime it again.
      loadFirstPage();
      const inFlight = new Subject<Row[]>();
      responder = () => inFlight;

      engine.loadMore();
      expect(engine.loading()).toBe(true);

      engine.refresh();
      inFlight.next(page(pageSize));
      inFlight.complete();

      expect(engine.loading()).toBe(false);
    });

    it('leaves the flag to the newer search that genuinely owns it', () => {
      // The other half of the same branch: here the generation moved because a
      // SEARCH started, and that request set `loading` itself. Clearing it on
      // the retired page's behalf would report the field as settled while its
      // replacement rows are still on the way.
      loadFirstPage();
      const stalePage = new Subject<Row[]>();
      responder = () => stalePage;
      engine.loadMore();

      const freshSearch = new Subject<Row[]>();
      responder = () => freshSearch;
      engine.search('zzz');
      jest.advanceTimersByTime(250);

      stalePage.next(page(pageSize));
      stalePage.complete();

      expect(engine.loading()).toBe(true);

      freshSearch.next(page(1));
      freshSearch.complete();

      expect(engine.loading()).toBe(false);
    });

    it('leaves the flag to a newer loadMore that genuinely owns it', () => {
      // `searchInFlight` tracks only the SEARCH pipeline, so a page retired by
      // an older generation could clear a flag a later page had set: issue A,
      // type (its search settles and clears the flag), scroll for B, then let
      // A finally land — the spinner vanished for the rest of B's round trip.
      loadFirstPage();
      const pageA = new Subject<Row[]>();
      responder = () => pageA;
      engine.loadMore();

      // A search retires A's generation, and settles.
      responder = () => of(page(pageSize));
      engine.search('zzz');
      jest.advanceTimersByTime(250);
      expect(engine.loading()).toBe(false);

      const pageB = new Subject<Row[]>();
      responder = () => pageB;
      engine.loadMore();
      expect(engine.loading()).toBe(true);

      pageA.next(page(pageSize));
      pageA.complete();

      expect(engine.loading()).toBe(true);

      pageB.next(page(1));
      pageB.complete();

      expect(engine.loading()).toBe(false);
    });

    it('releases the flag when a retired page fails rather than answers', () => {
      loadFirstPage();
      const inFlight = new Subject<Row[]>();
      responder = () => inFlight;
      engine.loadMore();

      engine.refresh();
      inFlight.error(new Error('gone'));

      expect(engine.loading()).toBe(false);
    });
  });
});
