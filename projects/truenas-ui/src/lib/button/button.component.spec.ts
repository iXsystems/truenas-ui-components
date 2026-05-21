import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TnButtonComponent } from './button.component';

describe('TnButtonComponent', () => {
  let component: TnButtonComponent;
  let fixture: ComponentFixture<TnButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnButtonComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TnButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filled variant', () => {
    it('should apply correct class for filled variant with primary color', () => {
      fixture.componentRef.setInput('variant', 'filled');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-primary');
    });

    it('should apply correct class for filled variant with warn color', () => {
      fixture.componentRef.setInput('variant', 'filled');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-warn');
    });

    it('should apply correct class for filled variant with default color', () => {
      fixture.componentRef.setInput('variant', 'filled');
      fixture.componentRef.setInput('color', 'default');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-default');
    });

    it('should apply primary class when primary boolean is true', () => {
      fixture.componentRef.setInput('variant', 'filled');
      fixture.componentRef.setInput('primary', true);
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-primary');
    });
  });

  describe('outline variant', () => {
    it('should apply correct class for outline variant with primary color', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.componentRef.setInput('color', 'primary');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-outline-primary');
    });

    it('should apply correct class for outline variant with warn color', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.componentRef.setInput('color', 'warn');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-outline-warn');
    });

    it('should apply correct class for outline variant with default color', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.componentRef.setInput('color', 'default');
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-outline-default');
    });

    it('should apply outline-primary when primary boolean is true', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.componentRef.setInput('primary', true);
      fixture.detectChanges();
      const classes = component.classes();
      expect(classes).toContain('button-outline-primary');
    });
  });

  describe('classes getter', () => {
    it('should always include base storybook-button class', () => {
      const classes = component.classes();
      expect(classes).toContain('storybook-button');
    });

    it('should include size class', () => {
      component.size = 'large';
      const classes = component.classes();
      expect(classes).toContain('storybook-button--large');
    });
  });

  describe('disabled state', () => {
    it('should have disabled property', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });
  });

  describe('onClick event', () => {
    it('should emit onClick event when clicked', () => {
      const clickSpy = jest.fn();
      component.onClick.subscribe(clickSpy);

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('href mode', () => {
    it('should render an <a> when href is set', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.detectChanges();
      const anchor = fixture.nativeElement.querySelector('a');
      const button = fixture.nativeElement.querySelector('button');
      expect(anchor).toBeTruthy();
      expect(button).toBeNull();
      expect(anchor.getAttribute('href')).toBe('https://truenas.com');
    });

    it('should drop href and expose aria-disabled when disabled', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.hasAttribute('href')).toBe(false);
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
      expect(anchor.getAttribute('tabindex')).toBe('-1');
    });

    it('should not emit onClick when disabled anchor is clicked', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const clickSpy = jest.fn();
      component.onClick.subscribe(clickSpy);
      const anchor = fixture.nativeElement.querySelector('a');
      anchor.click();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should emit onClick when enabled anchor is clicked', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.detectChanges();
      const clickSpy = jest.fn();
      component.onClick.subscribe(clickSpy);
      const anchor = fixture.nativeElement.querySelector('a');
      anchor.click();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('routerLink mode', () => {
    it('should render an <a> with href derived from routerLink', () => {
      fixture.componentRef.setInput('routerLink', ['/audit', 'settings']);
      fixture.detectChanges();
      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor).toBeTruthy();
      expect(anchor.getAttribute('href')).toBe('/audit/settings');
    });

    it('should prefer routerLink over href', () => {
      fixture.componentRef.setInput('href', 'https://example.com');
      fixture.componentRef.setInput('routerLink', '/audit');
      fixture.detectChanges();
      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/audit');
    });
  });
});
