import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnBannerComponent } from './banner.component';
import type { TnBannerType } from './banner.component';
import { liveSources, politeness } from '../a11y/live-region-testing';

/**
 * Guards the live-region contract fixed for #194: the banner carried a static
 * `aria-live="polite"` beside `[attr.role]="ariaRole()"`. An explicit
 * `aria-live` overrides the role's implicit politeness, so the two types whose
 * role is deliberately `alert` — `error` and `warning` — were downgraded to
 * polite, and the computed that chose the role decided nothing at all.
 *
 * That is why these assertions are here and not in `banner.component.spec.ts`,
 * which already asserted `ariaRole()` per type and asserted the rendered `role`
 * attribute. Both passed against the broken markup: they read the source the
 * screen reader was ignoring. What was missing is the RESOLVED politeness, and
 * a count of how many attributes were claiming to set it.
 *
 * `liveSources()` and `politeness()` are shared with the toast, radio and
 * checkbox specs — one resolution, so no copy can drift into being lenient.
 */
describe('tn-banner accessibility (#194)', () => {
  let fixture: ComponentFixture<TnBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnBannerComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnBannerComponent);
    fixture.componentRef.setInput('heading', 'Pool degraded');
    fixture.detectChanges();
  });

  function region(type: TnBannerType): HTMLElement {
    fixture.componentRef.setInput('type', type);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.tn-banner') as HTMLElement;
  }

  const ALL_TYPES: TnBannerType[] = ['info', 'success', 'warning', 'error'];

  describe('exactly one source of politeness', () => {
    // The pre-fix markup returned ['role=…', 'aria-live=polite'] here, for every
    // type. This is the assertion that failed before the fix.
    it.each(ALL_TYPES)('declares politeness once on a %s banner', (type) => {
      expect(liveSources(region(type))).toHaveLength(1);
    });
  });

  describe('politeness follows the banner type', () => {
    // `warning` interrupts, and it is the same answer the toast gives — see
    // `../a11y/live-region.ts` for the reason. Before the fix both of these
    // resolved to 'polite', because the static attribute won.
    it.each<TnBannerType>(['error', 'warning'])(
      'interrupts for a %s banner, which is a case that needs to',
      (type) => {
        expect(politeness(region(type))).toBe('assertive');
      }
    );

    it.each<TnBannerType>(['info', 'success'])(
      'does not interrupt for a %s banner',
      (type) => {
        expect(politeness(region(type))).toBe('polite');
      }
    );

    // Politeness is only honoured on something that IS a live region: drop the
    // role and `politeness()` would still read an explicit `aria-live` no
    // screen reader watches. Naming the two roles pins which mechanism carries
    // it, so a later edit cannot satisfy the assertions above with an attribute
    // alone.
    it('carries the politeness on a live-region role', () => {
      expect(region('error').getAttribute('role')).toBe('alert');
      expect(region('info').getAttribute('role')).toBe('status');
    });
  });
});
