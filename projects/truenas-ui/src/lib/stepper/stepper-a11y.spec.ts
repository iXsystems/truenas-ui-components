import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TnStepComponent } from './step.component';
import {
  TnStepperComponent, TN_STEPPER_STATUS_COMPLETED, TN_STEPPER_STATUS_ERROR,
} from './stepper.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * Guards the ARIA structure given to `tn-stepper` in #204.
 *
 * WHAT WAS REPORTED, AND WHAT WAS ACTUALLY THERE
 * ----------------------------------------------
 * The ticket reported axe returning no violations AND zero rules passed. Run
 * against the unchanged component, that is exactly what a stepper with no
 * `tn-step` children did — the markup in the report is the empty case, two bare
 * `div`s. A POPULATED stepper was less bare than the report suggests: its step
 * headers already carried `role="button"`, `tabindex` and `aria-current="step"`,
 * and 13 rules passed on them.
 *
 * What was missing either way is the structure this file is about: nothing said
 * how many steps there were or which position each held, and "completed" lived
 * only in a CSS class and an `aria-hidden` glyph.
 *
 * WHY A LIST AND NOT A TABLIST
 * ----------------------------
 * `linear` gates a step behind the completion of every step before it
 * (`canSelectStep`), and a gated header is a no-op on click. `role="tab"`
 * advertises free navigation between panels, so it would describe a stepper this
 * component refuses to be, and it would bring a roving-tabindex/arrow-key
 * contract that would then have to be honoured — the ticket names leaving that
 * contract unimplemented as worse than the current state. An ordered list
 * carries no such contract: each header stays the `role="button"` it already
 * was, activated by Enter and Space, and the list supplies the count and the
 * position.
 *
 * WHY `evaluated` MATTERS MORE HERE THAN IN THE OTHER a11y SPECS
 * -------------------------------------------------------------
 * Every `expect(violated).toEqual([])` below is also what axe returns when it
 * evaluated nothing at all — which is not a hypothetical for this component, it
 * is the reported defect. `the structure this replaced` at the bottom pins that
 * down from the other side: it rebuilds the pre-#204 header and asserts axe
 * attributes NOTHING to it, so a regression that drops the list back to `div`s
 * cannot pass by going quiet.
 */

