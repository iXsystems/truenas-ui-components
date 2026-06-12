import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnAutocompleteComponent, type TnAutocompleteOption } from './autocomplete.component';

interface Country {
  code: string;
  name: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
];

const countryOptions = countries.map((c) => ({ label: c.name, value: c.code }));

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [options]="options()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [requireSelection]="requireSelection()"
      [maxResults]="maxResults()"
      [formControl]="control"
      (optionSelected)="selected = $event" />
  `
})
class TestHostComponent {
  options = signal(countryOptions);
  placeholder = signal('Search...');
  disabled = signal(false);
  requireSelection = signal(false);
  maxResults = signal(100);
  control = new FormControl<string | null>(null);
  selected: TnAutocompleteOption<string> | null = null;
}

@Component({
  selector: 'tn-async-test-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [options]="options()"
      [loading]="loading()"
      [allowCustomValue]="true"
      [maxResults]="maxResults()"
      [formControl]="control"
      (searchChange)="searchTerms.push($event)"
      (loadMore)="loadMoreCount = loadMoreCount + 1"
      (opened)="openedCount = openedCount + 1" />
  `
})
class AsyncTestHostComponent {
  options = signal(['alpha', 'beta', 'gamma'].map((name) => ({ label: name, value: name })));
  loading = signal(false);
  maxResults = signal(Infinity);
  control = new FormControl<string | null>(null);
  searchTerms: string[] = [];
  loadMoreCount = 0;
  openedCount = 0;
}

