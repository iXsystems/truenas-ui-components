import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnBannerComponent } from './banner.component';
import { TN_TEST_ATTR } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/**
 * A banner is the element a suite asserts a warning on — the sign-in page's
 * "not served over HTTPS" notice is a `tn-banner` — and it used to carry no id
 * the library owned, so each consumer tagged the element by hand at the call
 * site and invented its own naming.
 *
 * These pin the emitted value rather than merely "an attribute is present": the
 * `banner-` prefix is the library's, the base is kebab-normalized by the same
 * `composeTestId` every other id goes through, an unset base writes no
 * attribute at all (not `banner`, and not an empty string), and the whole thing
 * honours `TN_TEST_ATTR` — which is the point, since a consumer on `data-test`
 * has to keep its existing selector convention.
 */
@Component({
  selector: 'tn-banner-test-id-host',
  standalone: true,
  imports: [TnBannerComponent],
  template: `<tn-banner heading="Insecure connection" type="warning" [testId]="testId()" />`,
})
class BannerTestIdHostComponent {
  readonly testId = signal<TnTestIdValue>('insecure-connection');
}

describe('TnBannerComponent [testId]', () => {
  type Fixture = ComponentFixture<BannerTestIdHostComponent>;

  function setup(attr?: 'data-test'): Fixture {
    TestBed.configureTestingModule({
      imports: [BannerTestIdHostComponent],
      providers: [
        provideHttpClient(),
        ...(attr ? [{ provide: TN_TEST_ATTR, useValue: attr }] : []),
      ],
    });
    const fixture = TestBed.createComponent(BannerTestIdHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  const root = (fixture: Fixture): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.tn-banner') as HTMLElement;

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('writes a banner-prefixed id the consumer never spells out', () => {
    const fixture = setup();

    expect(root(fixture).getAttribute('data-testid')).toBe('banner-insecure-connection');
  });

  it('puts the id on the element carrying the live-region role', () => {
    const fixture = setup();

    // The same element assistive tech announces, so a test asserting the
    // warning and a screen reader reading it are looking at one element.
    const tagged = (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="banner-insecure-connection"]');
    expect(tagged?.getAttribute('role')).toBe('alert');
  });

  it('kebab-cases the base and composes an array base in order', () => {
    const fixture = setup();
    fixture.componentInstance.testId.set(['Insecure', undefined, 'connectionWarning']);
    fixture.detectChanges();

    expect(root(fixture).getAttribute('data-testid')).toBe('banner-insecure-connection-warning');
  });

  it('writes no attribute when the input is unset', () => {
    const fixture = setup();
    fixture.componentInstance.testId.set(undefined);
    fixture.detectChanges();

    // Not the bare type, and not an empty string: `banner` alone is non-unique
    // and useless to automation.
    expect(root(fixture).hasAttribute('data-testid')).toBe(false);
  });

  it('writes to the attribute the app configured through TN_TEST_ATTR', () => {
    const fixture = setup('data-test');

    expect(root(fixture).getAttribute('data-test')).toBe('banner-insecure-connection');
    expect(root(fixture).hasAttribute('data-testid')).toBe(false);
  });
});
