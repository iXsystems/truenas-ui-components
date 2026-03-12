import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnSidePanelComponent } from './side-panel.component';

describe('TnSidePanelComponent', () => {
  let component: TnSidePanelComponent;
  let fixture: ComponentFixture<TnSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnSidePanelComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TnSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('host classes', () => {
    it('should have base class', () => {
      expect(fixture.nativeElement.classList.contains('tn-side-panel')).toBe(true);
    });

    it('should not have open class when closed', () => {
      expect(fixture.nativeElement.classList.contains('tn-side-panel--open')).toBe(false);
    });

    it('should have open class when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('tn-side-panel--open')).toBe(true);
    });

    it('should have contained class when contained', () => {
      fixture.componentRef.setInput('contained', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains('tn-side-panel--contained')).toBe(true);
    });

    it('should not have contained class by default', () => {
      expect(fixture.nativeElement.classList.contains('tn-side-panel--contained')).toBe(false);
    });
  });

  describe('DOM rendering', () => {
    it('should render backdrop by default', () => {
      const backdrop = fixture.nativeElement.querySelector('.tn-side-panel__backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should not render backdrop when hasBackdrop is false', () => {
      fixture.componentRef.setInput('hasBackdrop', false);
      fixture.detectChanges();
      const backdrop = fixture.nativeElement.querySelector('.tn-side-panel__backdrop');
      expect(backdrop).toBeNull();
    });

    it('should render title text', () => {
      fixture.componentRef.setInput('title', 'My Panel');
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('.tn-side-panel__title');
      expect(title.textContent.trim()).toBe('My Panel');
    });

    it('should render dismiss button', () => {
      const dismissBtn = fixture.nativeElement.querySelector('tn-icon-button');
      expect(dismissBtn).toBeTruthy();
    });

    it('should apply width to panel', () => {
      fixture.componentRef.setInput('width', '600px');
      fixture.detectChanges();
      const panel = fixture.nativeElement.querySelector('.tn-side-panel__panel');
      expect(panel.style.width).toBe('600px');
    });

    it('should not render footer when no actions are projected', () => {
      const footer = fixture.nativeElement.querySelector('.tn-side-panel__actions');
      expect(footer).toBeNull();
    });
  });

  describe('dismiss behavior', () => {
    it('should emit openChange(false) when dismiss is clicked', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const openChangeSpy = jest.fn();
      component.openChange.subscribe(openChangeSpy);

      const dismissBtn = fixture.nativeElement.querySelector('tn-icon-button button');
      dismissBtn.click();

      expect(openChangeSpy).toHaveBeenCalledWith(false);
    });

    it('should emit openChange(false) when backdrop is clicked', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const openChangeSpy = jest.fn();
      component.openChange.subscribe(openChangeSpy);

      const backdrop = fixture.nativeElement.querySelector('.tn-side-panel__backdrop');
      backdrop.click();

      expect(openChangeSpy).toHaveBeenCalledWith(false);
    });

    it('should not emit openChange on backdrop click when closeOnBackdropClick is false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnBackdropClick', false);
      fixture.detectChanges();

      const openChangeSpy = jest.fn();
      component.openChange.subscribe(openChangeSpy);

      const backdrop = fixture.nativeElement.querySelector('.tn-side-panel__backdrop');
      backdrop.click();

      expect(openChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('escape key handling', () => {
    it('should emit openChange(false) on Escape when open', () => {
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();

      const openChangeSpy = jest.fn();
      component.openChange.subscribe(openChangeSpy);

      const panel = fixture.nativeElement.querySelector('.tn-side-panel__panel');
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(openChangeSpy).toHaveBeenCalledWith(false);
    });

    it('should not emit openChange on Escape when closeOnEscape is false', () => {
      fixture.componentRef.setInput('open', true);
      fixture.componentRef.setInput('closeOnEscape', false);
      fixture.detectChanges();

      const openChangeSpy = jest.fn();
      component.openChange.subscribe(openChangeSpy);

      const panel = fixture.nativeElement.querySelector('.tn-side-panel__panel');
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(openChangeSpy).not.toHaveBeenCalled();
    });
  });
});
