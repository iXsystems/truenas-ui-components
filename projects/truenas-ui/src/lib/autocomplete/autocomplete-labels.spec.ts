import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnAutocompleteComponent, TN_AUTOCOMPLETE_LABELS, type TnAutocompleteLabels } from './autocomplete.component';

/**
 * Covers the app-wide label defaults: an autocomplete with no label bindings
 * renders whatever `TN_AUTOCOMPLETE_LABELS` supplies, an explicit binding still
 * wins, and a signal-valued token re-renders when the app switches language.
 */
@Component({
  selector: 'tn-autocomplete-labels-host',
  standalone: true,
  imports: [TnAutocompleteComponent],
  template: `
    <tn-autocomplete [options]="[]" />
    <tn-autocomplete [options]="[]" [placeholder]="placeholder()" />
  `
})
class LabelsHostComponent {
  placeholder = signal<string | undefined>('Find a share');
}

function placeholders(fixture: ComponentFixture<LabelsHostComponent>): (string | null)[] {
  return Array.from(fixture.nativeElement.querySelectorAll('input'))
    .map((input) => (input as HTMLInputElement).getAttribute('placeholder'));
}

describe('TnAutocompleteComponent labels', () => {
  const french: TnAutocompleteLabels = {
    placeholder: 'Rechercher…', loading: 'Chargement…', noResults: 'Aucun résultat',
  };

  function setup(
    labels?: TnAutocompleteLabels | ReturnType<typeof signal<TnAutocompleteLabels>>,
  ): ComponentFixture<LabelsHostComponent> {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent],
      providers: labels ? [{ provide: TN_AUTOCOMPLETE_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('falls back to the English default when no token is provided', () => {
    expect(placeholders(setup())[0]).toBe('Type to search...');
  });

  it('renders the app-wide placeholder from a plain-object token', () => {
    expect(placeholders(setup(french))[0]).toBe('Rechercher…');
  });

  it('lets an explicit input win over the token', () => {
    expect(placeholders(setup(french))[1]).toBe('Find a share');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnAutocompleteLabels>({
      placeholder: 'Type to search...', loading: 'Loading...', noResults: 'No results found',
    });
    const fixture = setup(labels);
    expect(placeholders(fixture)[0]).toBe('Type to search...');

    labels.set(french);
    fixture.detectChanges();

    expect(placeholders(fixture)[0]).toBe('Rechercher…');
  });
});
