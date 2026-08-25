import { FocusMonitor } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTooltipDirective } from './tooltip.directive';
import { TnButtonComponent } from '../button/button.component';

@Component({
  standalone: true,
  imports: [TnTooltipDirective, TnButtonComponent],
  // Each host stands for one shape the directive has to handle; splitting them across fixtures
  // would mean re-stubbing the overlay geometry four times.
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <button type="button" [tnTooltip]="message()" [tnTooltipSticky]="sticky()" [tnTooltipDisabled]="disabled()" [tnTooltipCloseAriaLabel]="closeLabel()">host</button>
    <button type="button" id="plain" [tnTooltip]="'Plain help text'">plain host</button>
    <button type="button" id="owns-expanded" aria-expanded="true" [tnTooltip]="ownerMessage()">menu trigger</button>
    <button type="button" id="late-expanded" [attr.aria-expanded]="lateExpanded()" [tnTooltip]="message()">late owner</button>
    <button type="button" id="owns-controls" aria-controls="panel-1" [tnTooltip]="message()">tab</button>
    <div id="swap-host" [tnTooltip]="message()">
      @if (swappedToButton()) {
        <button type="button" [attr.aria-expanded]="swappedExpanded()">inner button</button>
      } @else {
        <a href="#swap">inner link</a>
      }
    </div>
    <button type="button" id="side" tnTooltip="Plain help text" tnTooltipPosition="right">side host</button>
    <button type="button" id="collapsible" [attr.tabindex]="hostTabindex()" [tnTooltip]="message()">collapsible host</button>
    <a id="conditional-link" [attr.href]="hostHref()" [tnTooltip]="message()">conditional link host</a>
    <button type="button" id="native-disabled" disabled [tnTooltip]="message()">disabled host</button>
    <div id="wrapper-disabled" [tnTooltip]="message()"><button type="button" disabled>inner</button></div>
    <span id="span-host" [tnTooltip]="message()">span host</span>
    <input id="input-host" [tnTooltip]="message()" />
    <div id="role-host" role="button" tabindex="0" [tnTooltip]="message()">emulated button</div>
    <tn-button id="tn-button-disabled" label="Create pool" [disabled]="true" [tnTooltip]="message()" />
  `,
})
class HostComponent {
  // A link in the message is what makes this tooltip click-to-open rather than hover.
  message = signal('Read the <a href="#docs">docs</a>');
  sticky = signal(true);
  disabled = signal(false);
  // A host that drives something of its own (a menu, a select) and happens to carry a tooltip.
  ownerMessage = signal('Plain help text');
  // A host whose own aria-expanded binding starts unset - `<tn-icon-button [ariaExpanded]>` is
  // exactly this shape - and resolves to a value only later.
  lateExpanded = signal<string | null>(null);
  // A wrapper whose single inner control is replaced rather than mutated - a `<tn-button>` with
  // an `@if` around its `[href]` branch is this shape - and whose replacement later takes
  // `aria-expanded` over for itself.
  swappedToButton = signal(false);
  swappedExpanded = signal<string | null>(null);
  // A control that takes itself out of the tab order while collapsed - a rail button in a
  // collapsed sidebar is this shape - which is the difference between a click it can be operated
  // by and one it cannot.
  hostTabindex = signal<string | null>(null);
  // An anchor that is only sometimes a link (`[attr.href]="canNavigate ? url : null"`). Without
  // the href it is neither `INTERACTIVE_SELECTOR` nor `KEYBOARD_ACTIVATABLE_SELECTOR`, so it
  // stops being a host a click can pin - the same transition `hostTabindex` makes.
  hostHref = signal<string | null>('#go');
  closeLabel = signal('Close tooltip');
}

function tooltipPanel(): HTMLElement | null {
  return document.querySelector('.tn-tooltip');
}

function closeButton(): HTMLButtonElement | null {
  return document.querySelector('.tn-tooltip__close');
}

describe('TnTooltipDirective sticky mode', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HTMLButtonElement;
  let plainHost: HTMLButtonElement;
  let ownerHost: HTMLButtonElement;
  let sideHost: HTMLButtonElement;

  beforeEach(() => {
    // The dismiss button renders a tn-icon, whose sprite loader would otherwise fire a real XHR.
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    plainHost = fixture.nativeElement.querySelector('#plain') as HTMLButtonElement;
    ownerHost = fixture.nativeElement.querySelector('#owns-expanded') as HTMLButtonElement;
    sideHost = fixture.nativeElement.querySelector('#side') as HTMLButtonElement;

    // The directive's show/hide are `setTimeout`s, and #304 replaced
    // `fakeAsync`/`tick` with Jest's clock. `settleObserver()` below is where
    // the two differ and it is the whole cost of the swap in this file.
    jest.useFakeTimers();
  });

  afterEach(() => {
    fixture.destroy();
    jest.advanceTimersByTime(0);
    jest.useRealTimers();
  });

  /**
   * Let the directive's 0ms show/hide timers run AND the `MutationObserver`
   * deliver, then sync the view.
   *
   * `tick()` used to do both halves: Zone patched `MutationObserver`'s delivery
   * onto its own microtask queue, so draining the clock drained that too.
   * Jest's `advanceTimersByTime` moves only the timer queue — the observer's
   * callback is an ordinary microtask and needs a real `await` to land. Which
   * is why the tests that depend on it are `async`, as they already were for
   * the same reason under Zone (its queue did not cover jsdom's observer
   * either; see the comments they carry).
   */
  async function settleObserver(): Promise<void> {
    jest.advanceTimersByTime(0);
    await Promise.resolve();
    fixture.detectChanges();
  }

  function hover(target: HTMLElement = host): void {
    target.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();
  }

  function leave(target: HTMLElement = host): void {
    target.dispatchEvent(new MouseEvent('mouseleave'));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();
  }

  function click(detail = 1): void {
    host.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();
  }

  it('shows plain help text on hover and hides it on mouseleave', () => {
    hover(plainHost);
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).toBeNull();

    leave(plainHost);
    expect(tooltipPanel()).toBeNull();
  });

  it('does not open a pinnable tooltip on hover - the click is the only way in', () => {
    hover();

    expect(tooltipPanel()).toBeNull();
  });

  it('does not open a pinnable tooltip on keyboard focus either', () => {
    TestBed.inject(FocusMonitor).focusVia(host, 'keyboard');
    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  });

  it('never pins plain help text, so it does not hijack the host click', () => {
    plainHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  });

  it('opens the tooltip already pinned on click, with a dismiss button', () => {
    click();

    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).not.toBeNull();
    expect(closeButton()?.getAttribute('aria-label')).toBe('Close tooltip');
  });

  it('keeps a pinned tooltip open on mouseleave and blur', () => {
    click();

    leave();
    expect(tooltipPanel()).not.toBeNull();

    // Focus moving into the overlay leaves the host, so without the sticky guard this blur
    // would hide the tooltip the moment the user reached its content.
    host.blur();
    jest.advanceTimersByTime(0);
    fixture.detectChanges();
    expect(tooltipPanel()).not.toBeNull();
  });

  it('makes a pinned tooltip interactive rather than click-through', () => {
    click();

    const tooltipHost = document.querySelector('tn-tooltip') as HTMLElement;
    expect(tooltipHost.classList).toContain('tn-tooltip-component--sticky');
  });

  it('dismisses on a second click of the host', () => {
    click();
    expect(tooltipPanel()).not.toBeNull();

    click();
    expect(tooltipPanel()).toBeNull();
  });

  it('dismisses when the tooltip dismiss button is clicked', () => {
    click();

    closeButton()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  });

  it('moves focus onto the tooltip panel when pinned from the keyboard', () => {
    host.focus();
    // A click with detail 0 is what Enter/Space on a button produces.
    click(0);

    expect(document.activeElement).toBe(tooltipPanel());
    // Focused ahead of the message, so Tab reaches the tooltip's own links first.
    expect(tooltipPanel()?.getAttribute('tabindex')).toBe('-1');
  });

  it('dismisses on Escape and restores focus to the host', () => {
    host.focus();
    click(0);

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
    expect(document.activeElement).toBe(host);
  });

  it('does not intercept Escape while it is only a hover tooltip', () => {
    // A permanent keydownEvents() subscription would make the tooltip's overlay the top-most
    // Escape handler, stealing the key from whatever dialog the host sits in.
    hover(plainHost);

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(escape);
    jest.advanceTimersByTime(0);

    expect(escape.defaultPrevented).toBe(false);
  });

  it('dismisses on an outside click', () => {
    click();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
    outside.remove();
  });

  it('falls back to hover when sticky mode is turned off, even with a link in the message', () => {
    fixture.componentInstance.sticky.set(false);
    fixture.detectChanges();

    hover();
    expect(tooltipPanel()).not.toBeNull();

    click();
    expect(closeButton()).toBeNull();

    leave();
    expect(tooltipPanel()).toBeNull();
  });

  it('does not pin a disabled tooltip', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    click();

    expect(tooltipPanel()).toBeNull();
  });

  it('does not pin when there is no message', () => {
    fixture.componentInstance.message.set('');
    fixture.detectChanges();

    click();

    expect(tooltipPanel()).toBeNull();
  });

  it('re-opens after being dismissed', () => {
    click();
    click();
    expect(tooltipPanel()).toBeNull();

    click();
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).not.toBeNull();
  });

  // stick() ignores both `tnTooltipSticky` and the interactive-content rule by design. What it
  // must not do is produce a pinned tooltip that behaves unlike a pinned tooltip.
  // A hover panel lived for a second, so a message that changed underneath it was near
  // unobservable. A pinned panel stays until the user dismisses it, and `aria-describedby`
  // follows the input immediately - so a panel left on the old message would have the announced
  // text and the link on screen disagreeing for as long as it stayed up.
  it('re-renders a pinned panel when the message changes underneath it', () => {
    click();
    expect(tooltipPanel()?.textContent).toContain('Read the');

    fixture.componentInstance.message.set('Now says <a href="#other">something else</a>');
    fixture.detectChanges();
    jest.advanceTimersByTime(0);

    expect(tooltipPanel()?.textContent).toContain('Now says');
    expect(tooltipPanel()?.querySelector('a')?.getAttribute('href')).toBe('#other');
    expect(host.getAttribute('aria-describedby')).not.toBeNull();
  });

  it('takes a pinned panel down when its message is switched off', () => {
    click();
    expect(tooltipPanel()).not.toBeNull();

    fixture.componentInstance.message.set(null as unknown as string);
    fixture.detectChanges();
    jest.advanceTimersByTime(0);

    expect(tooltipPanel()).toBeNull();
  });

  it('re-renders a pinned panel when the dismiss label changes underneath it', () => {
    click();

    fixture.componentInstance.closeLabel.set('Cerrar');
    fixture.detectChanges();
    jest.advanceTimersByTime(0);

    expect(closeButton()?.getAttribute('aria-label')).toBe('Cerrar');
  });

  // Pinning made the click the only way in. A disabled control never delivers one - the native
  // button fires none, and tn-button swallows the retargeted one in a capture-phase listener - so
  // suppressing hover as well would leave the tooltip with no way in at all. A disabled control
  // with a tooltip explaining why is exactly the thing this would have broken.
  describe('a host that cannot deliver the pinning click', () => {
    const disabledHost = () => fixture.nativeElement.querySelector('#native-disabled') as HTMLButtonElement;
    const disabledWrapper = () => fixture.nativeElement.querySelector('#wrapper-disabled') as HTMLElement;

    it('falls back to hover on a disabled host', () => {
      hover(disabledHost());

      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();

      leave(disabledHost());
      expect(tooltipPanel()).toBeNull();
    });

    it('falls back to hover when the disabled control is inside a wrapper host', () => {
      hover(disabledWrapper());

      expect(tooltipPanel()).not.toBeNull();
    });

    // The reported case: tn-button registers a capture-phase click listener that
    // stopImmediatePropagation()s while disabled, so the directive's own host binding never runs.
    it('falls back to hover on a disabled tn-button, whose click never reaches the directive', () => {
      const button = fixture.nativeElement.querySelector('#tn-button-disabled') as HTMLElement;

      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltipPanel()).toBeNull();

      hover(button);
      expect(tooltipPanel()).not.toBeNull();
      expect(tooltipPanel()?.textContent).toContain('Read the');
    });

    it('advertises no disclosure state, since there is nothing to disclose by clicking', () => {
      expect(disabledHost().hasAttribute('aria-expanded')).toBe(false);
      expect(disabledHost().hasAttribute('aria-haspopup')).toBe(false);
    });

    // Read live from the event handler, so this needs no re-sync to be correct.
    it('goes back to click-only once the host is enabled again', () => {
      disabledHost().removeAttribute('disabled');

      hover(disabledHost());
      expect(tooltipPanel()).toBeNull();

      disabledHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(closeButton()).not.toBeNull();
    });

    // The disclosure attributes are written, not read, so they do need the re-sync. A real
    // microtask rather than the fake clock: MutationObserver's queue is not part of it.
    it('picks the disclosure state back up when disabled is toggled off', async () => {
      expect(disabledHost().hasAttribute('aria-haspopup')).toBe(false);

      disabledHost().removeAttribute('disabled');
      await Promise.resolve();

      expect(disabledHost().getAttribute('aria-haspopup')).toBe('dialog');
      expect(disabledHost().getAttribute('aria-expanded')).toBe('false');
    });

    it('treats aria-disabled the same way', () => {
      const ariaDisabled = disabledHost();
      ariaDisabled.removeAttribute('disabled');
      ariaDisabled.setAttribute('aria-disabled', 'true');

      hover(ariaDisabled);
      expect(tooltipPanel()).not.toBeNull();
    });

    // aria-disabled is advisory, so unlike `:disabled` the element still dispatches clicks. The
    // hover fallback above puts the panel on screen; without the same check in `_onClick` that
    // click would then pin it, which is the two-stage "hover, then click what is already on
    // screen" flow the fallback exists to avoid.
    it('does not pin an aria-disabled host, whose click does still arrive', () => {
      const ariaDisabled = disabledHost();
      ariaDisabled.removeAttribute('disabled');
      ariaDisabled.setAttribute('aria-disabled', 'true');

      hover(ariaDisabled);
      ariaDisabled.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(closeButton()).toBeNull();

      // ...and it stays a hover panel, rather than one that outlives the pointer.
      leave(ariaDisabled);
      expect(tooltipPanel()).toBeNull();
    });

    it('leaves an aria-disabled host advertising no disclosure state after a click', () => {
      const ariaDisabled = disabledHost();
      ariaDisabled.removeAttribute('disabled');
      ariaDisabled.setAttribute('aria-disabled', 'true');

      hover(ariaDisabled);
      ariaDisabled.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(ariaDisabled.getAttribute('aria-expanded')).toBeNull();
      expect(ariaDisabled.getAttribute('aria-controls')).toBeNull();
    });
  });

  // A host that is not a control cannot be focused or activated from the keyboard, and the click
  // is the only way into a pinned panel — so pinning there would put the tooltip out of reach of
  // the keyboard entirely, and would advertise a disclosure (`aria-expanded` is invalid on a bare
  // `<span>` anyway) that nobody could operate. Same principle as the disabled hosts above.
  describe('a host that cannot be operated from the keyboard', () => {
    const spanHost = () => fixture.nativeElement.querySelector('#span-host') as HTMLElement;

    it('falls back to hover rather than pinning on click', () => {
      spanHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltipPanel()).toBeNull();

      hover(spanHost());
      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();

      leave(spanHost());
      expect(tooltipPanel()).toBeNull();
    });

    // The panel does open on hover here, so the click that follows must not pin what is already
    // on screen — the same two-stage flow the aria-disabled fallback guards against.
    it('does not pin the hover panel when the click arrives', () => {
      hover(spanHost());
      spanHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(closeButton()).toBeNull();
      expect(spanHost().hasAttribute('aria-expanded')).toBe(false);
    });

    it('advertises no disclosure state, which is not valid on a non-control anyway', () => {
      expect(spanHost().hasAttribute('aria-expanded')).toBe(false);
      expect(spanHost().hasAttribute('aria-haspopup')).toBe(false);
    });

    // `tabindex="-1"` makes an element a focus target without putting it in the tab order, so it
    // is no more keyboard-operable than the bare span - and `_restoreFocusTarget` leaves exactly
    // that behind on hosts it had to focus by hand.
    it('does not count tabindex="-1" as being operable', () => {
      spanHost().setAttribute('tabindex', '-1');

      hover(spanHost());
      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();
    });

    // A text control is focusable, which is what made it look operable, but Enter submits the
    // form and Space types a space - neither produces the click a pinned panel is opened by.
    describe('a text control host, which is focusable but not activatable', () => {
      const inputHost = () => fixture.nativeElement.querySelector('#input-host') as HTMLInputElement;

      it('shows the message on keyboard focus instead of waiting for a click', () => {
        TestBed.inject(FocusMonitor).focusVia(inputHost(), 'keyboard');
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(tooltipPanel()).not.toBeNull();
        expect(closeButton()).toBeNull();
      });

      // Every click into a text field places the caret, so pinning here would toggle the panel
      // each time the user repositioned the cursor.
      it('does not pin when a click lands in the field', () => {
        hover(inputHost());
        inputHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(tooltipPanel()).not.toBeNull();
        expect(closeButton()).toBeNull();
      });

      // `aria-expanded` is not supported on `role="textbox"`, and there is no disclosure to
      // describe in the first place.
      it('advertises no disclosure state', () => {
        expect(inputHost().hasAttribute('aria-expanded')).toBe(false);
        expect(inputHost().hasAttribute('aria-haspopup')).toBe(false);
      });
    });

    // A role renames an element for assistive tech and changes no behaviour: this host gets
    // `keydown` on Enter/Space and nothing else, and a consumer emulating a button calls its own
    // handler rather than `element.click()`. Trusting the role would leave the panel click-only
    // with no keyboard route in - the failure the whole check exists to prevent.
    describe('a host wearing role="button", which the browser still sends no click for', () => {
      const roleHost = () => fixture.nativeElement.querySelector('#role-host') as HTMLElement;

      it('shows the message on keyboard focus rather than waiting for a click', () => {
        TestBed.inject(FocusMonitor).focusVia(roleHost(), 'keyboard');
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(tooltipPanel()).not.toBeNull();
        expect(closeButton()).toBeNull();
      });

      it('falls back to hover, and pins on neither route', () => {
        hover(roleHost());
        expect(tooltipPanel()).not.toBeNull();

        roleHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(closeButton()).toBeNull();
      });

      it('advertises no disclosure it cannot deliver', () => {
        expect(roleHost().hasAttribute('aria-expanded')).toBe(false);
        expect(roleHost().hasAttribute('aria-haspopup')).toBe(false);
      });
    });
  });

  // `tabindex` is read straight off the DOM by `_isHostKeyboardOperable`, so a host that flips it
  // after view init changes which interaction it supports without any input changing. Nothing but
  // the host observer can notice that - and the disclosure attributes it wrote are still sitting
  // there, promising a dialog the click no longer opens.
  describe('a control host that leaves the tab order after view init', () => {
    const collapsibleHost = () => fixture.nativeElement.querySelector('#collapsible') as HTMLElement;

    function clickHost(): void {
      collapsibleHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    }

    it('advertises the disclosure while it is still operable', () => {
      expect(collapsibleHost().getAttribute('aria-expanded')).toBe('false');
      expect(collapsibleHost().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('drops the disclosure state and goes back to hover once tabindex="-1" lands', async () => {
      fixture.componentInstance.hostTabindex.set('-1');
      fixture.detectChanges();
      await settleObserver();

      expect(collapsibleHost().hasAttribute('aria-expanded')).toBe(false);
      expect(collapsibleHost().hasAttribute('aria-haspopup')).toBe(false);

      clickHost();
      await settleObserver();
      expect(tooltipPanel()).toBeNull();

      collapsibleHost().dispatchEvent(new MouseEvent('mouseenter'));
      await settleObserver();
      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();
    });

    it('picks the disclosure back up when the host rejoins the tab order', async () => {
      fixture.componentInstance.hostTabindex.set('-1');
      fixture.detectChanges();
      await settleObserver();

      fixture.componentInstance.hostTabindex.set(null);
      fixture.detectChanges();
      await settleObserver();

      expect(collapsibleHost().getAttribute('aria-expanded')).toBe('false');
      expect(collapsibleHost().getAttribute('aria-haspopup')).toBe('dialog');

      clickHost();
      await settleObserver();
      expect(closeButton()).not.toBeNull();
    });
  });

  // `href` decides the same thing `tabindex` does: both `INTERACTIVE_SELECTOR` and
  // `KEYBOARD_ACTIVATABLE_SELECTOR` say `a[href]`, so an anchor that drops its href stops being
  // activatable from the keyboard. `_pinsOnClick` is read live and stops pinning on its own, but
  // the disclosure attributes are written once and stay until something re-syncs - so the host
  // observer has to watch `href` too, or they sit there advertising a dialog nothing opens.
  describe('an anchor host that stops being a link after view init', () => {
    const linkHost = () => fixture.nativeElement.querySelector('#conditional-link') as HTMLElement;

    function clickLinkHost(): void {
      linkHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    }

    it('advertises the disclosure while the href is there', () => {
      expect(linkHost().getAttribute('aria-expanded')).toBe('false');
      expect(linkHost().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('drops the disclosure state and goes back to hover once the href goes', async () => {
      fixture.componentInstance.hostHref.set(null);
      fixture.detectChanges();
      await settleObserver();

      expect(linkHost().hasAttribute('aria-expanded')).toBe(false);
      expect(linkHost().hasAttribute('aria-haspopup')).toBe(false);

      clickLinkHost();
      await settleObserver();
      expect(tooltipPanel()).toBeNull();

      linkHost().dispatchEvent(new MouseEvent('mouseenter'));
      await settleObserver();
      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();
    });

    it('picks the disclosure back up when the href returns', async () => {
      fixture.componentInstance.hostHref.set(null);
      fixture.detectChanges();
      await settleObserver();

      fixture.componentInstance.hostHref.set('#go');
      fixture.detectChanges();
      await settleObserver();

      expect(linkHost().getAttribute('aria-expanded')).toBe('false');
      expect(linkHost().getAttribute('aria-haspopup')).toBe('dialog');

      clickLinkHost();
      await settleObserver();
      expect(closeButton()).not.toBeNull();
    });
  });

  // Pinning is still reachable through `stick()` on such a host, so the keyboard dismissal path
  // has to put focus somewhere real rather than assume the host can take it.
  describe('restoring focus from a non-focusable host', () => {
    const spanHost = () => fixture.nativeElement.querySelector('#span-host') as HTMLElement;

    function stickSpanHost(): void {
      fixture.debugElement
        .query((node) => node.nativeElement === spanHost())
        .injector.get(TnTooltipDirective)
        .stick({ focusTooltip: true });
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
    }

    it('makes the host focusable rather than dropping focus to the body', () => {
      document.body.appendChild(fixture.nativeElement);
      stickSpanHost();
      expect(tooltipPanel()).not.toBeNull();

      closeButton()?.focus();
      closeButton()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(spanHost().getAttribute('tabindex')).toBe('-1');
      expect(document.activeElement).toBe(spanHost());
      fixture.nativeElement.remove();
    });

    // Pinning it does not make the markup valid: none of the three attributes is allowed on a
    // `<span>`'s implicit `generic` role, so a panel pinned this way stays unadvertised rather
    // than reintroducing through `stick()` the axe violation the click path declines to produce.
    it('still writes no disclosure state onto a host that cannot carry it', () => {
      stickSpanHost();
      expect(tooltipPanel()).not.toBeNull();

      expect(spanHost().hasAttribute('aria-expanded')).toBe(false);
      expect(spanHost().hasAttribute('aria-haspopup')).toBe(false);
      expect(spanHost().hasAttribute('aria-controls')).toBe(false);
    });
  });

  // The three entry points have to agree: `toggle()` routing to `show()` would put up an
  // unpinned panel for a message that can only be used pinned - `pointer-events: none`, so the
  // link in it is unclickable, and gone again on `mouseleave`.
  describe('toggle()', () => {
    function toggleOn(target: HTMLElement): void {
      fixture.debugElement
        .query((node) => node.nativeElement === target)
        .injector.get(TnTooltipDirective)
        .toggle();
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
    }

    it('opens a pinnable message pinned, as the host click would', () => {
      toggleOn(host);

      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).not.toBeNull();
    });

    it('closes it again on a second call', () => {
      toggleOn(host);
      toggleOn(host);

      expect(tooltipPanel()).toBeNull();
    });

    it('still just shows and hides plain help text', () => {
      toggleOn(plainHost);
      expect(tooltipPanel()).not.toBeNull();
      expect(closeButton()).toBeNull();

      toggleOn(plainHost);
      expect(tooltipPanel()).toBeNull();
    });
  });

  describe('isSticky()', () => {
    function directiveOn(target: HTMLElement): TnTooltipDirective {
      return fixture.debugElement
        .query((node) => node.nativeElement === target)
        .injector.get(TnTooltipDirective);
    }

    it('reports the pin as soon as the host click makes it', () => {
      expect(directiveOn(host).isSticky()).toBe(false);

      click();

      expect(directiveOn(host).isSticky()).toBe(true);
    });

    // `unstick` ends in `hide(0)`, which only *schedules* the teardown. Reading the flag out of
    // that timeout would leave a public "is it pinned right now" answering `true` for a macrotask
    // after the call that unpinned it - a caller cannot see the timeout to wait for it.
    it('reports the unpin as soon as unstick() returns, not a macrotask later', () => {
      click();
      const directive = directiveOn(host);

      directive.unstick();

      expect(directive.isSticky()).toBe(false);
      // And the host stops advertising an open panel at the same moment, rather than drifting out
      // of step with the flag until the teardown runs.
      expect(host.getAttribute('aria-expanded')).toBe('false');
      expect(host.hasAttribute('aria-controls')).toBe(false);

      jest.advanceTimersByTime(0);
      fixture.detectChanges();
      expect(tooltipPanel()).toBeNull();
      expect(directive.isSticky()).toBe(false);
    });
  });

  describe('a tooltip pinned imperatively through stick()', () => {
    function stickPlainHost(): void {
      const directive = fixture.debugElement
        .query((node) => node.nativeElement === plainHost)
        .injector.get(TnTooltipDirective);
      directive.stick();
      jest.advanceTimersByTime(0);
      fixture.detectChanges();
    }

    it('dismisses on a host click, like every other pinned tooltip', () => {
      stickPlainHost();
      expect(closeButton()).not.toBeNull();

      plainHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(tooltipPanel()).toBeNull();
    });

    it('advertises itself on the host while it is up', () => {
      stickPlainHost();

      expect(plainHost.getAttribute('aria-expanded')).toBe('true');
      expect(plainHost.getAttribute('aria-controls')).toBe(tooltipPanel()?.id);

      plainHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      // Back to a plain hover tooltip, which advertises nothing.
      expect(plainHost.hasAttribute('aria-expanded')).toBe(false);
    });
  });

  describe('the host disclosure state', () => {
    // Nothing else on a plain button says "clicking me opens something", so the pinnable host has
    // to carry the state that does.
    it('marks a pinnable host as a control that reveals a dialog, and tracks whether it is open', () => {
      expect(host.getAttribute('aria-expanded')).toBe('false');
      expect(host.getAttribute('aria-haspopup')).toBe('dialog');
      expect(host.hasAttribute('aria-controls')).toBe(false);

      click();
      expect(host.getAttribute('aria-expanded')).toBe('true');
      expect(host.getAttribute('aria-controls')).toBe(tooltipPanel()?.id);

      click();
      expect(host.getAttribute('aria-expanded')).toBe('false');
      expect(host.hasAttribute('aria-controls')).toBe(false);
    });

    it('leaves it off a hover tooltip, which reveals nothing on activation', () => {
      expect(plainHost.hasAttribute('aria-expanded')).toBe(false);
      expect(plainHost.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('drops it when the message stops being pinnable', () => {
      fixture.componentInstance.message.set('Plain help text');
      fixture.detectChanges();

      expect(host.hasAttribute('aria-expanded')).toBe(false);
      expect(host.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('drops it when sticky mode is turned off', () => {
      fixture.componentInstance.sticky.set(false);
      fixture.detectChanges();

      expect(host.hasAttribute('aria-expanded')).toBe(false);
      expect(host.hasAttribute('aria-haspopup')).toBe(false);
    });

    // A host can own aria-expanded for something else entirely - tn-icon-button binds it to the
    // same inner <button> a tooltip would land on, and a menu trigger owns aria-haspopup="menu".
    // Clearing what we never wrote, or overwriting what the host means, would strip the state
    // describing what the click really does.
    it('never touches an aria-expanded the host owns, with a plain tooltip', () => {
      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');

      fixture.componentInstance.ownerMessage.set('Different help text');
      fixture.detectChanges();

      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');
    });

    // The three describe one popup between them, so they are yielded as a set: writing the two
    // the host does not own would announce "expanded dialog controlling tn-tooltip-xxx", mixing
    // the host's own expanded region with a tooltip panel that may well be closed.
    it('yields the whole set, not just the attribute the host owns', () => {
      fixture.componentInstance.ownerMessage.set('Read the <a href="#docs">docs</a>');
      fixture.detectChanges();

      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');
      expect(ownerHost.hasAttribute('aria-haspopup')).toBe(false);

      ownerHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      // Still pins - only the advertising is dropped, and the panel is reached by the same click.
      expect(tooltipPanel()).not.toBeNull();
      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');
      expect(ownerHost.hasAttribute('aria-haspopup')).toBe(false);
      expect(ownerHost.hasAttribute('aria-controls')).toBe(false);
    });

    // Ownership is decided over the whole set, not over the attributes a given sync is about to
    // write. `aria-controls` is only written while pinned, so a host owning that one alone would
    // slip past an unpinned check - leaving the tooltip's collapsed dialog advertised next to the
    // host's own `aria-controls`, and dropped again the moment the pin brought `aria-controls`
    // into the set.
    it('yields the set to a host that owns only the attribute the unpinned state never writes', () => {
      const controlsHost = fixture.nativeElement.querySelector('#owns-controls') as HTMLElement;

      expect(controlsHost.hasAttribute('aria-expanded')).toBe(false);
      expect(controlsHost.hasAttribute('aria-haspopup')).toBe(false);

      controlsHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      // Still pins, and the host's own target is left pointing where it pointed.
      expect(tooltipPanel()).not.toBeNull();
      expect(controlsHost.getAttribute('aria-controls')).toBe('panel-1');
      expect(controlsHost.hasAttribute('aria-expanded')).toBe(false);
    });
  });

  // The ledger that tells this directive's own writes apart from the host's is spent by the
  // records those writes produce - and a write to an element that has already left the DOM
  // produces none. Held in one bucket per attribute name, such an unspendable credit would be
  // spent by the next host write instead, and the takeover would go unnoticed.
  describe('a wrapper whose inner control is swapped out', () => {
    const innerControl = () => fixture.nativeElement
      .querySelector('#swap-host a, #swap-host button') as HTMLElement;

    it('still notices the replacement taking a disclosure attribute over', async () => {
      expect(innerControl().tagName).toBe('A');
      expect(innerControl().getAttribute('aria-expanded')).toBe('false');

      // Swapping the branch detaches the <a> the attributes were written on, and the tooltip
      // clears them there before claiming them on the <button> that replaced it.
      fixture.componentInstance.swappedToButton.set(true);
      fixture.detectChanges();
      await settleObserver();

      expect(innerControl().tagName).toBe('BUTTON');
      expect(innerControl().getAttribute('aria-expanded')).toBe('false');
      expect(innerControl().getAttribute('aria-haspopup')).toBe('dialog');

      // The replacement's own binding then resolves to the value already sitting there, exactly
      // as `<tn-icon-button [ariaExpanded]>` does.
      fixture.componentInstance.swappedExpanded.set('false');
      fixture.detectChanges();
      await settleObserver();

      expect(innerControl().getAttribute('aria-expanded')).toBe('false');
      expect(innerControl().hasAttribute('aria-haspopup')).toBe(false);
    });

    // Yielding is a fact about the element that wrote the attribute, not about the host slot it
    // occupied. Held as a bare attribute name it outlived that element and denied the disclosure
    // state to every later occupant - and permanently, because yielding leaves nothing written to
    // notice the next swap by, so the state never came back for the life of the directive.
    it('re-claims the attributes on a replacement that owns nothing itself', async () => {
      fixture.componentInstance.swappedToButton.set(true);
      fixture.detectChanges();
      await settleObserver();

      // The <button> takes aria-expanded over, so the tooltip yields all three.
      fixture.componentInstance.swappedExpanded.set('false');
      fixture.detectChanges();
      await settleObserver();
      expect(innerControl().hasAttribute('aria-haspopup')).toBe(false);

      // A fresh <a> replaces it, carrying no attributes of its own: nothing about the button it
      // replaced says anything about this element.
      fixture.componentInstance.swappedToButton.set(false);
      fixture.detectChanges();
      await settleObserver();

      expect(innerControl().tagName).toBe('A');
      expect(innerControl().getAttribute('aria-expanded')).toBe('false');
      expect(innerControl().getAttribute('aria-haspopup')).toBe('dialog');
    });
  });

  // Ownership cannot be re-derived from the current value, because a value comparison cannot tell
  // "the host wrote nothing" from "the host wrote the same string we did" - and `aria-expanded`
  // is written as `"false"` by both. So a write the directive did not make is recorded when it
  // happens, through the same MutationObserver that watches the rest of the host.
  describe('a host that starts with no aria-expanded and takes it over later', () => {
    const lateHost = () => fixture.nativeElement.querySelector('#late-expanded') as HTMLElement;

    // The observer's callback is a microtask, which no clock reaches - so the tests below that
    // depend on it are `async` and go through `settleObserver()`, which awaits one.
    it('claims the attributes while the host has none of its own', () => {
      expect(lateHost().getAttribute('aria-expanded')).toBe('false');
      expect(lateHost().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('hands them back when the host writes the same value the tooltip wrote', async () => {
      expect(lateHost().getAttribute('aria-expanded')).toBe('false');

      // The consumer's binding resolves to the string already sitting there. Nothing about the
      // attribute changes, so only the fact that the host wrote it can be noticed.
      fixture.componentInstance.lateExpanded.set('false');
      fixture.detectChanges();
      await settleObserver();

      expect(lateHost().getAttribute('aria-expanded')).toBe('false');
      expect(lateHost().hasAttribute('aria-haspopup')).toBe(false);
    });

    it('does not announce the host as expanded when its tooltip is pinned', async () => {
      fixture.componentInstance.lateExpanded.set('false');
      fixture.detectChanges();
      await settleObserver();

      lateHost().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      await settleObserver();

      // The panel is up, but the host's own collapsed popup keeps its value.
      expect(tooltipPanel()).not.toBeNull();
      expect(lateHost().getAttribute('aria-expanded')).toBe('false');
      expect(lateHost().hasAttribute('aria-controls')).toBe(false);
    });
  });

  it('leaves no overlay pane behind once hidden', () => {
    hover(plainHost);
    leave(plainHost);

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  // The arrow is measured against the pane, so it has to be measured after CDK has moved the
  // pane, not before. Both this directive and `RepositionScrollStrategy` reach `scrolled()`
  // through the same shared subject with the same audit window, so it comes down to subscription
  // order - and CDK subscribes from inside `attach()`. A same-position re-placement emits no
  // `positionChanges`, so nothing follows to correct a stale reading.
  describe('the arrow across a scroll', () => {
    const pane = () => document.querySelector('.cdk-overlay-pane') as HTMLElement;
    const arrowOffset = () => pane().style.getPropertyValue('--tn-tooltip-arrow-offset');

    afterEach(() => jest.restoreAllMocks());

    it('measures the panel after the scroll has re-placed it', () => {
      hover(sideHost);

      // A side-placed panel, where the offset runs down the panel: the host sits at y 170-186
      // (centre 178) and the scroll moves the panel from 100 up to 70.
      let panelTop = 100;
      jest.spyOn(sideHost, 'getBoundingClientRect').mockReturnValue({
        left: 100, width: 16, top: 170, height: 16,
      } as DOMRect);
      jest.spyOn(pane(), 'getBoundingClientRect').mockImplementation(() => ({
        left: 300, width: 200, top: panelTop, height: 200,
      }) as DOMRect);
      // Stands in for the re-placement `RepositionScrollStrategy` performs on each scroll tick.
      jest.spyOn(OverlayRef.prototype, 'updatePosition').mockImplementation(() => {
        panelTop = 70;
      });

      // A page scroll, which reaches the directive through CDK's ScrollDispatcher.
      document.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(100);
      fixture.detectChanges();

      // 178 - 70. Reading 78px would mean the arrow was measured against the panel's pre-scroll
      // top of 100, i.e. before CDK had moved it.
      expect(arrowOffset()).toBe('108px');
    });
  });

  describe('a null message', () => {
    // Switching a tooltip off with `[tnTooltip]="condition ? text : null"` is common in consuming
    // apps, and an explicitly bound null bypasses the input's '' default — the input transform is
    // what turns it back into a string. These cover that the sticky paths (click, pinnability)
    // are normalised too: webui's collapsed-sidenav links do exactly this, and each one threw
    // "Cannot read properties of null (reading 'includes')" out of ngAfterViewInit.
    beforeEach(() => {
      fixture.componentInstance.message.set(null as unknown as string);
      fixture.detectChanges();
    });

    it('renders without throwing', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('shows nothing on hover', () => {
      expect(() => hover()).not.toThrow();
      expect(tooltipPanel()).toBeNull();
    });

    it('shows nothing on click', () => {
      expect(() => click()).not.toThrow();
      expect(tooltipPanel()).toBeNull();
    });

    it('describes nothing to assistive tech', () => {
      expect(host.getAttribute('aria-describedby')).toBeNull();
    });
  });

  // `show()`/`stick()` both refuse to open while disabled, so a panel still up after the input
  // flips is a state neither entry point could produce - and a pinned one has no mouseleave or
  // blur left to close it.
  describe('disabling a tooltip that is already pinned', () => {
    it('takes the panel down', () => {
      click();
      expect(closeButton()).not.toBeNull();

      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(tooltipPanel()).toBeNull();
    });

    it('stops advertising the host as expanded', () => {
      click();
      expect(host.getAttribute('aria-expanded')).toBe('true');

      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      jest.advanceTimersByTime(0);
      fixture.detectChanges();

      expect(host.getAttribute('aria-expanded')).not.toBe('true');
    });

    it('leaves a plain hover tooltip unaffected while it is not showing', () => {
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      jest.advanceTimersByTime(0);

      expect(() => hover()).not.toThrow();
      expect(tooltipPanel()).toBeNull();
    });
  });

  describe('arrow placement', () => {
    const pane = () => document.querySelector('.cdk-overlay-pane') as HTMLElement;
    const arrowOffset = () => pane().style.getPropertyValue('--tn-tooltip-arrow-offset');

    // The clamp reads the arrow's half-base and the panel's corner radius off the panel. Angular
    // component styles are not injected under Jest, so without this the directive's own fallback
    // constants would be the only thing under test and the stylesheet could drift away from them
    // unnoticed. Deliberately not 6px/4px, so a test passing on the fallback would fail here.
    const STUBBED_ARROW_HALF_WIDTH = 8;
    const STUBBED_PANEL_RADIUS = 6;
    const STUBBED_INSET = STUBBED_ARROW_HALF_WIDTH + STUBBED_PANEL_RADIUS;
    let panelStyles: HTMLStyleElement;

    beforeEach(() => {
      panelStyles = document.createElement('style');
      panelStyles.textContent = `.tn-tooltip {
        --tn-tooltip-arrow-half-width: ${STUBBED_ARROW_HALF_WIDTH}px;
        --tn-tooltip-radius: ${STUBBED_PANEL_RADIUS}px;
      }`;
      document.head.appendChild(panelStyles);
    });

    // These stub geometry that jsdom does not provide; nothing else in the file may inherit it.
    afterEach(() => {
      panelStyles.remove();
      jest.restoreAllMocks();
    });

    /**
     * jsdom gives every element a zero-sized rect, so the geometry has to be supplied. These
     * stand for a host at x 100-116 (centre 108) under a panel placed at `panelLeft`.
     */
    function stubGeometry(target: HTMLElement, panelLeft: number, panelWidth: number): void {
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        left: 100, width: 16, top: 200, height: 16,
      } as DOMRect);
      jest.spyOn(pane(), 'getBoundingClientRect').mockReturnValue({
        left: panelLeft, width: panelWidth, top: 100, height: 60,
      } as DOMRect);
    }

    /**
     * The same for a side-placed panel, where the offset runs down the panel instead of across
     * it: a host at y 200-216 (centre 208) beside a panel placed at `panelTop`.
     */
    function stubVerticalGeometry(target: HTMLElement, panelTop: number, panelHeight: number): void {
      jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        left: 100, width: 16, top: 200, height: 16,
      } as DOMRect);
      jest.spyOn(pane(), 'getBoundingClientRect').mockReturnValue({
        left: 300, width: 200, top: panelTop, height: panelHeight,
      } as DOMRect);
    }

    function reposition(): void {
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(100);
      fixture.detectChanges();
    }

    it('points the arrow at the host rather than at the panel centre', () => {
      hover(plainHost);
      stubGeometry(plainHost, 40, 200);

      reposition();

      // Host centre 108 sits 68px into a panel starting at 40 - not the 100px panel centre.
      expect(arrowOffset()).toBe('68px');
    });

    it('keeps the arrow clear of the panel corners when the host is far to one side', () => {
      hover(plainHost);
      // A panel pushed right of the host by viewport clamping: the host centre lands outside it.
      stubGeometry(plainHost, 300, 200);

      reposition();

      // The stylesheet's inset, not the directive's fallback - see STUBBED_INSET.
      expect(arrowOffset()).toBe(`${STUBBED_INSET}px`);
    });

    it('clamps against the far corner too', () => {
      hover(plainHost);
      // A panel pushed left of the host: the host centre lands past its right edge.
      stubGeometry(plainHost, -160, 200);

      reposition();

      expect(arrowOffset()).toBe(`${200 - STUBBED_INSET}px`);
    });

    // A side-placed panel runs the other branch of the offset maths: a different axis, with its
    // own dimension and its own sign.
    it('points the arrow down the panel when the tooltip sits beside its host', () => {
      hover(sideHost);
      stubVerticalGeometry(sideHost, 100, 200);

      reposition();

      // Host centre 208 sits 108px down a panel starting at 100 - not the 100px panel centre.
      expect(arrowOffset()).toBe('108px');
    });

    it('clamps a side-placed arrow clear of the corners as well', () => {
      hover(sideHost);
      // A panel pushed below the host by viewport clamping: the host centre lands above it.
      stubVerticalGeometry(sideHost, 300, 200);

      reposition();

      expect(arrowOffset()).toBe(`${STUBBED_INSET}px`);
    });

    it('re-places the panel when pinning resizes it, so the arrow stays on the host', () => {
      // The resize happens inside the single click that opens a pinnable tooltip: the panel is
      // attached at hover width and only then switched into the wider sticky layout. Stubbed on
      // the prototype so the pane is covered from the moment it comes into existence.
      jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        if (this === host) {
          return { left: 100, width: 16, top: 200, height: 16 } as DOMRect;
        }

        if (this.classList.contains('cdk-overlay-pane')) {
          return this.querySelector('.tn-tooltip--sticky')
            ? { left: 20, width: 280, top: 100, height: 60 } as DOMRect
            : { left: 40, width: 200, top: 100, height: 60 } as DOMRect;
        }

        return { left: 0, width: 0, top: 0, height: 0 } as DOMRect;
      });

      click();

      expect(closeButton()).not.toBeNull();
      // Host centre 108, sticky panel starting at 20. Reading 68px would mean the offset was
      // computed against the hover-sized panel and never refreshed - the reported bug.
      expect(arrowOffset()).toBe('88px');
    });
  });
});

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<button tnTooltip="Card menu">Trigger</button>`,
})
class FocusHostComponent {}

