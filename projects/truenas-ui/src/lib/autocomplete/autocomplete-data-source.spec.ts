import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { TnAutocompleteComponent } from './autocomplete.component';
import type { TnAutocompleteOption } from './autocomplete.component';
import type { TnOptionsFetchFn } from '../utils/options-data-source';

/**
 * `[dataSource]` — the async half of `tn-autocomplete`.
 *
 * Everything here was, until this input existed, hand-written in each consuming
 * form: a subject fed from `(searchChange)`, a `debounceTime`, a
 * `distinctUntilChanged`, a `switchMap`, a page cursor, an exhaustion flag, an
 * error latch, and a "keep the selected option listed" pass. Several of those
 * copies got one of the edge cases wrong, so each case below names the failure
 * it prevents rather than just the behaviour it asserts.
 */

type Option = TnAutocompleteOption<string>;

/** Options named so a page's contents identify the page that produced them. */
function pageOf(query: string, page: number, count: number): Option[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `${query || 'all'}-p${page}-${index}`,
    value: `${query || 'all'}-p${page}-${index}`,
  }));
}

@Component({
  selector: 'tn-data-source-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [formControl]="control"
      [dataSource]="source()"
      [dataSourceDebounce]="250"
      [pageSize]="pageSize()"
      [options]="staticOptions()"
      [actionOption]="actionOption()"
      (actionSelected)="actionCount = actionCount + 1"
      (dataSourceError)="errors.push($event)" />
  `,
})
class DataSourceHostComponent {
  control = new FormControl<string | null>(null);
  pageSize = signal(5);
  staticOptions = signal<Option[]>([]);
  actionOption = signal<Option | undefined>(undefined);
  source = signal<TnOptionsFetchFn<Option> | undefined>(undefined);
  actionCount = 0;
  errors: unknown[] = [];
}

describe('tn-autocomplete [dataSource]', () => {
  let fixture: ComponentFixture<DataSourceHostComponent>;
  let host: DataSourceHostComponent;
  let overlayEl: HTMLElement;

  /** Every `(query, page)` the component asked for, in order. */
  let requests: { query: string; page: number }[];
  /** Swappable per-spec response for a request. */
  let responder: (query: string, page: number) => Observable<Option[]>;

  const source: TnOptionsFetchFn<Option> = (query, page) => {
    requests.push({ query, page });
    return responder(query, page);
  };

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.tn-autocomplete__input') as HTMLInputElement;
  }

  function listbox(): HTMLElement {
    return overlayEl.querySelector('.tn-autocomplete__listbox') as HTMLElement;
  }

  function renderedOptions(): string[] {
    return Array.from(overlayEl.querySelectorAll('.tn-autocomplete__option'))
      .map((option) => option.textContent?.trim() ?? '');
  }

  /** Focus the field, which is what triggers the first page. */
  function focus(): void {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  }

  /** Type `text`, then let the debounce elapse and the response render. */
  function type(text: string): void {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    jest.advanceTimersByTime(250);
    fixture.detectChanges();
  }

  /**
   * Make every element report a scrollbar, so the panel never reads as
   * underfilled.
   *
   * jsdom gives every element a zero height, which the auto-fill check
   * correctly treats as "no scrollbar, ask for more" — so without this a source
   * pages itself as far as the auto-fill cap allows the moment it opens, and no
   * case below could isolate a single page. It has to be the prototype rather
   * than `scrollingTo` on the listbox: the first auto-fill round runs during
   * the same `detectChanges` that first renders the listbox, so there is no
   * point at which a spec could reach that element in time.
   */
  function stubFilledPanel(): void {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 400,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => 350,
    });
  }

  /** Put jsdom's zero-height geometry back, i.e. a panel that never fills. */
  function restorePanelGeometry(): void {
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollHeight;
    delete (HTMLElement.prototype as Partial<HTMLElement>).clientHeight;
  }

  /** Scroll the listbox to its end, the condition the paging handler reads. */
  function scrollToEnd(): void {
    const el = listbox();
    Object.defineProperty(el, 'scrollTop', { value: 50, configurable: true });
    el.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    requests = [];
    responder = (query, page) => of(pageOf(query, page, page === 0 ? 2 : 0));
    stubFilledPanel();

    await TestBed.configureTestingModule({
      imports: [DataSourceHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSourceHostComponent);
    host = fixture.componentInstance;
    overlayEl = TestBed.inject(OverlayContainer).getContainerElement();
    host.source.set(source);
    fixture.detectChanges();

    // The library is zoneless, so `fakeAsync`/`tick` are unavailable — jest's
    // own timers stand in to drive the debounce. Installed after the async
    // setup above, which needs real ones to resolve.
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    restorePanelGeometry();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  describe('fetching', () => {
    it('does not query until the panel is first opened', () => {
      // A form of pickers must cost nothing until one is used — the picker this
      // replaced fetched from its own ngOnInit, so merely rendering a field the
      // current user could not even see issued a query.
      expect(requests).toEqual([]);

      focus();

      expect(requests).toEqual([{ query: '', page: 0 }]);
    });

    it('does not refetch the first page when the panel is reopened', () => {
      focus();
      input().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      focus();

      expect(requests).toHaveLength(1);
    });

    it('debounces typing into a single request for the final term', () => {
      focus();
      requests = [];

      input().value = 'a';
      input().dispatchEvent(new Event('input'));
      jest.advanceTimersByTime(100);
      input().value = 'al';
      input().dispatchEvent(new Event('input'));
      jest.advanceTimersByTime(100);
      input().value = 'ali';
      input().dispatchEvent(new Event('input'));
      jest.advanceTimersByTime(250);
      fixture.detectChanges();

      expect(requests).toEqual([{ query: 'ali', page: 0 }]);
    });

    it('renders the fetched page without filtering it again on the label', () => {
      // The server already applied the query. Re-filtering on the label would
      // drop rows it matched on some other field — a domain-prefixed username
      // found by its bare name, say.
      responder = () => of([{ label: 'ACME\\jsmith', value: 'jsmith' }]);
      focus();
      type('jsmith');

      expect(renderedOptions()).toEqual(['ACME\\jsmith']);
    });

    it('ignores [options] while a data source is bound', () => {
      host.staticOptions.set([{ label: 'static', value: 'static' }]);
      fixture.detectChanges();

      focus();

      expect(renderedOptions()).toEqual(['all-p0-0', 'all-p0-1']);
    });
  });

  describe('paging', () => {
    it('appends the next page when scrolled to the end', () => {
      responder = (query, page) => of(pageOf(query, page, page < 2 ? 5 : 1));
      focus();
      expect(renderedOptions()).toEqual(pageOf('', 0, 5).map((o) => o.label));

      scrollToEnd();

      expect(requests).toEqual([{ query: '', page: 0 }, { query: '', page: 1 }]);
      expect(renderedOptions()).toHaveLength(10);
    });

    it('stops paging once a short page proves the source is exhausted', () => {
      // Without an exhaustion latch every further scroll issues another query
      // at a growing offset that can only come back empty.
      responder = (query, page) => of(pageOf(query, page, page === 0 ? 5 : 2));
      focus();

      scrollToEnd();
      expect(requests).toHaveLength(2);

      scrollToEnd();
      scrollToEnd();

      expect(requests).toHaveLength(2);
    });

    it('fills an underfilled panel without waiting for a scroll', () => {
      // A page too short to overflow the panel produces no scroll event, so
      // paging would dead-end with data still available.
      restorePanelGeometry();
      responder = (query, page) => of(pageOf(query, page, page < 2 ? 5 : 1));

      focus();

      expect(requests.map((request) => request.page)).toEqual([0, 1, 2]);
      expect(renderedOptions()).toHaveLength(11);
    });

    it('stops auto-filling a source that never runs out', () => {
      // A source answering synchronously re-arms the underfill check within the
      // same change-detection pass, so without a cap this spins rather than
      // yielding between rounds.
      restorePanelGeometry();
      responder = (query, page) => of(pageOf(query, page, 5));

      focus();

      expect(requests.length).toBeLessThanOrEqual(21);
    });

    it('restarts paging at page 0 for a new search term', () => {
      responder = (query, page) => of(pageOf(query, page, 5));
      focus();
      scrollToEnd();
      expect(requests).toContainEqual({ query: '', page: 1 });

      type('bob');

      expect(requests.at(-1)).toEqual({ query: 'bob', page: 0 });
      expect(renderedOptions()).toEqual(pageOf('bob', 0, 5).map((o) => o.label));
    });

    it('does not advance the cursor over a page that failed', () => {
      // Advancing it would silently skip the rows that page held — they would
      // never appear, however far the user scrolled.
      let failNextPage = true;
      responder = (query, page) => {
        if (page === 1 && failNextPage) {
          failNextPage = false;
          return throwError(() => new Error('nope'));
        }
        return of(pageOf(query, page, 5));
      };
      focus();

      scrollToEnd();
      expect(host.errors).toHaveLength(1);

      scrollToEnd();

      expect(requests.filter((request) => request.page === 1)).toHaveLength(2);
      expect(renderedOptions()).toHaveLength(10);
    });

    it('discards a page that lands after a newer search started', () => {
      const slowPage = new Subject<Option[]>();
      responder = (query, page) => {
        if (page === 1) {
          return slowPage;
        }
        return of(pageOf(query, page, 5));
      };
      focus();
      scrollToEnd();

      type('bob');
      // The stale page answers only now, after the new term's results are up.
      slowPage.next(pageOf('', 1, 5));
      slowPage.complete();
      fixture.detectChanges();

      expect(renderedOptions()).toEqual(pageOf('bob', 0, 5).map((o) => o.label));
    });
  });

  describe('errors', () => {
    it('reports a failure and keeps the field usable', () => {
      // A `catchError` outside the `switchMap` would end the subscription here,
      // freezing the picker for the life of the panel.
      let failing = true;
      responder = (query, page) => (failing
        ? throwError(() => new Error('boom'))
        : of(pageOf(query, page, 2)));

      focus();
      expect(host.errors).toHaveLength(1);

      failing = false;
      type('bob');

      expect(renderedOptions()).toEqual(pageOf('bob', 0, 2).map((o) => o.label));
    });

    it('retries the same term after it failed', () => {
      // `distinctUntilChanged` would otherwise suppress the repeat, and the
      // field could never recover from a transient error without retyping.
      let failing = true;
      responder = (query, page) => (failing
        ? throwError(() => new Error('boom'))
        : of(pageOf(query, page, 2)));

      focus();
      type('bob');
      expect(host.errors).toHaveLength(2);

      failing = false;
      type('bob');

      expect(renderedOptions()).toEqual(pageOf('bob', 0, 2).map((o) => o.label));
    });

    it('does not treat a failed page as an exhausted source', () => {
      responder = () => throwError(() => new Error('boom'));
      focus();
      requests = [];

      scrollToEnd();

      expect(requests).toEqual([{ query: '', page: 1 }]);
    });
  });

  describe('[actionOption]', () => {
    const addNew: Option = { label: 'Add New', value: '__add__' };

    beforeEach(() => {
      host.actionOption.set(addNew);
      fixture.detectChanges();
    });

    it('pins the row above the results and keeps it while searching', () => {
      focus();
      expect(renderedOptions()[0]).toBe('Add New');

      type('bob');

      expect(renderedOptions()[0]).toBe('Add New');
    });

    it('emits actionSelected and commits nothing to the control', () => {
      // The old picker committed a `NEW` sentinel, which satisfied
      // `Validators.required` and could be submitted as if it were a username.
      focus();
      type('bo');

      (overlayEl.querySelector('.tn-autocomplete__option') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.actionCount).toBe(1);
      expect(host.control.value).toBeNull();
      // The partial term typed to reach the row must not survive as text.
      expect(input().value).toBe('');
    });

    it('restores the committed value\'s label after the action row is chosen', () => {
      focus();
      (overlayEl.querySelectorAll('.tn-autocomplete__option')[1] as HTMLElement).click();
      fixture.detectChanges();
      expect(host.control.value).toBe('all-p0-0');

      focus();
      type('zz');
      (overlayEl.querySelector('.tn-autocomplete__option') as HTMLElement).click();
      fixture.detectChanges();

      expect(host.control.value).toBe('all-p0-0');
      expect(input().value).toBe('all-p0-0');
    });

    it('still reports no results when only the action row matched', () => {
      responder = () => of([]);
      focus();

      expect(overlayEl.querySelector('.tn-autocomplete__no-results')).toBeTruthy();
      expect(renderedOptions()).toEqual(['Add New']);
    });
  });

  describe('[keepSelectedOption]', () => {
    it('keeps the committed value listed when the page does not contain it', () => {
      // A preset value sorted past the first page, or one just created that the
      // query does not match yet. Without this the field renders blank for a
      // perfectly valid value.
      host.control.setValue('bob');
      fixture.detectChanges();
      expect(input().value).toBe('bob');

      focus();

      expect(renderedOptions()).toContain('bob');
      expect(input().value).toBe('bob');
    });

    it('drops the synthetic row once a page carries the real option', () => {
      host.control.setValue('all-p0-0');
      fixture.detectChanges();

      focus();

      expect(renderedOptions()).toEqual(['all-p0-0', 'all-p0-1']);
    });
  });
});
