import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnSelectComponent, TN_SELECT_LABELS, type TnSelectLabels } from './select.component';

/**
 * Covers the app-wide label defaults: a select with no label bindings renders
 * whatever `TN_SELECT_LABELS` supplies, an explicit binding still wins, and a
 * signal-valued token re-renders when the app switches language.
 */
@Component({
  selector: 'tn-labels-test-host',
  standalone: true,
  imports: [TnSelectComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-select [options]="[]" [showSelectAll]="true" [multiple]="true" />
    <tn-select
      [options]="[]"
      [multiple]="true"
      [showSelectAll]="true"
      [placeholder]="placeholder()"
      [noOptionsLabel]="noOptionsLabel()"
      [selectAllLabel]="selectAllLabel()" />
  `
})
class LabelsTestHostComponent {
  placeholder = signal<string | undefined>('Pick a disk');
  noOptionsLabel = signal<string | undefined>('Nothing here');
  selectAllLabel = signal<string | undefined>('Take everything');
}

function triggerTexts(fixture: ComponentFixture<LabelsTestHostComponent>): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('tn-select'))
    .map((select) => (select as HTMLElement).textContent?.trim() ?? '');
}

describe('TnSelectComponent labels', () => {
  function setup(labels?: TnSelectLabels | ReturnType<typeof signal<TnSelectLabels>>): ComponentFixture<LabelsTestHostComponent> {
    TestBed.configureTestingModule({
      imports: [LabelsTestHostComponent],
      providers: labels ? [{ provide: TN_SELECT_LABELS, useValue: labels }] : [],
    });
    const fixture = TestBed.createComponent(LabelsTestHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('falls back to the English defaults when no token is provided', () => {
    const fixture = setup();
    expect(triggerTexts(fixture)[0]).toContain('Select an option');
  });

  it('renders the app-wide placeholder from a plain-object token', () => {
    const fixture = setup({ placeholder: 'Choisir', noOptions: 'Aucune option', selectAll: 'Tout' });
    expect(triggerTexts(fixture)[0]).toContain('Choisir');
  });

  it('lets an explicit input win over the token', () => {
    const fixture = setup({ placeholder: 'Choisir', noOptions: 'Aucune option', selectAll: 'Tout' });
    expect(triggerTexts(fixture)[1]).toContain('Pick a disk');
  });

  it('falls back to the token when an explicit input is cleared', () => {
    const fixture = setup({ placeholder: 'Choisir', noOptions: 'Aucune option', selectAll: 'Tout' });
    fixture.componentInstance.placeholder.set(undefined);
    fixture.detectChanges();

    expect(triggerTexts(fixture)[1]).toContain('Choisir');
  });

  it('re-renders when a signal-valued token changes, so a language switch propagates', () => {
    const labels = signal<TnSelectLabels>({
      placeholder: 'Select an option', noOptions: 'No options available', selectAll: 'Select All',
    });
    const fixture = setup(labels);
    expect(triggerTexts(fixture)[0]).toContain('Select an option');

    labels.set({ placeholder: 'Choisir', noOptions: 'Aucune option', selectAll: 'Tout' });
    fixture.detectChanges();

    expect(triggerTexts(fixture)[0]).toContain('Choisir');
  });
});
