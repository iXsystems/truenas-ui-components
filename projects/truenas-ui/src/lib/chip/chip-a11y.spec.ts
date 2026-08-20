import { readFileSync } from 'fs';
import { join } from 'path';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnChipComponent } from './chip.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the structure fixed for #188: the chip used to render a focusable
 * `role="button"` wrapper with a real `<button>` inside it, which fails axe's
 * `nested-interactive` rule — assistive technology flattens the inner control,
 * so close could be unreachable or announced as part of the chip's own name.
 *
 * The Storybook a11y addon reports the same rule, but only in its panel: no
 * CI job fails on it. Running axe here is what actually holds the fix in place.
 *
 * Unlike the color-contrast rule (see `radio-error-contrast.spec.ts`, which
 * computes ratios by hand because jsdom has no layout engine),
 * `nested-interactive` is pure DOM structure and axe evaluates it correctly
 * under jsdom — verified by watching it report the violation before the fix.
 */

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnChipComponent],
  template: `<tn-chip [label]="label()" [icon]="icon()" [closable]="closable()"
    [disabled]="disabled()" (onClick)="clickCount = clickCount + 1"
    (onClose)="closeCount = closeCount + 1" />`
})
class TestHostComponent {
  label = signal('Has SSH Access');
  icon = signal<string | undefined>(undefined);
  closable = signal(true);
  disabled = signal(false);
  clickCount = 0;
  closeCount = 0;
}

