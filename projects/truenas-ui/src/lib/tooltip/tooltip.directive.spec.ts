import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TnTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `
    <button type="button" [tnTooltip]="message()" [tnTooltipSticky]="sticky()" [tnTooltipDisabled]="disabled()">host</button>
    <button type="button" id="plain" [tnTooltip]="'Plain help text'">plain host</button>
    <button type="button" id="owns-expanded" aria-expanded="true" [tnTooltip]="ownerMessage()">menu trigger</button>
  `,
})
class HostComponent {
  // A link in the message is what makes this tooltip click-to-open rather than hover.
  message = signal('Read the <a href="#docs">docs</a>');
  sticky = signal(true);
  disabled = signal(false);
  // A host that drives something of its own (a menu, a select) and happens to carry a tooltip.
  ownerMessage = signal('Plain help text');
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
  });

  afterEach(fakeAsync(() => {
    fixture.destroy();
    tick();
  }));

  function hover(target: HTMLElement = host): void {
    target.dispatchEvent(new MouseEvent('mouseenter'));
    tick();
    fixture.detectChanges();
  }

  function leave(target: HTMLElement = host): void {
    target.dispatchEvent(new MouseEvent('mouseleave'));
    tick();
    fixture.detectChanges();
  }

  function click(detail = 1): void {
    host.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
    tick();
    fixture.detectChanges();
  }

  it('shows plain help text on hover and hides it on mouseleave', fakeAsync(() => {
    hover(plainHost);
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).toBeNull();

    leave(plainHost);
    expect(tooltipPanel()).toBeNull();
  }));

  it('does not open a pinnable tooltip on hover - the click is the only way in', fakeAsync(() => {
    hover();

    expect(tooltipPanel()).toBeNull();
  }));

  it('does not open a pinnable tooltip on focus either', fakeAsync(() => {
    host.dispatchEvent(new FocusEvent('focusin'));
    tick();
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  }));

  it('never pins plain help text, so it does not hijack the host click', fakeAsync(() => {
    plainHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    tick();
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  }));

  it('opens the tooltip already pinned on click, with a dismiss button', fakeAsync(() => {
    click();

    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).not.toBeNull();
    expect(closeButton()?.getAttribute('aria-label')).toBe('Close tooltip');
  }));

  it('keeps a pinned tooltip open on mouseleave and focusout', fakeAsync(() => {
    click();

    leave();
    expect(tooltipPanel()).not.toBeNull();

    // Focus moving into the overlay leaves the host, so without the sticky guard this
    // focusout would hide the tooltip the moment the user reached its content.
    host.dispatchEvent(new FocusEvent('focusout'));
    tick();
    fixture.detectChanges();
    expect(tooltipPanel()).not.toBeNull();
  }));

  it('makes a pinned tooltip interactive rather than click-through', fakeAsync(() => {
    click();

    const tooltipHost = document.querySelector('tn-tooltip') as HTMLElement;
    expect(tooltipHost.classList).toContain('tn-tooltip-component--sticky');
  }));

  it('dismisses on a second click of the host', fakeAsync(() => {
    click();
    expect(tooltipPanel()).not.toBeNull();

    click();
    expect(tooltipPanel()).toBeNull();
  }));

  it('dismisses when the tooltip dismiss button is clicked', fakeAsync(() => {
    click();

    closeButton()?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
  }));

  it('moves focus onto the tooltip panel when pinned from the keyboard', fakeAsync(() => {
    host.focus();
    // A click with detail 0 is what Enter/Space on a button produces.
    click(0);

    expect(document.activeElement).toBe(tooltipPanel());
    // Focused ahead of the message, so Tab reaches the tooltip's own links first.
    expect(tooltipPanel()?.getAttribute('tabindex')).toBe('-1');
  }));

  it('dismisses on Escape and restores focus to the host', fakeAsync(() => {
    host.focus();
    click(0);

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick();
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
    expect(document.activeElement).toBe(host);
  }));

  it('does not intercept Escape while it is only a hover tooltip', fakeAsync(() => {
    // A permanent keydownEvents() subscription would make the tooltip's overlay the top-most
    // Escape handler, stealing the key from whatever dialog the host sits in.
    hover(plainHost);

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(escape);
    tick();

    expect(escape.defaultPrevented).toBe(false);
  }));

  it('dismisses on an outside click', fakeAsync(() => {
    click();

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    tick();
    fixture.detectChanges();

    expect(tooltipPanel()).toBeNull();
    outside.remove();
  }));

  it('falls back to hover when sticky mode is turned off, even with a link in the message', fakeAsync(() => {
    fixture.componentInstance.sticky.set(false);
    fixture.detectChanges();

    hover();
    expect(tooltipPanel()).not.toBeNull();

    click();
    expect(closeButton()).toBeNull();

    leave();
    expect(tooltipPanel()).toBeNull();
  }));

  it('does not pin a disabled tooltip', fakeAsync(() => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    click();

    expect(tooltipPanel()).toBeNull();
  }));

  it('does not pin when there is no message', fakeAsync(() => {
    fixture.componentInstance.message.set('');
    fixture.detectChanges();

    click();

    expect(tooltipPanel()).toBeNull();
  }));

  it('re-opens after being dismissed', fakeAsync(() => {
    click();
    click();
    expect(tooltipPanel()).toBeNull();

    click();
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).not.toBeNull();
  }));

  describe('the host disclosure state', () => {
    // Nothing else on a plain button says "clicking me opens something", so the pinnable host has
    // to carry the state that does.
    it('marks a pinnable host as a control that reveals a dialog, and tracks whether it is open', fakeAsync(() => {
      expect(host.getAttribute('aria-expanded')).toBe('false');
      expect(host.getAttribute('aria-haspopup')).toBe('dialog');
      expect(host.hasAttribute('aria-controls')).toBe(false);

      click();
      expect(host.getAttribute('aria-expanded')).toBe('true');
      expect(host.getAttribute('aria-controls')).toBe(tooltipPanel()?.id);

      click();
      expect(host.getAttribute('aria-expanded')).toBe('false');
      expect(host.hasAttribute('aria-controls')).toBe(false);
    }));

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

    it('never touches an aria-expanded the host owns, even with a pinnable tooltip', fakeAsync(() => {
      fixture.componentInstance.ownerMessage.set('Read the <a href="#docs">docs</a>');
      fixture.detectChanges();

      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');
      // The attributes it does not own are still its tooltip's to write.
      expect(ownerHost.getAttribute('aria-haspopup')).toBe('dialog');

      ownerHost.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      tick();
      fixture.detectChanges();

      expect(tooltipPanel()).not.toBeNull();
      expect(ownerHost.getAttribute('aria-expanded')).toBe('true');
    }));
  });

  it('leaves no overlay pane behind once hidden', fakeAsync(() => {
    hover(plainHost);
    leave(plainHost);

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  }));

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

    it('shows nothing on hover', fakeAsync(() => {
      expect(() => hover()).not.toThrow();
      expect(tooltipPanel()).toBeNull();
    }));

    it('shows nothing on click', fakeAsync(() => {
      expect(() => click()).not.toThrow();
      expect(tooltipPanel()).toBeNull();
    }));

    it('describes nothing to assistive tech', () => {
      expect(host.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('arrow placement', () => {
    const pane = () => document.querySelector('.cdk-overlay-pane') as HTMLElement;
    const arrowOffset = () => pane().style.getPropertyValue('--tn-tooltip-arrow-offset');

    // These stub geometry that jsdom does not provide; nothing else in the file may inherit it.
    afterEach(() => jest.restoreAllMocks());

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

    function reposition(): void {
      window.dispatchEvent(new Event('resize'));
      tick(100);
      fixture.detectChanges();
    }

    it('points the arrow at the host rather than at the panel centre', fakeAsync(() => {
      hover(plainHost);
      stubGeometry(plainHost, 40, 200);

      reposition();

      // Host centre 108 sits 68px into a panel starting at 40 - not the 100px panel centre.
      expect(arrowOffset()).toBe('68px');
    }));

    it('keeps the arrow clear of the panel corners when the host is far to one side', fakeAsync(() => {
      hover(plainHost);
      // A panel pushed right of the host by viewport clamping: the host centre lands outside it.
      stubGeometry(plainHost, 300, 200);

      reposition();

      expect(arrowOffset()).toBe('10px');
    }));

    it('re-places the panel when pinning resizes it, so the arrow stays on the host', fakeAsync(() => {
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
    }));
  });
});