function createHost(): ComponentFixture<FocusHostComponent> {
  TestBed.configureTestingModule({ imports: [FocusHostComponent] });
  const fixture = TestBed.createComponent(FocusHostComponent);
  fixture.detectChanges();
  return fixture;
}

/** Lets the directive's show/hide timeouts run, then syncs the view. */
async function settle(fixture: ComponentFixture<FocusHostComponent>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  fixture.detectChanges();
}

function visibleTooltip(): string | undefined {
  return document.querySelector('.tn-tooltip')?.textContent?.trim();
}

describe('TnTooltipDirective focus handling', () => {
  it('shows on hover', async () => {
    const fixture = createHost();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await settle(fixture);

    expect(visibleTooltip()).toBe('Card menu');
  });

  it('shows on keyboard focus', async () => {
    const fixture = createHost();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    TestBed.inject(FocusMonitor).focusVia(trigger, 'keyboard');
    await settle(fixture);

    expect(visibleTooltip()).toBe('Card menu');
  });

  it('stays hidden when focus is restored programmatically', async () => {
    const fixture = createHost();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    // A menu trigger returning focus to itself after its menu closes focuses the button with no
    // user gesture behind it. Showing a tooltip there parks it over the button with the pointer
    // nowhere near, and nothing hides it until the user clicks or tabs away.
    TestBed.inject(FocusMonitor).focusVia(trigger, 'program');
    await settle(fixture);

    expect(visibleTooltip()).toBeUndefined();
  });

  it('stays hidden when the button is focused by a mouse click', async () => {
    const fixture = createHost();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    // Hover already covers this interaction — `mouseenter` fired before the click.
    TestBed.inject(FocusMonitor).focusVia(trigger, 'mouse');
    await settle(fixture);

    expect(visibleTooltip()).toBeUndefined();
  });

  it('hides again on blur', async () => {
    const fixture = createHost();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    TestBed.inject(FocusMonitor).focusVia(trigger, 'keyboard');
    await settle(fixture);
    expect(visibleTooltip()).toBe('Card menu');

    trigger.blur();
    await settle(fixture);

    expect(visibleTooltip()).toBeUndefined();
  });
});