@Component({
  selector: 'tn-stepper-a11y-host',
  standalone: true,
  imports: [TnStepperComponent, TnStepComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-stepper
      [orientation]="orientation()"
      [linear]="linear()"
      [selectedIndex]="selectedIndex()">
      <tn-step label="Pool name" [completed]="step0Completed()" />
      <tn-step
        label="Layout"
        [completed]="step1Completed()"
        [hasError]="step1Error()"
        [errorMessage]="step1ErrorMessage()" />
      <tn-step label="Review" [completed]="step2Completed()" [optional]="step2Optional()" />
    </tn-stepper>
  `,
})
class StepperA11yHostComponent {
  orientation = signal<'horizontal' | 'vertical' | 'auto'>('horizontal');
  linear = signal(false);
  selectedIndex = signal(0);
  step0Completed = signal(false);
  step1Completed = signal(false);
  step2Completed = signal(false);
  step1Error = signal(false);
  step1ErrorMessage = signal<string | undefined>(undefined);
  step2Optional = signal(false);
}

/**
 * The rules the stepper's header structure can be wrong under.
 *
 * `aria-required-children` and `listitem` are the two the fix is about — the
 * container's children and the item's container.
 *
 * NOT `list`, and that is worth stating because it is the obvious choice, and
 * because losing it costs something. axe declares it `matches:
 * 'no-role-matches'`, so an `<ol>` carrying an explicit `role="list"` — which
 * this one must, see the Safari note in the template — is skipped by it
 * entirely. Naming it here would not fail; it would quietly never be attributed
 * to anything, which is the vacuous green this spec is otherwise built to
 * avoid.
 *
 * `aria-required-children` is what still runs on a role-bearing list, and it is
 * NOT the same check. It objects to an owned element whose role is not
 * `listitem`; a roleless `div` is generic and passes straight through it —
 * measured, not assumed. The connector is a roleless `div`, so putting it back
 * beside the items is a regression NO axe rule reports once the role is
 * explicit. `keeps the horizontal connector inside its list item` below is what
 * guards it, by reading the DOM.
 *
 * The three `aria-*` rules and `nested-interactive` are here because the
 * structure change moved every step header one level deeper, inside a new
 * element — the cheapest way for that to go wrong is a role or attribute
 * landing somewhere it is not allowed. `aria-command-name` is what fails if a
 * step header ever loses its label, which is the other half of "a screen reader
 * can tell which step is which".
 */
const STRUCTURE_RULES = [
  'aria-required-children',
  'listitem',
  'aria-allowed-attr',
  'aria-allowed-role',
  'aria-valid-attr-value',
  'aria-command-name',
  'nested-interactive',
];

describe('tn-stepper accessibility (#204)', () => {
  let host: StepperA11yHostComponent;
  let fixture: ComponentFixture<StepperA11yHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperA11yHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    // TestBed attaches the fixture to the document itself, which axe needs — it
    // walks up to the document root to decide visibility, and treats a detached
    // tree as hidden and therefore exempt from every rule below.
    fixture = TestBed.createComponent(StepperA11yHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function list(): HTMLElement {
    return fixture.nativeElement.querySelector('.tn-stepper__header') as HTMLElement;
  }

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tn-stepper__step'));
  }

  function headers(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.tn-stepper__step-header'));
  }

  /** Everything the structure rules above can report a stepper on. */
  function structureTargets(): HTMLElement[] {
    return [list(), ...items(), ...headers()];
  }

  describe('the header is a list of steps', () => {
    it('renders one ordered list holding one item per step', () => {
      expect(list().tagName).toBe('OL');
      expect(items().length).toBe(3);
      expect(items().every((item) => item.tagName === 'LI')).toBe(true);
      expect(items().every((item) => item.parentElement === list())).toBe(true);
    });

    /**
     * `role="list"` on an `<ol>` is redundant to the HTML spec and is not
     * redundant to Safari: the stylesheet sets `list-style: none` on this
     * element, and Safari drops the list role from the accessibility tree when
     * it does. Losing it loses the step count and each step's position — the
     * whole of what this change added — on VoiceOver, which is the reader the
     * list model is most for, and no axe rule reports the loss.
     *
     * Asserted in both orientations, since each renders its own `<ol>`.
     */
    it.each(['horizontal', 'vertical'] as const)(
      'keeps the explicit list role that survives list-style: none in Safari (%s)',
      (orientation) => {
        host.orientation.set(orientation);
        fixture.detectChanges();

        expect(list().getAttribute('role')).toBe('list');
      },
    );

    it('renders the same list in vertical orientation', () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      expect(list().tagName).toBe('OL');
      expect(items().length).toBe(3);
      expect(items().every((item) => item.parentElement === list())).toBe(true);
    });

    /**
     * The connector was a sibling of the step headers before #204, which puts a
     * `div` directly inside the `<ol>`. It moved inside the item it leads away
     * from.
     *
     * This is the ONLY guard on that, and it reads the DOM rather than asking
     * axe, because axe cannot answer it: the explicit `role="list"` the Safari
     * fix requires takes the `list` rule out of play, and the rule that
     * replaces it lets a roleless `div` through. See `STRUCTURE_RULES`, and the
     * test that measures it at the bottom of this file.
     */
    it('keeps the horizontal connector inside its list item, not loose in the list', () => {
      const connectors: HTMLElement[] =
        Array.from(fixture.nativeElement.querySelectorAll('.tn-stepper__connector'));

      expect(connectors.length).toBe(2);
      expect(connectors.every((c) => c.parentElement?.classList.contains('tn-stepper__step')))
        .toBe(true);
    });

    // Stated as the general invariant as well as about the connector, so that
    // anything else added to the header — a progress bar, a divider — has to go
    // inside an item too.
    it.each(['horizontal', 'vertical'] as const)(
      'holds nothing but list items directly in the list (%s)',
      (orientation) => {
        host.orientation.set(orientation);
        fixture.detectChanges();

        expect(Array.from(list().children).map((child) => child.tagName))
          .toEqual(['LI', 'LI', 'LI']);
      },
    );

    it('gives every step header exactly one list item', () => {
      expect(headers().length).toBe(3);
      headers().forEach((header, i) => {
        expect(items()[i].contains(header)).toBe(true);
      });
    });
  });

  describe('axe over the step list', () => {
    // `evaluated` is asserted alongside every empty `violated`, because an empty
    // `violations` is also what axe returns when it evaluated nothing — which is
    // the defect this ticket reported, not a hypothetical.
    it('raises no violation, and does evaluate the list rules', async () => {
      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, structureTargets(), STRUCTURE_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('listitem');
      expect(evaluated).toContain('aria-command-name');
    });

    it('raises no violation in vertical orientation', async () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, structureTargets(), STRUCTURE_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('listitem');
    });

    it('raises no violation when linear mode disables the steps ahead', async () => {
      host.linear.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, structureTargets(), STRUCTURE_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(headers()[2].getAttribute('aria-disabled')).toBe('true');
    });

    it('raises no violation with a completed, an errored and an optional step', async () => {
      host.step0Completed.set(true);
      host.step1Error.set(true);
      host.step1ErrorMessage.set('Pick at least two disks');
      host.step2Optional.set(true);
      fixture.detectChanges();

      const { violated, evaluated } = await axeResult(
        fixture.nativeElement, structureTargets(), STRUCTURE_RULES
      );

      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-required-children');
      expect(evaluated).toContain('aria-command-name');
    });
  });

  describe('which step is current', () => {
    it('marks the selected step and only that one', () => {
      host.selectedIndex.set(1);
      fixture.detectChanges();

      expect(headers().map((h) => h.getAttribute('aria-current')))
        .toEqual([null, 'step', null]);
    });
  });

  describe('which steps are complete', () => {
    it('says nothing about a step that is neither complete nor in error', () => {
      expect(headers()[0].textContent).not.toContain(TN_STEPPER_STATUS_COMPLETED);
      expect(headers()[0].textContent).not.toContain(TN_STEPPER_STATUS_ERROR);
    });

    it('puts completion in the header text, not only in a CSS class', () => {
      host.step0Completed.set(true);
      fixture.detectChanges();

      expect(headers()[0].textContent).toContain(TN_STEPPER_STATUS_COMPLETED);
      expect(headers()[1].textContent).not.toContain(TN_STEPPER_STATUS_COMPLETED);
    });

    it('puts the error state in the header text, where only an aria-hidden glyph showed it', () => {
      host.step1Error.set(true);
      fixture.detectChanges();

      expect(headers()[1].textContent).toContain(TN_STEPPER_STATUS_ERROR);
      // The glyph itself stays out of the accessible name — it would otherwise
      // announce the icon's own name beside the state text.
      expect(fixture.nativeElement.querySelector('.tn-stepper__step-error')
        .getAttribute('aria-hidden')).toBe('true');
    });

    it('announces error rather than completed for a step that is both', () => {
      host.step1Completed.set(true);
      host.step1Error.set(true);
      fixture.detectChanges();

      expect(headers()[1].textContent).toContain(TN_STEPPER_STATUS_ERROR);
      expect(headers()[1].textContent).not.toContain(TN_STEPPER_STATUS_COMPLETED);
    });

    /**
     * The state text is a sibling of `.tn-stepper__step-label`, not a child.
     * The narrow-screen rule in this component's stylesheet sets
     * `display: none` on `.tn-stepper__step-label`, which under 780px would
     * take the state out of the accessible tree along with the visible title —
     * on exactly the viewport where a sighted user has lost the title too.
     *
     * Asserted structurally rather than by measuring: Jest does not compile the
     * component's SCSS and jsdom has no media queries, so the containment is
     * the reachable form of the invariant.
     */
    it('keeps the state text out of the label element the narrow-screen rule hides', () => {
      host.step0Completed.set(true);
      fixture.detectChanges();

      const label = headers()[0].querySelector('.tn-stepper__step-label') as HTMLElement;
      const state = headers()[0].querySelector('.cdk-visually-hidden') as HTMLElement;

      expect(state.textContent).toBe(TN_STEPPER_STATUS_COMPLETED);
      expect(label.contains(state)).toBe(false);
      expect(state.parentElement).toBe(headers()[0]);
    });
  });

  describe('the keyboard contract the list model does bring', () => {
    // A list needs no arrow-key navigation of its own; what it needs is that
    // each header stays the operable button it already was, since that is what
    // the model leans on instead. A `role="button"` that Enter and Space do not
    // activate is the "declared in ARIA and left unimplemented" case the ticket
    // calls worse than the current state.
    it('keeps every step header a focusable button', () => {
      expect(headers().every((h) => h.getAttribute('role') === 'button')).toBe(true);
      expect(headers().map((h) => h.getAttribute('tabindex'))).toEqual(['0', '0', '0']);
    });

    it.each(['Enter', ' '])('selects a step from the %s keydown', (key) => {
      headers()[2].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();

      expect(headers()[2].getAttribute('aria-current')).toBe('step');
    });

    it('takes a gated step out of the tab order and marks it disabled', () => {
      host.linear.set(true);
      fixture.detectChanges();

      expect(headers().map((h) => h.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
      expect(headers().map((h) => h.getAttribute('aria-disabled')))
        .toEqual([null, 'true', 'true']);
    });
  });

  /**
   * Positive controls. Everything above asserts an empty `violated`, which axe
   * also returns when it looked at nothing — and looking at nothing is what the
   * stepper used to do, so these are the assertions that keep the rest honest.
   */
  describe('the structure this replaced', () => {
    async function scan(html: string, target: string, rules: string[]) {
      const previous = document.createElement('div');
      previous.innerHTML = html;
      document.body.appendChild(previous);

      // `await` inside the try, not `return axeResult(...)` — returning the
      // promise runs `finally` before axe has read anything, which detaches the
      // tree mid-scan and is precisely the vacuous pass this is guarding.
      //
      // try/finally at all, because `axeResult` throws rather than returning a
      // vacuous pass — and a fixture left in `document.body` by that throw would
      // be scanned by every later test in this file.
      try {
        return await axeResult(previous, previous.querySelector(target), rules);
      } finally {
        previous.remove();
      }
    }

    /**
     * The reported defect itself, kept as a test. This is the pre-#204 header:
     * a `div` holding `role="button"` headers with `div` connectors between
     * them. axe attributes NEITHER list rule to it — not a pass, not a
     * violation — which is why `expect(violated).toEqual([])` was worth nothing
     * on it, and why every assertion above names `evaluated` too.
     */
    it('evaluated no list rule at all, which is what made a clean scan meaningless', async () => {
      const { violated, evaluated } = await scan(
        '<div class="tn-stepper__header">'
        + '<div role="button" tabindex="0" aria-current="step">1 Pool name</div>'
        + '<div class="tn-stepper__connector"></div>'
        + '<div role="button" tabindex="0">2 Layout</div>'
        + '</div>',
        '.tn-stepper__header',
        ['list', 'listitem', 'aria-required-children'],
      );

      expect(evaluated).toEqual([]);
      expect(violated).toEqual([]);
    });

    /**
     * The control for `aria-required-children` itself — the rule every "raises
     * no violation" above leans on. Without this, an axe or `axeResult` change
     * that stopped attributing it would empty `violated` everywhere in this
     * file and satisfy nothing but `evaluated`.
     *
     * The child carries `role="button"` rather than being the roleless `div`
     * the connector is, because a roleless child is generic and this rule lets
     * it through — which is measured directly by the test after this one, and
     * is why the connector's position is guarded by reading the DOM instead.
     *
     * It runs through the shared `axeResult` on purpose, so it is also the
     * control for that wrapper: an attribution bug there — a filter matching
     * nothing — would empty `violated` in every spec that uses it.
     */
    it('still reports a list child whose role is not listitem', async () => {
      const { violated } = await scan(
        // `role="list"` because that is what the component renders, and it is
        // what decides which rule reports: axe skips `list` on a role-bearing
        // <ol>, so a control written without the attribute would be proving
        // that a rule the component never runs still works.
        '<ol class="tn-stepper__header" role="list">'
        + '<li><div role="button" tabindex="0">1 Pool name</div></li>'
        + '<div role="button" tabindex="0">Loose</div>'
        + '</ol>',
        'ol',
        ['aria-required-children'],
      );

      expect(violated).toEqual(['aria-required-children']);
    });

    /**
     * The measurement behind the paragraph in `STRUCTURE_RULES`, kept as a test
     * rather than left as a claim in a comment: this IS the pre-fix connector
     * shape, and `aria-required-children` evaluates the list and says nothing.
     *
     * If a later axe-core does start reporting it, this test fails — and the
     * right response is to add the rule back as a guard on the component, not
     * to loosen this.
     */
    it('says nothing about a roleless div loose in the list, which the connector is', async () => {
      const { violated, evaluated } = await scan(
        '<ol class="tn-stepper__header" role="list">'
        + '<li><div role="button" tabindex="0">1 Pool name</div></li>'
        + '<div class="tn-stepper__connector"></div>'
        + '<li><div role="button" tabindex="0">2 Layout</div></li>'
        + '</ol>',
        'ol',
        ['aria-required-children'],
      );

      expect(evaluated).toEqual(['aria-required-children']);
      expect(violated).toEqual([]);
    });
  });
});
