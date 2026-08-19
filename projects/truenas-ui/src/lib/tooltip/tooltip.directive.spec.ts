import { FocusMonitor } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<button tnTooltip="Card menu">Trigger</button>`,
})
class HostComponent {}

function createHost(): ComponentFixture<HostComponent> {
  TestBed.configureTestingModule({ imports: [HostComponent] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

/** Lets the directive's show/hide timeouts run, then syncs the view. */
async function settle(fixture: ComponentFixture<HostComponent>): Promise<void> {
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
