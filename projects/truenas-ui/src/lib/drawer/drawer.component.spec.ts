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

  const getPanel = (): HTMLElement =>
    fixture.nativeElement.querySelector('.tn-drawer__panel');

  const getBackdrop = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.tn-drawer__backdrop');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
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
    it('should open via open()', async () => {
      await host.drawer().open();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should close via close()', async () => {
      await host.drawer().open();
      fixture.detectChanges();
      await host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should toggle via toggle()', async () => {
      await host.drawer().toggle();
      fixture.detectChanges();
      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);

      await host.drawer().toggle();
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
  });

  describe('mode: over', () => {
    beforeEach(() => {
      host.mode.set('over');
      fixture.detectChanges();
    });

    it('should show backdrop when open', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getBackdrop()).toBeTruthy();
    });

    it('should not show backdrop when closed', () => {
      expect(getBackdrop()).toBeNull();
    });

    it('should have over class', () => {
      host.opened.set(true);
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--over')).toBe(true);
    });

    it('should close on backdrop click', () => {
      host.opened.set(true);
      fixture.detectChanges();

      getBackdrop()!.click();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });

    it('should not close on backdrop click when disableClose is true', () => {
      host.disableClose.set(true);
      host.opened.set(true);
      fixture.detectChanges();

      getBackdrop()!.click();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
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
    it('should prevent close() when disableClose is true', async () => {
      host.disableClose.set(true);
      await host.drawer().open();
      fixture.detectChanges();

      await host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(true);
    });

    it('should allow close() when disableClose is false', async () => {
      await host.drawer().open();
      fixture.detectChanges();

      await host.drawer().close();
      fixture.detectChanges();

      expect(getPanel().classList.contains('tn-drawer__panel--open')).toBe(false);
    });
  });

  describe('closedStart output', () => {
    it('should emit closedStart when closing', async () => {
      const closedStartSpy = jest.fn();
      host.drawer().closedStart.subscribe(closedStartSpy);

      await host.drawer().open();
      fixture.detectChanges();
      await host.drawer().close();
      fixture.detectChanges();

      expect(closedStartSpy).toHaveBeenCalled();
    });

    it('should not emit closedStart when disableClose prevents close', async () => {
      host.disableClose.set(true);
      const closedStartSpy = jest.fn();
      host.drawer().closedStart.subscribe(closedStartSpy);

      await host.drawer().open();
      fixture.detectChanges();
      await host.drawer().close();
      fixture.detectChanges();

      expect(closedStartSpy).not.toHaveBeenCalled();
    });
  });
});
