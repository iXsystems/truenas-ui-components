import { readFileSync } from 'fs';
import { join } from 'path';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnListOptionComponent } from './list-option.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the structure fixed for #213: `tn-list-option` sets `role="option"` on
 * its host and rendered a `tn-checkbox` — a real `<input type="checkbox">` —
 * inside it, which fails axe's `nested-interactive` rule. Assistive technology
 * flattens the inner control, so a listener hears the selection twice and finds
 * a control that is not theirs to operate.
 *
 * Same family as #188 (chip) and #194 (banner/radio/checkbox), and the same
 * rule, but the fix is the opposite shape. The chip had two real controls and
 * had to stop nesting them; the option has ONE control — the option itself,
 * whose selection `aria-selected` on the host already reports — so the checkbox
 * is a picture of that state rather than a second control. It is made
 * presentational instead of being restructured.
 *
 * `nested-interactive` is pure DOM structure and axe evaluates it correctly
 * under jsdom — verified by watching it report the violation on the real
 * component before the fix, not only on the reconstructed markup in the
 * positive control below.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnListOptionComponent],
  template: `<tn-list-option [selected]="selected()" [disabled]="disabled()">Option one</tn-list-option>`
})
class TestHostComponent {
  selected = signal(false);
  disabled = signal(false);
}

