import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnAutocompleteComponent } from './autocomplete.component';

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

const displayCountry = (c: Country): string => c.name;

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnAutocompleteComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-autocomplete
      [options]="options()"
      [displayWith]="displayCountry"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [requireSelection]="requireSelection()"
      [maxResults]="maxResults()"
      [formControl]="control"
      (optionSelected)="selected = $event" />
  `
})
class TestHostComponent {
  options = signal(countries);
  placeholder = signal('Search...');
  disabled = signal(false);
  requireSelection = signal(false);
  maxResults = signal(100);
  control = new FormControl<Country | null>(null);
  selected: Country | null = null;
  displayCountry = displayCountry;
}

describe('TnAutocompleteComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const getInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('.tn-autocomplete__input');

  const getDropdown = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.tn-autocomplete__dropdown');

  const getOptions = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tn-autocomplete__option'));

  const getHighlighted = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.tn-autocomplete__option.highlighted');

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
    fixture.detectChanges();
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

    it('should filter by displayWith text', () => {
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
      const noResults = fixture.nativeElement.querySelector('.tn-autocomplete__no-results');
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

      expect(host.selected).toEqual({ code: 'MX', name: 'Mexico' });
    });

    it('should update form control value', () => {
      focusInput();
      getOptions()[0].click();
      fixture.detectChanges();

      expect(host.control.value).toEqual({ code: 'US', name: 'United States' });
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

      expect(host.control.value).toEqual({ code: 'CA', name: 'Canada' });
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
      host.control.setValue({ code: 'DE', name: 'Germany' });
      fixture.detectChanges();

      expect(getInput().value).toBe('Germany');
    });

    it('should clear input when form control is reset', () => {
      host.control.setValue({ code: 'GB', name: 'United Kingdom' });
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

    it('should revert to last valid selection on blur with invalid text', (done) => {
      focusInput();
      getOptions()[0].click();
      fixture.detectChanges();

      typeInInput('garbage');
      getInput().dispatchEvent(new Event('blur'));

      setTimeout(() => {
        fixture.detectChanges();
        expect(getInput().value).toBe('United States');
        done();
      }, 200);
    });

    it('should clear when no prior selection and invalid text', (done) => {
      typeInInput('garbage');
      getInput().dispatchEvent(new Event('blur'));

      setTimeout(() => {
        fixture.detectChanges();
        expect(getInput().value).toBe('');
        expect(host.control.value).toBeNull();
        done();
      }, 200);
    });
  });
});
