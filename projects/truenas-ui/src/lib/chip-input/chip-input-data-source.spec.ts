import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
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
