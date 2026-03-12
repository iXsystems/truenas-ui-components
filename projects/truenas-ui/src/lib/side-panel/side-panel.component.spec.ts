import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';

describe('TnSidePanelComponent', () => {
  let component: TnSidePanelComponent;
  let fixture: ComponentFixture<TnSidePanelComponent>;

  function getOverlay(): HTMLElement {
    return document.querySelector(`[data-tn-panel="${component.panelId}"].tn-side-panel__overlay`)!;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up portaled overlay from document.body
    fixture.destroy();
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

    it('should set aria-labelledby when open', () => {
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
});