@Component({
  selector: 'tn-label-value-test-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [options]="options()"
      [requireSelection]="requireSelection()"
      [formControl]="control" />
  `
})
class LabelValueHostComponent {
  options = signal(countryOptions);
  requireSelection = signal(false);
  control = new FormControl<string | null>(null);
}

describe('TnAutocompleteComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let overlayContainer: OverlayContainer;
  let overlayEl: HTMLElement;

  const getInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('.tn-autocomplete__input');

  // The dropdown panel is portaled into the CDK overlay container (on
  // document.body), not the component host, so all panel queries go there.
  const getDropdown = (): HTMLElement | null =>
    overlayEl.querySelector('.tn-autocomplete__dropdown');

  const getOptions = (): HTMLElement[] =>
    Array.from(overlayEl.querySelectorAll('.tn-autocomplete__option'));

  const getHighlighted = (): HTMLElement | null =>
    overlayEl.querySelector('.tn-autocomplete__option.highlighted');

  const typeInInput = (value: string) => {
    const input = getInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const focusInput = () => {
    getInput().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  };

  const pressKey = (key: string) => {
    getInput().dispatchEvent(new KeyboardEvent('keydown', { key }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayEl = overlayContainer.getContainerElement();
    fixture.detectChanges();
  });

  afterEach(() => {
    // Dispose any overlay left attached so panels don't leak between specs.
    overlayContainer.ngOnDestroy();
  });

  describe('dropdown visibility', () => {
    it('should be closed initially', () => {
      expect(getDropdown()).toBeNull();
    });

    it('should open on focus', () => {
      focusInput();
      expect(getDropdown()).toBeTruthy();
    });

    it('should open on typing', () => {
      typeInInput('C');
      expect(getDropdown()).toBeTruthy();
    });

    it('should close on Escape', () => {
      focusInput();
      expect(getDropdown()).toBeTruthy();

      pressKey('Escape');
      expect(getDropdown()).toBeNull();
    });

    it('should not open when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      focusInput();
      expect(getDropdown()).toBeNull();
    });
  });

  describe('filtering', () => {
    it('should show all options when input is empty', () => {
      focusInput();
      expect(getOptions().length).toBe(5);
    });

    it('should filter by option label text', () => {
      typeInInput('can');
      expect(getOptions().length).toBe(1);
      expect(getOptions()[0].textContent?.trim()).toBe('Canada');
    });

    it('should be case-insensitive', () => {
      typeInInput('UNITED');
      expect(getOptions().length).toBe(2);
    });

    it('should show no-results message when nothing matches', () => {
      typeInInput('xyz');
      const noResults = overlayEl.querySelector('.tn-autocomplete__no-results');
      expect(noResults).toBeTruthy();
      expect(noResults.textContent?.trim()).toBe('No results found');
    });
  });

  describe('maxResults', () => {
    it('should cap rendered options', () => {
      host.maxResults.set(2);
      fixture.detectChanges();

      focusInput();
      expect(getOptions().length).toBe(2);
    });
  });

  describe('selection', () => {
    it('should update input text on option click', () => {
      focusInput();
      getOptions()[1].click();
      fixture.detectChanges();

      expect(getInput().value).toBe('Canada');
    });

    it('should emit optionSelected', () => {
      focusInput();
      getOptions()[2].click();
      fixture.detectChanges();

      expect(host.selected).toEqual({ label: 'Mexico', value: 'MX' });
    });

    it('should update form control value', () => {
      focusInput();
      getOptions()[0].click();
      fixture.detectChanges();

      expect(host.control.value).toBe('US');
    });

    it('should close dropdown after selection', () => {
      focusInput();
      getOptions()[0].click();
      fixture.detectChanges();

      expect(getDropdown()).toBeNull();
    });
  });

  describe('keyboard navigation', () => {
    it('should open dropdown on ArrowDown when closed', () => {
      pressKey('ArrowDown');
      expect(getDropdown()).toBeTruthy();
    });

    it('should highlight next option on ArrowDown', () => {
      focusInput();
      pressKey('ArrowDown');
      expect(getHighlighted()?.textContent?.trim()).toBe('United States');

      pressKey('ArrowDown');
      expect(getHighlighted()?.textContent?.trim()).toBe('Canada');
    });

    it('should wrap to first option on ArrowDown from last', () => {
      focusInput();
      for (let i = 0; i < 5; i++) {
        pressKey('ArrowDown');
      }
      expect(getHighlighted()?.textContent?.trim()).toBe('Germany');

      pressKey('ArrowDown');
      expect(getHighlighted()?.textContent?.trim()).toBe('United States');
    });

    it('should highlight previous option on ArrowUp', () => {
      focusInput();
      pressKey('ArrowDown');
      pressKey('ArrowDown');
      pressKey('ArrowUp');
      expect(getHighlighted()?.textContent?.trim()).toBe('United States');
    });

    it('should wrap to last option on ArrowUp from first', () => {
      focusInput();
      pressKey('ArrowDown');
      pressKey('ArrowUp');
      expect(getHighlighted()?.textContent?.trim()).toBe('Germany');
    });

    it('should select highlighted option on Enter', () => {
      focusInput();
      pressKey('ArrowDown');
      pressKey('ArrowDown');
      pressKey('Enter');

      expect(host.control.value).toBe('CA');
      expect(getDropdown()).toBeNull();
    });

    it('should not select on Enter when nothing is highlighted', () => {
      focusInput();
      pressKey('Enter');

      expect(host.control.value).toBeNull();
    });
  });

  describe('writeValue (CVA)', () => {
    it('should display value set programmatically via form control', () => {
      host.control.setValue('DE');
      fixture.detectChanges();

      expect(getInput().value).toBe('Germany');
    });

    it('should clear input when form control is reset', () => {
      host.control.setValue('GB');
      fixture.detectChanges();
      expect(getInput().value).toBe('United Kingdom');

      host.control.reset();
      fixture.detectChanges();
      expect(getInput().value).toBe('');
    });
  });

  describe('requireSelection', () => {
    beforeEach(() => {
      host.requireSelection.set(true);
      fixture.detectChanges();
    });

    it('should revert to last valid selection on blur with invalid text', () => {
      focusInput();
      getOptions()[0].click();
      fixture.detectChanges();

      typeInInput('garbage');
      getInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(getInput().value).toBe('United States');
    });

    it('should clear when no prior selection and invalid text', () => {
      typeInInput('garbage');
      getInput().dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(getInput().value).toBe('');
      expect(host.control.value).toBeNull();
    });
  });

  describe('label/value resolution', () => {
    let vwFixture: ComponentFixture<LabelValueHostComponent>;
    let vwHost: LabelValueHostComponent;

    const getVwInput = (): HTMLInputElement =>
      vwFixture.nativeElement.querySelector('.tn-autocomplete__input');

    const typeVw = (value: string) => {
      const input = getVwInput();
      input.value = value;
      input.dispatchEvent(new Event('input'));
      vwFixture.detectChanges();
    };

    beforeEach(() => {
      vwFixture = TestBed.createComponent(LabelValueHostComponent);
      vwHost = vwFixture.componentInstance;
      vwFixture.detectChanges();
    });

    it('commits the option value when an option is selected', () => {
      typeVw('United S');
      const option = overlayEl.querySelector<HTMLElement>('.tn-autocomplete__option');
      option?.click();
      vwFixture.detectChanges();

      expect(vwHost.control.value).toBe('US');
      expect(getVwInput().value).toBe('United States');
    });

    it('displays the matching option label for a written value', () => {
      vwHost.control.setValue('CA');
      vwFixture.detectChanges();

      expect(getVwInput().value).toBe('Canada');
    });

    it('upgrades a raw written value to its label once options load', () => {
      vwHost.options.set([]);
      vwFixture.detectChanges();

      vwHost.control.setValue('MX');
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('MX');

      vwHost.options.set(countryOptions);
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('Mexico');
    });

    it('updates the committed label when options are relabeled', () => {
      vwHost.control.setValue('CA');
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('Canada');

      // e.g. a locale change re-emits the same values with new labels.
      vwHost.options.set(countryOptions.map((opt) => ({ ...opt, label: `${opt.label} (${opt.value})` })));
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('Canada (CA)');
    });

    it('does not downgrade a resolved label when options are later replaced', () => {
      vwHost.control.setValue('CA');
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('Canada');

      // A server-search picker may replace options after selection — the
      // committed label must not flip back to the raw 'CA'.
      vwHost.options.set([]);
      vwFixture.detectChanges();
      expect(getVwInput().value).toBe('Canada');
    });

    it('commits the option value when requireSelection matches typed text on blur', () => {
      vwHost.requireSelection.set(true);
      vwFixture.detectChanges();

      typeVw('germany');
      getVwInput().dispatchEvent(new Event('blur'));
      vwFixture.detectChanges();

      expect(vwHost.control.value).toBe('DE');
      expect(getVwInput().value).toBe('Germany');
    });

    it('reverts to the committed value display when requireSelection rejects text', () => {
      vwHost.requireSelection.set(true);
      vwHost.control.setValue('US');
      vwFixture.detectChanges();

      typeVw('garbage');
      getVwInput().dispatchEvent(new Event('blur'));
      vwFixture.detectChanges();

      expect(vwHost.control.value).toBe('US');
      expect(getVwInput().value).toBe('United States');
    });
  });

  describe('async loading & custom values', () => {
    let asyncFixture: ComponentFixture<AsyncTestHostComponent>;
    let asyncHost: AsyncTestHostComponent;

    const getAsyncInput = (): HTMLInputElement =>
      asyncFixture.nativeElement.querySelector('.tn-autocomplete__input');

    const typeAsync = (value: string) => {
      const input = getAsyncInput();
      input.value = value;
      input.dispatchEvent(new Event('input'));
      asyncFixture.detectChanges();
    };

    beforeEach(() => {
      asyncFixture = TestBed.createComponent(AsyncTestHostComponent);
      asyncHost = asyncFixture.componentInstance;
      asyncFixture.detectChanges();
    });

    it('emits opened when the panel opens so consumers can prime the first page', () => {
      getAsyncInput().dispatchEvent(new Event('focus'));
      asyncFixture.detectChanges();
      expect(asyncHost.openedCount).toBe(1);

      // Already open — typing doesn't re-emit.
      typeAsync('a');
      expect(asyncHost.openedCount).toBe(1);

      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();
      getAsyncInput().dispatchEvent(new Event('focus'));
      asyncFixture.detectChanges();
      expect(asyncHost.openedCount).toBe(2);
    });

    it('emits searchChange as the user types', () => {
      typeAsync('al');
      typeAsync('alp');

      expect(asyncHost.searchTerms).toEqual(['al', 'alp']);
    });

    it('does not emit searchChange on programmatic writes', () => {
      asyncHost.control.setValue('beta');
      asyncFixture.detectChanges();

      expect(asyncHost.searchTerms).toEqual([]);
    });

    it('shows the loading row instead of no-results while loading', () => {
      asyncHost.options.set([]);
      asyncHost.loading.set(true);
      asyncFixture.detectChanges();
      typeAsync('zz');

      expect(overlayEl.querySelector('.tn-autocomplete__loading')).toBeTruthy();
      expect(overlayEl.querySelector('.tn-autocomplete__no-results')).toBeNull();
    });

    it('emits loadMore once per options page when scrolled to the bottom', () => {
      typeAsync('a');
      const dropdown = overlayEl.querySelector('.tn-autocomplete__dropdown');
      expect(dropdown).toBeTruthy();

      dropdown?.dispatchEvent(new Event('scroll'));
      dropdown?.dispatchEvent(new Event('scroll'));
      expect(asyncHost.loadMoreCount).toBe(1);

      // Appending the next page re-arms the emitter.
      asyncHost.options.set([...asyncHost.options(), { label: 'delta', value: 'delta' }]);
      asyncFixture.detectChanges();
      dropdown?.dispatchEvent(new Event('scroll'));
      expect(asyncHost.loadMoreCount).toBe(2);
    });

    it('commits typed text as the value on blur', () => {
      typeAsync('/my-custom-port');
      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBe('/my-custom-port');
      expect(getAsyncInput().value).toBe('/my-custom-port');
    });

    it('commits typed text as the value on Enter when nothing is highlighted', () => {
      typeAsync('typed-value');
      getAsyncInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBe('typed-value');
    });

    it('commits the matching option when typed text equals an option display', () => {
      typeAsync('beta');
      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBe('beta');
    });

    it('matches options case-insensitively before committing a custom value', () => {
      typeAsync('BETA');
      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBe('beta');
    });

    it('keeps loading and no-results rows outside the listbox', () => {
      typeAsync('a');
      const listbox = overlayEl.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
      expect(listbox?.querySelectorAll(':scope > :not([role="option"])')).toHaveLength(0);

      asyncHost.options.set([]);
      asyncHost.loading.set(true);
      asyncFixture.detectChanges();

      // The listbox stays rendered (empty, busy) so aria-controls never dangles.
      const emptyListbox = overlayEl.querySelector('[role="listbox"]');
      expect(emptyListbox).toBeTruthy();
      expect(emptyListbox?.querySelectorAll('[role="option"]')).toHaveLength(0);
      expect(emptyListbox?.getAttribute('aria-busy')).toBe('true');
      expect(overlayEl.querySelector('[role="status"] .tn-autocomplete__loading')).toBeTruthy();
    });

    it('requests another page when the rendered page does not fill the panel', () => {
      // jsdom reports scrollHeight === clientHeight === 0, i.e. an underfilled
      // panel — exactly the no-scrollbar case the auto-check exists for.
      typeAsync('a');
      expect(asyncHost.loadMoreCount).toBe(1);

      // Source exhausted: the consumer answers with the same count — no re-arm,
      // no further requests (loop safety).
      asyncHost.options.set([...asyncHost.options()]);
      asyncFixture.detectChanges();
      expect(asyncHost.loadMoreCount).toBe(1);

      // A grown page re-arms and, still underfilled, requests the next one.
      asyncHost.options.set([...asyncHost.options(), { label: 'delta', value: 'delta' }]);
      asyncFixture.detectChanges();
      expect(asyncHost.loadMoreCount).toBe(2);
    });

    it('ignores scrolls of stale rows while a page is loading', () => {
      typeAsync('a');
      expect(asyncHost.loadMoreCount).toBe(1);

      // A page landed but the consumer is still loading — the visible rows
      // are stale, so scrolling them must not request yet another page.
      asyncHost.loading.set(true);
      asyncHost.options.set([...asyncHost.options(), { label: 'delta', value: 'delta' }]);
      asyncFixture.detectChanges();

      const dropdown = overlayEl.querySelector('.tn-autocomplete__dropdown');
      dropdown?.dispatchEvent(new Event('scroll'));
      expect(asyncHost.loadMoreCount).toBe(1);
    });

    it('re-runs the underfill check when loading clears after options land', () => {
      typeAsync('a');
      expect(asyncHost.loadMoreCount).toBe(1);

      // The page lands while loading is still set — the check is deferred...
      asyncHost.loading.set(true);
      asyncHost.options.set([...asyncHost.options(), { label: 'delta', value: 'delta' }]);
      asyncFixture.detectChanges();
      expect(asyncHost.loadMoreCount).toBe(1);

      // ...and runs once loading clears in a later tick, keeping pagination alive.
      asyncHost.loading.set(false);
      asyncFixture.detectChanges();
      expect(asyncHost.loadMoreCount).toBe(2);
    });

    it('does not auto-paginate past a maxResults rendering cap', () => {
      asyncHost.maxResults.set(3);
      asyncFixture.detectChanges();

      // The panel is underfilled (jsdom: zero heights) but rendering is already
      // capped at the 3 loaded rows — more data could never fill it.
      getAsyncInput().dispatchEvent(new Event('focus'));
      asyncFixture.detectChanges();
      expect(asyncHost.loadMoreCount).toBe(0);
    });

    it('reverts the draft text on Escape so blur does not commit it', () => {
      asyncHost.control.setValue('beta');
      asyncFixture.detectChanges();

      typeAsync('abandoned-draft');
      getAsyncInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      asyncFixture.detectChanges();
      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBe('beta');
      expect(getAsyncInput().value).toBe('beta');
    });

    it('clears the value when the text is emptied', () => {
      asyncHost.control.setValue('beta');
      asyncFixture.detectChanges();

      typeAsync('');
      getAsyncInput().dispatchEvent(new Event('blur'));
      asyncFixture.detectChanges();

      expect(asyncHost.control.value).toBeNull();
    });
  });
});
