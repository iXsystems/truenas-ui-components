import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { TnChipInputComponent } from './chip-input.component';
import type { TnChipInputOption } from './chip-input.component';
import type { TnOptionsFetchFn } from '../utils/options-data-source';

/**
 * `[dataSource]` — server-driven suggestions for `tn-chip-input`.
 *
 * The same engine `tn-autocomplete` uses, minus paging: the chip dropdown shows
 * one page. What it removes from consumers is the `(searchChange)` → subject →
 * `debounceTime` → `switchMap` → `catchError` → `shareReplay` pipeline that
 * every user/group chip field in the app had written out by hand.
 */

type Option = TnChipInputOption<string>;

@Component({
  selector: 'tn-chip-data-source-host',
  standalone: true,
  imports: [TnChipInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-chip-input
      [formControl]="control"
      [dataSource]="source()"
      [dataSourceDebounce]="250"
      [suggestions]="staticSuggestions()"
      (dataSourceError)="errors.push($event)" />
  `,
})
class ChipDataSourceHostComponent {
  control = new FormControl<string[]>([]);
  staticSuggestions = signal<string[]>([]);
  source = signal<TnOptionsFetchFn<Option> | undefined>(undefined);
  errors: unknown[] = [];
}

describe('tn-chip-input [dataSource]', () => {
  let fixture: ComponentFixture<ChipDataSourceHostComponent>;
  let host: ChipDataSourceHostComponent;
  let overlayEl: HTMLElement;

  let queries: string[];
  let responder: (query: string) => Observable<Option[]>;

  const source: TnOptionsFetchFn<Option> = (query) => {
    queries.push(query);
    return responder(query);
  };

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  function renderedSuggestions(): string[] {
    return Array.from(overlayEl.querySelectorAll('.tn-chip-input__option'))
      .map((option) => option.textContent?.trim() ?? '');
  }

  function listbox(): HTMLElement | null {
    return overlayEl.querySelector('.tn-chip-input__listbox');
  }

  function loadingRow(): HTMLElement | null {
    return overlayEl.querySelector('.tn-chip-input__loading');
  }

  function focus(): void {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  }

  function type(text: string): void {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    jest.advanceTimersByTime(250);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    queries = [];
    responder = (query) => of(
      ['admins', 'analysts', 'builders']
        .filter((name) => name.startsWith(query))
        .map((name) => ({ label: name, value: name })),
    );

    await TestBed.configureTestingModule({
      imports: [ChipDataSourceHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipDataSourceHostComponent);
    host = fixture.componentInstance;
    overlayEl = TestBed.inject(OverlayContainer).getContainerElement();
    host.source.set(source);
    fixture.detectChanges();

    // The library is zoneless, so `fakeAsync`/`tick` are unavailable.
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('does not query until the field is first focused', () => {
    expect(queries).toEqual([]);

    focus();

    expect(queries).toEqual(['']);
  });

  it('opens the panel on the first page fetched at focus', () => {
    // A static suggestion list drops the panel open on focus; an async one has
    // nothing to show at that instant, so it has to open when the page lands.
    focus();

    expect(renderedSuggestions()).toEqual(['admins', 'analysts', 'builders']);
  });

  it('debounces typing into a single query for the final term', () => {
    focus();
    queries = [];

    input().value = 'a';
    input().dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(100);
    input().value = 'an';
    input().dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(250);
    fixture.detectChanges();

    expect(queries).toEqual(['an']);
  });

  it('renders the fetched page without filtering it again on the label', () => {
    // The server already applied the query; a second client-side pass would
    // drop rows it matched on some other field.
    responder = () => of([{ label: 'ACME\\ops', value: 'ops' }]);
    focus();
    type('ops');

    expect(renderedSuggestions()).toEqual(['ACME\\ops']);
  });

  it('supersedes [suggestions] while bound', () => {
    host.staticSuggestions.set(['static']);
    fixture.detectChanges();

    focus();

    expect(renderedSuggestions()).toEqual(['admins', 'analysts', 'builders']);
  });

  it('still hides an option already committed as a chip', () => {
    host.control.setValue(['admins']);
    fixture.detectChanges();

    focus();

    expect(renderedSuggestions()).toEqual(['analysts', 'builders']);
  });

  it('marks the dropdown busy while a request is in flight', () => {
    // With a `dataSource` the rows are NOT re-filtered on the label, so between
    // the keystroke and the response the panel is showing the PREVIOUS term's
    // matches — clickable, and indistinguishable from a result set. The
    // autocomplete has said so with a spinner and `aria-busy` since it grew a
    // `dataSource`; this had no equivalent.
    const pending = new Subject<Option[]>();
    focus();
    expect(loadingRow()).toBeNull();

    responder = () => pending;
    type('ana');

    expect(renderedSuggestions()).toEqual(['admins', 'analysts', 'builders']);
    expect(listbox()?.getAttribute('aria-busy')).toBe('true');
    expect(loadingRow()?.textContent).toContain('Loading...');

    pending.next([{ label: 'analysts', value: 'analysts' }]);
    pending.complete();
    fixture.detectChanges();

    expect(renderedSuggestions()).toEqual(['analysts']);
    expect(listbox()?.getAttribute('aria-busy')).toBeNull();
    expect(loadingRow()).toBeNull();
  });

  it('leaves the panel closed after a chip is committed', () => {
    // Committing changes the suggestion list — the chosen row drops out — which
    // re-runs the effect that re-opens the panel when results arrive. With a
    // `dataSource` bound the field counts as "actively searching" even on an
    // empty input, so the panel sprang straight back open against a blank
    // field, still listing the rows of the term just committed. The static
    // path never did this: there, the empty input ends the search.
    focus();
    type('a');
    expect(renderedSuggestions()).toEqual(['admins', 'analysts']);

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.control.value).toEqual(['a']);
    expect(renderedSuggestions()).toEqual([]);
  });

  it('re-opens on the next keystroke after a commit', () => {
    focus();
    type('a');
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    type('b');

    expect(renderedSuggestions()).toEqual(['builders']);
  });

  describe('refreshOptions()', () => {
    function component(): TnChipInputComponent<string> {
      return fixture.debugElement.children[0].componentInstance as TnChipInputComponent<string>;
    }

    it('re-queries the current term instead of being suppressed as a duplicate', () => {
      focus();
      type('a');
      queries = [];
      responder = () => of([{ label: 'narrowed', value: 'narrowed' }]);

      component().refreshOptions();
      fixture.detectChanges();

      expect(queries).toEqual(['a']);
      expect(renderedSuggestions()).toEqual(['narrowed']);
    });

    it('does not query for a field that has never been focused', () => {
      component().refreshOptions();
      fixture.detectChanges();
      expect(queries).toEqual([]);

      focus();

      expect(queries).toEqual(['']);
    });
  });

  it('reports a failure and keeps the field usable', () => {
    let failing = true;
    responder = (query) => (failing
      ? throwError(() => new Error('boom'))
      : of([{ label: query, value: query }]));

    focus();
    expect(host.errors).toHaveLength(1);

    failing = false;
    type('ops');

    expect(renderedSuggestions()).toEqual(['ops']);
  });
});
