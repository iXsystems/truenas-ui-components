import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import {
  TnSidePanelComponent,
  TnSidePanelHeaderActionDirective,
  TnSidePanelTitleDirective,
} from './side-panel.component';
import { axeResult } from '../a11y/axe-testing';

/**
 * A heading of the consumer's own in the side panel's header (#372).
 *
 * `title` takes text only, and the only other thing the header projected was
 * `tnSidePanelHeaderAction`, which lands in the actions group at the far end.
 * So a heading with an image in it had to be projected as an ACTION and pulled
 * back across the header by a global rule on a private class — global because
 * the panel is hosted in a CDK overlay, out of reach of the consumer's own
 * encapsulated styles. `tnSidePanelTitle` is the slot that replaces that.
 *
 * What the slot does in a real layout — growing, shrinking, keeping the actions
 * in the header — is asserted by the `TitleSlot` story's play function, since
 * jsdom has no layout. This file asserts the structure that layout depends on.
 */

@Component({
  selector: 'tn-side-panel-title-slot-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnSidePanelHeaderActionDirective, TnSidePanelTitleDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-side-panel ariaLabelledby="assistant-heading" [open]="true" [title]="title()">
      <div tnSidePanelTitle>
        <h2 id="assistant-heading">
          <img src="logo.svg" alt="TrueNAS" />
          Assistant
        </h2>
        <span role="status">3 of 3 systems reachable</span>
      </div>
      <button type="button" tnSidePanelHeaderAction>New chat</button>
      <p>Panel body</p>
    </tn-side-panel>
  `,
})
class TitleSlotHostComponent {
  title = signal('');
}

@Component({
  selector: 'tn-side-panel-titled-host',
  standalone: true,
  imports: [TnSidePanelComponent, TnSidePanelHeaderActionDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-side-panel title="Edit dataset" [open]="true">
      <button type="button" tnSidePanelHeaderAction>Fullscreen</button>
      <p>Panel body</p>
    </tn-side-panel>
  `,
})
class TitledHostComponent {}

describe('tn-side-panel title slot (#372)', () => {
  let fixture: ComponentFixture<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleSlotHostComponent, TitledHostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    // An open panel lives in a CDK overlay outside the fixture.
    fixture.destroy();
  });

  /** An open panel's overlay is outside the fixture, in a CDK overlay. */
  function overlay(): HTMLElement {
    return document.body.querySelector('.tn-side-panel__overlay') as HTMLElement;
  }

  function header(): HTMLElement {
    return overlay().querySelector('.tn-side-panel__header') as HTMLElement;
  }

  describe('with the slot used', () => {
    let host: TitleSlotHostComponent;

    beforeEach(() => {
      const slotted = TestBed.createComponent(TitleSlotHostComponent);
      fixture = slotted;
      host = slotted.componentInstance;
      fixture.detectChanges();
    });

    it('puts the slotted heading first in the header, ahead of the actions and the close button', () => {
      const children = Array.from(header().children);
      const slot = header().querySelector('.tn-side-panel__title-slot')!;

      expect(children.map((child) => child.className)).toEqual([
        'tn-side-panel__title-slot',
        'tn-side-panel__header-actions',
      ]);
      expect(slot.querySelector('[tnSidePanelTitle]')).not.toBeNull();
    });

    it('keeps the slotted heading out of the actions group', () => {
      const actions = header().querySelector('.tn-side-panel__header-actions')!;

      expect(actions.querySelector('[tnSidePanelTitle]')).toBeNull();
      expect(actions.querySelector('#assistant-heading')).toBeNull();
      // The actions group still holds what it did: the header action, then ×.
      expect(actions.querySelector('[tnSidePanelHeaderAction]')).not.toBeNull();
      expect(actions.querySelector('tn-icon-button')).not.toBeNull();
    });

    it('renders no heading of its own when there is no title', () => {
      expect(overlay().querySelector('.tn-side-panel__title')).toBeNull();
      // The only heading is the consumer's.
      const headings = Array.from(overlay().querySelectorAll('h1, h2, h3, h4, h5, h6'));
      expect(headings.map((heading) => heading.id)).toEqual(['assistant-heading']);
    });

    it('is named by ariaLabelledby pointing at the slotted heading', async () => {
      expect(overlay().getAttribute('aria-labelledby')).toBe('assistant-heading');
      expect(overlay().getAttribute('aria-label')).toBeNull();

      // `evaluated` alongside the empty `violated`: an empty result is also
      // what axe returns when it looked at nothing.
      const { violated, evaluated } = await axeResult(
        overlay(), overlay(), ['aria-dialog-name', 'aria-valid-attr-value']
      );
      expect(violated).toEqual([]);
      expect(evaluated).toContain('aria-dialog-name');
    });

    // The ticket does not ask for both at once; this pins what happens rather
    // than endorsing it — both render, `title` first, and `title` names the
    // dialog, as it outranks `ariaLabelledby` everywhere else.
    it('renders the title heading ahead of the slot when both are given', () => {
      host.title.set('Edit dataset');
      fixture.detectChanges();

      expect(Array.from(header().children).map((child) => child.className)).toEqual([
        'tn-side-panel__title',
        'tn-side-panel__title-slot',
        'tn-side-panel__header-actions',
      ]);
      expect(overlay().getAttribute('aria-labelledby'))
        .toBe(header().querySelector('.tn-side-panel__title')!.id);
    });
  });

  describe('with a title and the slot unused', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(TitledHostComponent);
      fixture.detectChanges();
    });

    // The regression guard for every existing consumer: an empty slot wrapper
    // would grow into the free space beside the title and take half its room.
    it('renders the header exactly as before: the title heading, then the actions', () => {
      expect(Array.from(header().children).map((child) => child.className)).toEqual([
        'tn-side-panel__title',
        'tn-side-panel__header-actions',
      ]);
      expect(header().querySelector('.tn-side-panel__title-slot')).toBeNull();
    });
  });
});
