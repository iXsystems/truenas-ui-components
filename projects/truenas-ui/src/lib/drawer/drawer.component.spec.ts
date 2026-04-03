import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnDrawerContainerComponent } from './drawer-container.component';
import { TnDrawerContentComponent } from './drawer-content.component';
import { TnDrawerComponent } from './drawer.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnDrawerContainerComponent, TnDrawerComponent, TnDrawerContentComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-drawer-container>
      <tn-drawer
        #drawer
        [mode]="mode()"
        [disableClose]="disableClose()"
        [position]="position()"
        [(opened)]="opened">
        <p>Side menu content</p>
      </tn-drawer>
      <tn-drawer-content>
        <p>Main content</p>
      </tn-drawer-content>
    </tn-drawer-container>
  `,
})
class TestHostComponent {
  drawer = viewChild.required<TnDrawerComponent>('drawer');
  mode = signal<'side' | 'over'>('side');
  opened = signal(false);
  disableClose = signal(false);
  position = signal<'start' | 'end'>('start');
}

describe('TnDrawerComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  // Side mode: panel is inline in the fixture
  const getPanel = (): HTMLElement =>
    fixture.nativeElement.querySelector('.tn-drawer__panel');

  // Over mode: panel is portaled to document.body
  const getOverPanel = (): HTMLElement | null =>
    document.body.querySelector('.tn-drawer__panel--over');

  const getBackdrop = (): HTMLElement | null =>
    document.body.querySelector('.tn-drawer__backdrop');

  const pressEscape = () => {
    const panel = getOverPanel();
    panel?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up portaled elements
    document.body.querySelectorAll('.tn-drawer__panel--over').forEach((el) => el.remove());
    document.body.querySelectorAll('.tn-drawer__backdrop').forEach((el) => el.remove());
  });

  describe('basic rendering', () => {
    it('should render drawer panel', () => {
      expect(getPanel()).toBeTruthy();
    });

    it('should project content', () => {
      expect(getPanel().textContent).toContain('Side menu content');
    });

    it('should render main content', () => {
      expect(fixture.nativeElement.textContent).toContain('Main content');
    });

    it('should have static tn-drawer class on host', () => {
      const drawerHost = fixture.nativeElement.querySelector('tn-drawer');
      expect(drawerHost.classList.contains('tn-drawer')).toBe(true);
    });
  });

  describe('opened state', () => {
    it('should be closed by default', () => {
      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should open when opened signal is set', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should close when opened signal is unset', () => {
      host.opened.set(true);
      fixture.detectChanges();
      host.opened.set(false);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });
  });

  describe('open/close/toggle methods', () => {
    it('should open via open()', () => {
      host.drawer().open();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should close via close()', () => {
      host.drawer().open();
      fixture.detectChanges();
      host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should toggle via toggle()', () => {
      host.drawer().toggle();
      fixture.detectChanges();
      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);

      host.drawer().toggle();
      fixture.detectChanges();
      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });
  });

  describe('mode: side', () => {
    it('should not show backdrop in side mode', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getBackdrop()).toBeNull();
    });

    it('should not have over class', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--over')).toBe(false);
    });

    it('should have role="navigation"', () => {
      expect(getPanel().getAttribute('role')).toBe('navigation');
    });
  });

  describe('mode: over', () => {
    beforeEach(() => {
      host.mode.set('over');
      fixture.detectChanges();
    });

    it('should render backdrop', () => {
      expect(getBackdrop()).toBeTruthy();
    });

    it('should show backdrop when open', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getBackdrop()?.classList.contains('tn-drawer__backdrop--visible')).toBe(true);
    });

    it('should hide backdrop when closed', () => {
      expect(getBackdrop()?.classList.contains('tn-drawer__backdrop--visible')).toBe(false);
    });

    it('should have over class', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getOverPanel()?.classList.contains('tn-drawer__panel--over')).toBe(true);
    });

    it('should close on backdrop click', () => {
      host.opened.set(true);
      fixture.detectChanges();

      getBackdrop()!.click();
      fixture.detectChanges();

      expect(getOverPanel()?.classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should not close on backdrop click when disableClose is true', () => {
      host.disableClose.set(true);
      host.opened.set(true);
      fixture.detectChanges();

      getBackdrop()!.click();
      fixture.detectChanges();

      expect(getOverPanel()?.classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should have role="dialog" and aria-modal', () => {
      host.opened.set(true);
      fixture.detectChanges();

      const panel = getOverPanel();
      expect(panel?.getAttribute('role')).toBe('dialog');
      expect(panel?.getAttribute('aria-modal')).toBe('true');
    });

    it('should close on Escape key', () => {
      host.opened.set(true);
      fixture.detectChanges();

      pressEscape();

      expect(getOverPanel()?.classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should not close on Escape when disableClose is true', () => {
      host.disableClose.set(true);
      host.opened.set(true);
      fixture.detectChanges();

      pressEscape();

      expect(getOverPanel()?.classList.contains('tn-drawer__panel--open')).toBe(true);
    });
  });

  describe('aria-hidden', () => {
    it('should have aria-hidden="true" when closed', () => {
      expect(getPanel().getAttribute('aria-hidden')).toBe('true');
    });

    it('should not have aria-hidden when open', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('position', () => {
    it('should default to start position', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--end')).toBe(false);
    });

    it('should support end position', () => {
      host.position.set('end');
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--end')).toBe(true);
    });
  });

  describe('disableClose', () => {
    it('should prevent close() when disableClose is true', () => {
      host.disableClose.set(true);
      host.drawer().open();
      fixture.detectChanges();

      host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should allow close() when disableClose is false', () => {
      host.drawer().open();
      fixture.detectChanges();

      host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });
  });
});
