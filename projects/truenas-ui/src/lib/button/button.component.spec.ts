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

  describe('testId (library owns the element-type prefix)', () => {
    it('prepends "button-" to the semantic base on the inner button', () => {
      fixture.componentRef.setInput('testId', 'save');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('data-testid')).toBe('button-save');
    });

    it('prefixes the inner anchor too when rendered as a link', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.componentRef.setInput('testId', 'visit-forums');
      fixture.detectChanges();
      const anchor = fixture.nativeElement.querySelector('a');
      expect(anchor.getAttribute('data-testid')).toBe('button-visit-forums');
    });

    it('emits NO test-id attribute when testId is unset (type alone is never an id)', () => {
      // guards against every untagged button collapsing to data-testid="button"
      const button = fixture.nativeElement.querySelector('button');
      expect(button.hasAttribute('data-testid')).toBe(false);
      expect(button.hasAttribute('data-test')).toBe(false);
    });

    it('supports an array base for scoped ids', () => {
      fixture.componentRef.setInput('testId', ['service-status', 'smb']);
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('data-testid')).toBe('button-service-status-smb');
    });
  });

  describe('testId under the data-test convention (webui consumers)', () => {
    it('emits the same value under data-test when TN_TEST_ATTR is overridden', async () => {
      const { TN_TEST_ATTR } = await import('../test-id');
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TnButtonComponent],
        providers: [provideRouter([]), { provide: TN_TEST_ATTR, useValue: 'data-test' }],
      }).compileComponents();

      const local = TestBed.createComponent(TnButtonComponent);
      local.componentRef.setInput('testId', 'save');
      local.detectChanges();

      const button = local.nativeElement.querySelector('button');
      expect(button.getAttribute('data-test')).toBe('button-save');
      expect(button.getAttribute('data-testid')).toBeNull();
    });
  });
});