describe('tn-chip accessibility (#188)', () => {
  let host: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    // TestBed attaches the fixture to the document itself, which axe needs —
    // it walks up to the document root to decide visibility, and treats a
    // detached tree as hidden and therefore exempt from every rule below.
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function root(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-chip') as HTMLElement;
  }

  function body(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.tn-chip__body') as HTMLButtonElement;
  }

  function close(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.tn-chip__close');
  }

  /**
   * The elements `nested-interactive` can report this chip on.
   *
   * Both, because the fix has two shapes of regression and they land on
   * different nodes: putting the close button back inside `.tn-chip__body`
   * reports on the body, while giving the wrapper back its `role="button"`
   * reports on the wrapper. Only the body is *evaluated* today — the rule
   * selects on widget role, and post-fix the wrapper has none — so naming the
   * wrapper adds no `evaluated` coverage and does add the violation it would
   * carry if that role came back.
   */
  function interactiveTargets(): HTMLElement[] {
    return [root(), body()];
  }

  describe('nested-interactive', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing at all.
    // It is non-vacuous here: the rule matches `.tn-chip__body` itself, which is
    // the node the "close is not nested inside the body" regression reports on.
    it('raises no violation on a closable chip', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, interactiveTargets(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    it('raises no violation on a closable chip with an icon', async () => {
      host.icon.set('mdi:star');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, interactiveTargets(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    it('raises no violation on a non-closable chip', async () => {
      host.closable.set(false);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, interactiveTargets(), ['nested-interactive']
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('nested-interactive');
    });

    it('keeps the close button a sibling of the chip body, not a descendant', () => {
      expect(body().contains(close())).toBe(false);
      expect(close()!.parentElement).toBe(body().parentElement);
    });

    it('leaves the wrapper non-focusable, so the chip is a single tab stop per control', () => {
      expect(root().getAttribute('role')).toBeNull();
      expect(root().hasAttribute('tabindex')).toBe(false);
    });

    /**
     * Positive control, and the strongest guard in any of the a11y specs — it
     * is the only one that shows axe FAILING on the defect rather than passing
     * on the fix.
     *
     * Every assertion above is `toEqual([])`, which is also what axe returns
     * when it evaluates nothing at all — an upgrade that narrows which nodes
     * the rule selects, a jsdom change that makes the tree invisible to it.
     * (Renaming or dropping the rule outright is the case that does not go
     * quiet: axe rejects with "Could not find configured rule".) This
     * rebuilds the exact structure the chip had before #188 and requires axe to
     * still object to it, so the guards above cannot quietly go vacuous without
     * this failing first.
     *
     * It runs through the shared `axeResult` on purpose, so it is also the
     * control for that wrapper: an attribution bug there — a filter that
     * matched nothing — would empty `violated` in every spec that uses it, and
     * this is the assertion that would catch it. The violation is attributed to
     * the wrapper, which is the node that carries the offending widget role.
     */
    it('still reports the violation for the structure the chip used to have', async () => {
      const previous = document.createElement('div');
      previous.innerHTML =
        '<div role="button" tabindex="0" aria-label="Has SSH Access">'
        + '<span>Has SSH Access</span>'
        + '<button type="button" aria-label="Remove Has SSH Access">x</button>'
        + '</div>';
      document.body.appendChild(previous);

      const { violated } = await axeResult(
        previous, previous.querySelector('[role="button"]'), ['nested-interactive']
      );
      previous.remove();

      expect(violated).toEqual(['nested-interactive']);
    });
  });

  /**
   * The wrapper carries no role, so ARIA state must not be parked on it —
   * `aria-disabled` on a roleless element is an `aria-allowed-attr` violation,
   * which would trade #188 for a different finding of the same severity.
   *
   * `evaluated` names `nested-interactive` only, and deliberately not the two
   * `aria-*` rules. The regression THOSE guard would land on the wrapper, and
   * the wrapper has no `aria-*` attribute for `aria-allowed-attr` to match — so
   * they are not evaluated on it, and requiring them to be would fail on
   * correct markup. Naming them here would instead be satisfied by the body's
   * and close button's `aria-label`: green, and not about the element in
   * question, which is the vacuous guard `../a11y/axe-testing` exists to stop.
   * What keeps that half honest is the positive control above, which proves axe
   * is running at all.
   */
  it('raises no ARIA violation when disabled', async () => {
    host.disabled.set(true);
    fixture.detectChanges();

    const { violated, evaluated } = await axeResult(
      fixture.nativeElement, [root(), body(), close()],
      ['aria-allowed-attr', 'aria-valid-attr-value', 'nested-interactive']
    );

    expect(violated).toEqual([]);
    expect(evaluated).toContain('nested-interactive');
    expect(body().disabled).toBe(true);
    expect(close()!.disabled).toBe(true);
  });

  describe('the close control', () => {
    it('keeps its accessible name', () => {
      expect(close()!.getAttribute('aria-label')).toBe('Remove Has SSH Access');
    });

    it('stays keyboard-reachable', () => {
      // A native, non-disabled <button> with no negative tabindex is in the tab
      // order. Before the fix it was still a button, but nested inside the
      // focusable wrapper, which is what flattened it for assistive technology.
      expect(close()!.tagName).toBe('BUTTON');
      expect(close()!.disabled).toBe(false);
      expect(close()!.tabIndex).toBe(0);
    });
  });

  describe('the two controls stay distinguishable', () => {
    it('emits onClick from the body and not onClose', () => {
      body().click();

      expect(host.clickCount).toBe(1);
      expect(host.closeCount).toBe(0);
    });

    it('emits onClose from the close button and not onClick', () => {
      close()!.click();

      expect(host.closeCount).toBe(1);
      expect(host.clickCount).toBe(0);
    });

    /**
     * The body is a native <button>, so Enter and Space already arrive as a
     * click. The pre-#188 template also handled them in `handleKeyDown`, which
     * on a real button would emit `onClick` twice per keypress.
     */
    it.each(['Enter', ' '])('does not emit onClick from the %s keydown itself', (key) => {
      body().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      // The browser's own Enter/Space -> click on a native button is what emits
      // onClick, and jsdom does not synthesise it; the click tests above cover
      // that half. What this pins down is the other half — that keydown adds
      // nothing of its own, so the two cannot combine into a double emit.
      expect(host.clickCount).toBe(0);
    });
  });

  /**
   * Moving the click handler onto the body button moved the click TARGET with
   * it, so the chip's padding has to move too — padding left on the wrapper is
   * a band that looks like the chip and activates nothing.
   *
   * jsdom has no layout engine and Jest does not compile the component's SCSS,
   * so the hit area cannot be measured here (same constraint that made
   * `radio-error-contrast.spec.ts` read the stylesheet directly). Asserting on
   * which rule owns the padding is the reachable form of the invariant.
   *
   * Most of these match loosely — "the body has some non-zero padding" — so
   * retuning the chip's size does not fail them. The last one is the
   * exception: it enumerates every padding declaration by value, because its
   * job is to notice a NEW one, and that cannot be done without naming the
   * ones already accounted for. Retuning the chip means updating that list.
   */
  describe('the body button owns the padded hit area', () => {
    const scss = readFileSync(join(__dirname, './chip.component.scss'), 'utf8');

    /** Extracts a nested SCSS block's body by brace-matching from its header. */
    function block(header: string): string {
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

    /** Declarations of the block itself, excluding any nested rule. */
    function ownDeclarations(blockBody: string): string {
      let depth = 0;
      let out = '';
      for (const char of blockBody) {
        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
        } else if (depth === 0) {
          out += char;
        }
      }
      return out;
    }

    it('leaves the wrapper no padding of its own', () => {
      expect(ownDeclarations(block('.tn-chip {'))).toMatch(/padding:\s*0\s*;/);
    });

    /**
     * The single exception, and deliberately so. `--closable` insets the close
     * circle from the chip's border, and that 8px sits BEYOND the circle, so
     * no element can own it without changing what a click there means: on the
     * body, the chip activates from outside the close button; on the close
     * button, a click at the chip's edge deletes the chip. Dead is the safest
     * of the three next to a destructive control.
     *
     * Asserted rather than merely commented because the previous version of
     * this suite claimed the wrapper had no padding at all, which was not true
     * of a closable chip — `ownDeclarations` strips nested blocks and could
     * not see this one.
     */
    it('insets a closable chip by 8px, the only wrapper padding and the only dead strip', () => {
      expect(ownDeclarations(block('&--closable {'))).toMatch(/padding-right:\s*8px\s*;/);
    });

    it('has no other wrapper padding hiding in a nested block', () => {
      const nestedPadding = block('.tn-chip {')
        .replace(/\/\/.*$/gm, '') // comments discuss padding; only declarations count
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^padding(-\w+)?:/.test(line) && !/^padding:\s*0\s*;/.test(line));

      // Only the two accounted for above: __body's real padding, and the
      // closable inset. A third would be a new dead strip. Sorted, so that
      // reordering declarations — which changes nothing — does not fail here.
      expect(nestedPadding.sort()).toEqual([
        'padding-right: 6px;',
        'padding-right: 8px;',
        'padding: 6px 12px;',
      ]);
    });

    it('puts a real padding on the body button', () => {
      expect(ownDeclarations(block('&__body {'))).toMatch(/padding:\s*[1-9]/);
    });

    it('keeps the wrapper from advertising a click it cannot deliver', () => {
      expect(ownDeclarations(block('.tn-chip {'))).not.toMatch(/cursor:\s*pointer/);
      expect(ownDeclarations(block('&__body {'))).toMatch(/cursor:\s*pointer/);
    });
  });

  describe('the Delete/Backspace dismiss shortcut', () => {
    it.each(['Delete', 'Backspace'])('emits onClose from the chip body on %s', (key) => {
      body().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

      expect(host.closeCount).toBe(1);
    });

    it.each(['Delete', 'Backspace'])('still emits onClose on %s while close is focused', (key) => {
      // The handler is bound to the close button as well as the body, rather
      // than once on the wrapper, precisely so the shortcut survives wherever
      // focus is inside the chip — the wrapper carries no role and is not
      // focusable, so it is not a legitimate place to hang a key handler.
      close()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

      expect(host.closeCount).toBe(1);
    });

    it('does not emit onClose on Delete when the chip is not closable', () => {
      host.closable.set(false);
      fixture.detectChanges();

      body().dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

      expect(host.closeCount).toBe(0);
    });

    it('does not emit onClose on Delete when the chip is disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      body().dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

      expect(host.closeCount).toBe(0);
    });
  });
});
