import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnBannerComponent, TnBannerActionDirective } from './banner.component';

@Component({
  standalone: true,
  imports: [TnBannerComponent, TnBannerActionDirective],
  template: `
    <tn-banner heading="Test Heading" type="error">
      <button tnBannerAction>Action Button</button>
    </tn-banner>
  `
})
class BannerWithActionTestComponent {}

@Component({
  standalone: true,
  imports: [TnBannerComponent],
  template: `
    <tn-banner heading="Test Heading" />
  `
})
class BannerWithoutActionTestComponent {}

describe('TnBannerComponent', () => {
  let component: TnBannerComponent;
  let fixture: ComponentFixture<TnBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnBannerComponent, BannerWithActionTestComponent, BannerWithoutActionTestComponent],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(TnBannerComponent);
    component = fixture.componentInstance;

    // Set required input
    fixture.componentRef.setInput('heading', 'Test Heading');
    fixture.detectChanges(); // Initial render for DOM tests
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
      expect(component.type()).toBe('error');
    });

    it('should have undefined message by default', () => {
      expect(component.message()).toBeUndefined();
    });

    it('should accept custom message', () => {
      fixture.componentRef.setInput('message', 'Test message');
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
      const classes = component.classes();
      expect(classes).toContain('tn-banner--warning');
    });

    it('should include error type class', () => {
      fixture.componentRef.setInput('type', 'error');
      const classes = component.classes();
      expect(classes).toContain('tn-banner--error');
    });

    it('should include success type class', () => {
      fixture.componentRef.setInput('type', 'success');
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
      expect(component.iconName()).toBe('alert-circle');
    });

    it('should return check-circle icon for success type', () => {
      fixture.componentRef.setInput('type', 'success');
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
      expect(component.ariaRole()).toBe('alert');
    });

    it('should return status for success type', () => {
      fixture.componentRef.setInput('type', 'success');
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
      fixture.detectChanges(); // Need to update DOM after input change

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
      fixture.detectChanges(); // Need to update DOM after input change

      const banner = fixture.nativeElement.querySelector('.tn-banner');
      expect(banner.getAttribute('role')).toBe('alert');
    });
  });

  describe('action content projection', () => {
    it('should not render action area when no action content is projected', () => {
      const hostFixture = TestBed.createComponent(BannerWithoutActionTestComponent);
      hostFixture.detectChanges();

      const actionArea = hostFixture.nativeElement.querySelector('.tn-banner__action');
      expect(actionArea).toBeNull();
    });

    it('should render action area when action content is projected', () => {
      const hostFixture = TestBed.createComponent(BannerWithActionTestComponent);
      hostFixture.detectChanges();

      const bannerElement = hostFixture.nativeElement.querySelector('tn-banner');
      const projectedButton = bannerElement?.querySelector('button');
      expect(projectedButton).toBeTruthy();

      const actionArea = hostFixture.nativeElement.querySelector('.tn-banner__action');
      expect(actionArea).toBeTruthy();
    });

    it('should project action content with tnBannerAction attribute', () => {
      const hostFixture = TestBed.createComponent(BannerWithActionTestComponent);
      hostFixture.detectChanges();

      const actionButton = hostFixture.nativeElement.querySelector('[tnBannerAction]');
      expect(actionButton).toBeTruthy();
      expect(actionButton.textContent.trim()).toBe('Action Button');
    });
  });
});