@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<button [tnTooltip]="message()">Trigger</button>`,
})
class ObserverHostComponent {
  message = signal('Plain help text');
}

/**
 * The host observer exists for the things `_syncAria` reads out of the DOM rather than out of a
 * signal, none of which can change the answer for a plain hover tooltip on a host that is itself
 * the control - the shape almost every tooltip in the library has. A table of tooltip'd action
 * buttons would otherwise carry one live subtree observer per row with nothing to report.
 */
describe('TnTooltipDirective host observation', () => {
  const LINK_MESSAGE = 'Read the <a href="#docs">docs</a>';

  let observe: jest.SpyInstance;
  let disconnect: jest.SpyInstance;
  let fixture: ComponentFixture<ObserverHostComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    observe = jest.spyOn(MutationObserver.prototype, 'observe');
    disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    TestBed.configureTestingModule({ imports: [ObserverHostComponent] });
    fixture = TestBed.createComponent(ObserverHostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('button') as HTMLElement;
  });

  afterEach(() => {
    observe.mockRestore();
    disconnect.mockRestore();
  });

  /** Observers other parts of the framework connect elsewhere are none of this test's business. */
  function timesObserved(): number {
    return observe.mock.calls.filter(([target]) => target === host).length;
  }

  async function setMessage(message: string): Promise<void> {
    fixture.componentInstance.message.set(message);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  it('leaves a plain-text tooltip on a control host unobserved', () => {
    expect(timesObserved()).toBe(0);
  });

  it('starts observing when the message turns pinnable, and stops when it stops', async () => {
    await setMessage(LINK_MESSAGE);
    expect(timesObserved()).toBe(1);
    expect(host.getAttribute('aria-haspopup')).toBe('dialog');

    await setMessage('Plain help text');
    expect(disconnect).toHaveBeenCalled();
    expect(host.hasAttribute('aria-haspopup')).toBe(false);
  });

  // Disconnecting drops the records queued for the tooltip's own writes, whose ledger credits
  // would otherwise still be waiting to be spent - on the host's next write, which is exactly the
  // one that must not be mistaken for ours.
  it('still notices the host claiming an attribute after a round trip', async () => {
    await setMessage(LINK_MESSAGE);
    await setMessage('Plain help text');
    await setMessage(LINK_MESSAGE);
    expect(host.getAttribute('aria-expanded')).toBe('false');

    host.setAttribute('aria-expanded', 'true');
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();

    expect(host.getAttribute('aria-expanded')).toBe('true');
    expect(host.hasAttribute('aria-haspopup')).toBe(false);
  });
});