describe('tn-list-option accessibility (#213)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // TestBed attaches the fixture to the document itself, which axe needs — it
    // walks up to the document root to decide visibility, and treats a detached
    // tree as hidden and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function option(): HTMLElement {
    return fixture.nativeElement.querySelector('tn-list-option') as HTMLElement;
  }

  function checkboxWrapper(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-list-option__checkbox') as HTMLElement;
  }

  function checkboxInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      '.tn-list-option__checkbox input[type="checkbox"]'
    ) as HTMLInputElement;
  }

  const scss = readFileSync(join(__dirname, './list-option.component.scss'), 'utf8');

  /**
   * The body of one SCSS rule, brace-matched from its header.
   *
   * Two assertions below are about declarations Jest cannot observe: jsdom has
   * no layout engine and Jest does not compile the component's SCSS, so the
   * stylesheet is read directly — the same constraint that makes
   * `chip-a11y.spec.ts` read its own SCSS. Brace-matched rather than regexed
   * over the whole file, because both declarations appear in more than one rule
   * here: `--disabled` also sets `pointer-events: none`, and `outline` is set
   * by more than one state. Matching the wrong one would stay green with the
   * rule under test deleted.
   */
  function scssBlock(header: string): string {
    const start = scss.indexOf(header);
    expect(start).toBeGreaterThanOrEqual(0);

    const open = scss.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < scss.length; i++) {
      if (scss[i] === '{') {
        depth++;
      } else if (scss[i] === '}' && --depth === 0) {
        return scss.slice(open + 1, i);
      }
    }
    throw new Error(`unterminated block for ${header}`);
  }

  describe('nested-interactive', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all.
    // It is non-vacuous here: the rule selects on widget role and the host
    // carries `role="option"`, so the host is the node it both passes and — as
    // the positive control below shows — fails on.
    it('raises no violation on an unselected option', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, option(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    it('raises no violation on a selected option', async () => {
      host.selected.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, option(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    /**
     * A disabled option would pass this rule whatever the template said: axe
     * treats a `disabled` native control as unfocusable, so the checkbox stops
     * being a nested WIDGET the moment `[disabled]` is bound through to it.
     * The case is asserted because it is the one users of a disabled list hit,
     * not because it discriminates — the two above are what discriminate.
     */
    it('raises no violation on a disabled option', async () => {
      host.disabled.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, option(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    /**
     * Positive control, and the strongest guard in this spec — the only one that
     * shows axe FAILING on the defect rather than passing on the fix.
     *
     * Every assertion above is `toEqual([])`, which is also what axe returns
     * when it evaluates nothing at all: an upgrade that narrows which nodes the
     * rule selects, or a jsdom change that makes the tree invisible to it.
     * (Renaming or dropping the rule outright is the case that does not go
     * quiet — axe rejects with "Could not find configured rule".) This rebuilds
     * the structure `tn-list-option` had before #213 and requires axe to still
     * object to it.
     *
     * The `tabindex="-1"` is on the WRAPPER and not on the input, because that
     * is where the old template had it — on the `<tn-checkbox>` element rather
     * than on the native control inside it. Reproducing that placement is the
     * point: it is what made the old markup look fixed while axe still walked
     * past the wrapper and found a focusable checkbox underneath.
     *
     * It runs through the shared `axeResult` on purpose, so it is also the
     * control for that wrapper: an attribution bug there — a filter that matched
     * nothing — would empty `violated` in every spec that uses it, and this is
     * the assertion that would catch it.
     */
    it('still reports the violation for the structure the option used to have', async () => {
      const previous = document.createElement('div');
      previous.innerHTML =
        '<div role="option" aria-selected="false" aria-disabled="false">'
        + '<span>Option one</span>'
        + '<span tabindex="-1"><input type="checkbox" aria-label="Checkbox" /></span>'
        + '</div>';
      document.body.appendChild(previous);

      // try/finally, because `axeResult` throws rather than returning a vacuous
      // pass — and a fixture left in `document.body` by that throw would be
      // scanned by every later test in this file.
      let violated: string[];
      try {
        ({ violated } = await axeResult(
          previous, previous.querySelector('[role="option"]'), ['nested-interactive']
        ));
      } finally {
        previous.remove();
      }

      expect(violated).toEqual(['nested-interactive']);
    });
  });

  /**
   * `inert` is what removes the checkbox from the accessibility tree AND from
   * the focus order in one attribute. `aria-hidden="true"` alone would do only
   * the first half: the native input stays focusable, which leaves
   * `nested-interactive` reporting exactly as before and adds an
   * `aria-hidden-focus` violation of its own. The same reasoning is already
   * written into `expansion-panel.component.html`.
   */
  describe('the checkbox is presentational', () => {
    it('marks the checkbox subtree inert', () => {
      expect(checkboxWrapper().hasAttribute('inert')).toBe(true);
    });

    it('leaves no aria-hidden container holding a focusable control', async () => {
      const { violated } = await axeResult(
        fixture.nativeElement, [option(), checkboxWrapper()],
        ['aria-hidden-focus', 'nested-interactive']
      );

      expect(violated).toEqual([]);
    });

    it('still renders the checkbox, so selection stays visible', () => {
      expect(checkboxInput()).not.toBeNull();
    });

    it('reflects selection on the rendered checkbox', () => {
      expect(checkboxInput().checked).toBe(false);

      host.selected.set(true);
      fixture.detectChanges();

      expect(checkboxInput().checked).toBe(true);
    });

    it('reflects the disabled state on the rendered checkbox', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(checkboxInput().disabled).toBe(true);
    });

    /**
     * The other half of "presentational": the checkbox must not take the mouse
     * either. It used to swallow the click with `$event.stopPropagation()`,
     * which stopped the row from toggling while the native input flipped itself
     * anyway — the picture and the state disagreeing, from a click on the
     * picture.
     *
     * `inert` in the template is what actually blocks the pointer; this
     * declaration is the fallback for a browser without it, which is why it is
     * guarded separately rather than treated as covered by the inert assertion
     * above.
     */
    it('keeps the checkbox from taking the click', () => {
      expect(scssBlock('&__checkbox {')).toMatch(/pointer-events:\s*none\s*;/);
    });
  });

  /**
   * Removing the checkbox's click handler is part of the fix, so the toggle it
   * used to suppress is worth pinning down: a click anywhere on the row — the
   * only control here — still moves the option's own state, which is what
   * `aria-selected` reports.
   */
  describe('the option is still the control', () => {
    it('toggles selection when the row is clicked', () => {
      option().click();
      fixture.detectChanges();

      expect(option().getAttribute('aria-selected')).toBe('true');
    });

    it('does not toggle when the option is disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      option().click();
      fixture.detectChanges();

      expect(option().getAttribute('aria-selected')).toBe('false');
    });
  });

  /**
   * Making the checkbox presentational takes away the only focusable element
   * this component had, so the option has to become the tab stop itself — one
   * per option either way, but now on the element that acts on the keypress.
   *
   * The checkbox was never a working one: it swallowed the click, so Space on
   * the focused input flipped the input and left `aria-selected` behind. These
   * assert the replacement is a real stop and not merely a present attribute.
   */
  describe('the option is reachable from the keyboard', () => {
    it('is in the tab order', () => {
      expect(option().tabIndex).toBe(0);
    });

    it('leaves a disabled option out of the tab order', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(option().hasAttribute('tabindex')).toBe(false);
    });

    it.each([' ', 'Enter'])('toggles selection on %s', (key) => {
      option().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();

      expect(option().getAttribute('aria-selected')).toBe('true');
    });

    it.each([' ', 'Enter'])('does not toggle on %s when disabled', (key) => {
      host.disabled.set(true);
      fixture.detectChanges();

      option().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();

      expect(option().getAttribute('aria-selected')).toBe('false');
    });

    /**
     * A tab stop a keyboard user cannot see is not a tab stop they can use.
     * This rule used to be `:host(:focus) { outline: none; … }`, which cost
     * nothing while the host could not be focused; the moment it became the
     * option's tab stop it left focus indicated only by the background tint
     * `:hover` already applies.
     *
     * Asserted on the stylesheet for the reason given on `scssBlock` — and
     * asserted on the block rather than on the file, because `outline: none`
     * elsewhere in it would satisfy a looser match.
     */
    it('draws a visible focus ring on the tab stop', () => {
      const focusRule = scssBlock(':host(:focus-visible) {');

      expect(focusRule).toMatch(/outline:\s*[1-9]/);
      expect(focusRule).not.toMatch(/outline:\s*none/);
    });

    it('leaves the presentational checkbox unfocusable', () => {
      // `inert` is what does this in a browser. jsdom does not implement it, so
      // the assertion is on the attribute that carries the intent rather than
      // on `document.activeElement` — which here would report the input as
      // focused and say nothing about the shipped behaviour.
      expect(checkboxWrapper().hasAttribute('inert')).toBe(true);
      expect(checkboxInput().hasAttribute('tabindex')).toBe(false);
    });
  });

  /**
   * The host's own ARIA is the half of the fix that was already right, and the
   * half a "just delete the checkbox" regression would take down with it: with
   * the checkbox presentational, `aria-selected` is the ONLY thing left telling
   * a listener whether the option is picked.
   */
  describe('the option reports its own state', () => {
    it('reports selection through aria-selected', () => {
      expect(option().getAttribute('aria-selected')).toBe('false');

      host.selected.set(true);
      fixture.detectChanges();

      expect(option().getAttribute('aria-selected')).toBe('true');
    });

    it('reports the disabled state through aria-disabled', () => {
      expect(option().getAttribute('aria-disabled')).toBe('false');

      host.disabled.set(true);
      fixture.detectChanges();

      expect(option().getAttribute('aria-disabled')).toBe('true');
    });

    it('keeps role="option" on the host', () => {
      expect(option().getAttribute('role')).toBe('option');
    });

    it('raises no ARIA violation for the attributes it sets', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, option(),
        ['aria-allowed-attr', 'aria-valid-attr-value']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-valid-attr-value');
    });
  });
});
