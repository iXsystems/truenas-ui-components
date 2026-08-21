import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { TnSidePanelComponent } from './side-panel.component';

describe('TnSidePanelComponent', () => {
  let component: TnSidePanelComponent;
  let fixture: ComponentFixture<TnSidePanelComponent>;
  let warn: jest.SpyInstance;

  function getOverlay(): HTMLElement {
    return document.querySelector(`[data-tn-panel="${component.panelId}"].tn-side-panel__overlay`)!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    // Almost every fixture here is untitled and unlabelled, and #214 makes an
    // unnamed panel warn in dev mode — which Jest is. Silenced so this suite's
    // output stays readable; the warning itself is asserted in
    // `side-panel-a11y.spec.ts`.
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    fixture = TestBed.createComponent(TnSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up portaled overlay from document.body
    fixture.destroy();
    warn.mockRestore();
  });

  describe('overlay classes', () => {
    it('should have overlay element', () => {
      expect(getOverlay()).toBeTruthy();
    });

    it('should not have open class when closed', () => {
      expect(getOverlay().classList.contains('tn-side-panel__overlay--open')).toBe(false);
    });

    it('should have open class when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(getOverlay().classList.contains('tn-side-panel__overlay--open')).toBe(true);
    });

  });

  describe('ARIA attributes', () => {
    it('should have role dialog on overlay', () => {
      expect(getOverlay().getAttribute('role')).toBe('dialog');
    });

    it('should not set aria-modal when closed', () => {
      expect(getOverlay().getAttribute('aria-modal')).toBeNull();
    });

    it('should set aria-modal to true when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(getOverlay().getAttribute('aria-modal')).toBe('true');
    });

    it('should set aria-hidden to true when closed', () => {
      expect(getOverlay().getAttribute('aria-hidden')).toBe('true');
    });

    it('should not set aria-hidden when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(getOverlay().getAttribute('aria-hidden')).toBeNull();
    });

    // Titled, because since #214 the heading is what `aria-labelledby` points
    // at and an untitled panel renders none — it is named by `aria-label`
    // instead, which `side-panel-a11y.spec.ts` covers.
    it('should set aria-labelledby to the title when open', () => {
      fixture.componentRef.setInput('title', 'My Panel');
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(getOverlay().getAttribute('aria-labelledby')).toBe(component.titleId);
    });
  });

  describe('DOM rendering', () => {
    it('should render backdrop by default', () => {
      expect(getOverlay().querySelector('.tn-side-panel__backdrop')).toBeTruthy();
    });

    it('should not render backdrop when hasBackdrop is false', () => {
      fixture.componentRef.setInput('hasBackdrop', false);
      fixture.detectChanges();
      expect(getOverlay().querySelector('.tn-side-panel__backdrop')).toBeNull();
    });

    it('should render title text', () => {
      fixture.componentRef.setInput('title', 'My Panel');
      fixture.detectChanges();
      const title = getOverlay().querySelector('.tn-side-panel__title');
      expect(title!.textContent!.trim()).toBe('My Panel');
    });

    it('should render dismiss button', () => {
      expect(getOverlay().querySelector('tn-icon-button')).toBeTruthy();
    });

    it('should apply width to panel', () => {
      fixture.componentRef.setInput('width', '600px');
      fixture.detectChanges();
      const panel = getOverlay().querySelector('.tn-side-panel__panel') as HTMLElement;
      expect(panel.style.width).toBe('600px');
    });

    it('should not render footer when no actions are projected', () => {
      expect(getOverlay().querySelector('.tn-side-panel__actions')).toBeNull();
    });
  });

  describe('dismiss behavior', () => {
    it('should set open to false when dismiss is clicked', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const dismissBtn = getOverlay().querySelector('tn-icon-button button') as HTMLElement;
      dismissBtn.click();

      expect(component.open()).toBe(false);
    });

    it('should set open to false when backdrop is clicked', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const backdrop = getOverlay().querySelector('.tn-side-panel__backdrop') as HTMLElement;
      backdrop.click();

      expect(component.open()).toBe(false);
    });

    it('should not close on backdrop click when closeOnBackdropClick is false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnBackdropClick', false);
      fixture.detectChanges();

      const backdrop = getOverlay().querySelector('.tn-side-panel__backdrop') as HTMLElement;
      backdrop.click();

      expect(component.open()).toBe(true);
    });
  });

  describe('escape key handling', () => {
    it('should set open to false on Escape when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const panel = getOverlay().querySelector('.tn-side-panel__panel')!;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(component.open()).toBe(false);
    });

    it('should not close on Escape when closeOnEscape is false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnEscape', false);
      fixture.detectChanges();

      const panel = getOverlay().querySelector('.tn-side-panel__panel')!;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(component.open()).toBe(true);
    });
  });

  describe('closeGuard', () => {
    function openWithGuard(guard: () => ReturnType<typeof of<boolean>>): void {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeGuard', guard);
      fixture.detectChanges();
    }

    function clickDismiss(): void {
      (getOverlay().querySelector('tn-icon-button button') as HTMLElement).click();
    }

    it('closes when the guard allows it', () => {
      openWithGuard(() => of(true));

      clickDismiss();

      expect(component.open()).toBe(false);
    });

    it('keeps the panel open when the guard vetoes the close', () => {
      const guard = jest.fn(() => of(false));
      openWithGuard(guard);

      clickDismiss();

      expect(guard).toHaveBeenCalledTimes(1);
      expect(component.open()).toBe(true);
    });

    it('applies the guard to backdrop clicks', () => {
      openWithGuard(() => of(false));

      (getOverlay().querySelector('.tn-side-panel__backdrop') as HTMLElement).click();

      expect(component.open()).toBe(true);
    });

    it('applies the guard to the Escape key', () => {
      openWithGuard(() => of(false));

      getOverlay().querySelector('.tn-side-panel__panel')!
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(component.open()).toBe(true);
    });

    it('waits for an async guard before closing', () => {
      const gate = new Subject<boolean>();
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeGuard', () => gate);
      fixture.detectChanges();

      clickDismiss();
      expect(component.open()).toBe(true);

      gate.next(true);
      expect(component.open()).toBe(false);
    });
  });
});
