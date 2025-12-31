import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnBannerComponent } from './banner.component';

describe('TnBannerComponent', () => {
  let component: TnBannerComponent;
  let fixture: ComponentFixture<TnBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnBannerComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(TnBannerComponent);
    component = fixture.componentInstance;

    // Set required input
    fixture.componentRef.setInput('heading', 'Test Heading');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('input signals', () => {
    it('should have default type of info', () => {
      expect(component.type()).toBe('info');
    });

    it('should accept custom type', () => {
      fixture.componentRef.setInput('type', 'error');
      fixture.detectChanges();
      expect(component.type()).toBe('error');
    });

    it('should have undefined message by default', () => {
      expect(component.message()).toBeUndefined();
    });

    it('should accept custom message', () => {
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();
      expect(component.message()).toBe('Test message');
    });
  });

  describe('classes computed', () => {
    it('should include base class', () => {
      const classes = component.classes();
      expect(classes).toContain('tn-banner');
    });

    it('should include info type class by default', () => {
      const classes = component.classes();
      expect(classes).toContain('tn-banner--info');
    });

    it('should include warning type class', () => {
      fixture.componentRef.setInput('type', 'warning');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('tn-banner--warning');
    });

    it('should include error type class', () => {
      fixture.componentRef.setInput('type', 'error');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('tn-banner--error');
    });

    it('should include success type class', () => {
      fixture.componentRef.setInput('type', 'success');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('tn-banner--success');
    });
  });

  describe('iconName computed', () => {
    it('should return information icon for info type', () => {
      expect(component.iconName()).toBe('information');
    });

    it('should return alert icon for warning type', () => {
      fixture.componentRef.setInput('type', 'warning');
      fixture.detectChanges();
      expect(component.iconName()).toBe('alert');
    });

    it('should return alert-circle icon for error type', () => {
      fixture.componentRef.setInput('type', 'error');
      fixture.detectChanges();
      expect(component.iconName()).toBe('alert-circle');
    });

    it('should return check-circle icon for success type', () => {
      fixture.componentRef.setInput('type', 'success');
      fixture.detectChanges();
      expect(component.iconName()).toBe('check-circle');
    });
  });

  describe('ariaRole computed', () => {
    it('should return status for info type', () => {
      expect(component.ariaRole()).toBe('status');
    });

    it('should return alert for warning type', () => {
      fixture.componentRef.setInput('type', 'warning');
      fixture.detectChanges();
      expect(component.ariaRole()).toBe('alert');
    });

    it('should return alert for error type', () => {
      fixture.componentRef.setInput('type', 'error');
      fixture.detectChanges();
      expect(component.ariaRole()).toBe('alert');
    });

    it('should return status for success type', () => {
      fixture.componentRef.setInput('type', 'success');
      fixture.detectChanges();
      expect(component.ariaRole()).toBe('status');
    });
  });

  describe('DOM rendering', () => {
    it('should render heading text', () => {
      const heading = fixture.nativeElement.querySelector('.tn-banner__heading');
      expect(heading.textContent.trim()).toBe('Test Heading');
    });

    it('should render message when provided', () => {
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const message = fixture.nativeElement.querySelector('.tn-banner__message');
      expect(message).toBeTruthy();
      expect(message.textContent.trim()).toBe('Test message');
    });

    it('should not render message when not provided', () => {
      const message = fixture.nativeElement.querySelector('.tn-banner__message');
      expect(message).toBeNull();
    });

    it('should render icon component', () => {
      const icon = fixture.nativeElement.querySelector('tn-icon');
      expect(icon).toBeTruthy();
    });

    it('should apply correct ARIA role', () => {
      const banner = fixture.nativeElement.querySelector('.tn-banner');
      expect(banner.getAttribute('role')).toBe('status');
    });

    it('should apply alert role for error type', () => {
      fixture.componentRef.setInput('type', 'error');
      fixture.detectChanges();

      const banner = fixture.nativeElement.querySelector('.tn-banner');
      expect(banner.getAttribute('role')).toBe('alert');
    });
  });
});
