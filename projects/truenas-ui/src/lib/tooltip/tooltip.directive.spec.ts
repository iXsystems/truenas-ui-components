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
  `,
})
class HostComponent {
  message = signal('Read the <a href="#docs">docs</a>');
  sticky = signal(true);
  disabled = signal(false);
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

  beforeEach(() => {
    // The dismiss button renders a tn-icon, whose sprite loader would otherwise fire a real XHR.
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  afterEach(fakeAsync(() => {
    fixture.destroy();
    tick();
  }));

  function hover(): void {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    tick();
    fixture.detectChanges();
  }

  function leave(): void {
    host.dispatchEvent(new MouseEvent('mouseleave'));
    tick();
    fixture.detectChanges();
  }

  function click(detail = 1): void {
    host.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
    tick();
    fixture.detectChanges();
  }

  it('shows on hover and hides on mouseleave when not pinned', fakeAsync(() => {
    hover();
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).toBeNull();

    leave();
    expect(tooltipPanel()).toBeNull();
  }));

  it('pins the tooltip on click and renders a dismiss button', fakeAsync(() => {
    click();

    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).not.toBeNull();
    expect(closeButton()?.getAttribute('aria-label')).toBe('Close tooltip');
  }));

  it('keeps a pinned tooltip open on mouseleave and focusout', fakeAsync(() => {
    hover();
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
    hover();

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

  it('does not pin when sticky mode is turned off', fakeAsync(() => {
    fixture.componentInstance.sticky.set(false);
    fixture.detectChanges();

    hover();
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

    hover();
    expect(tooltipPanel()).not.toBeNull();
    expect(closeButton()).toBeNull();
  }));

  it('leaves no overlay pane behind once hidden', fakeAsync(() => {
    hover();
    leave();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  }));
});
