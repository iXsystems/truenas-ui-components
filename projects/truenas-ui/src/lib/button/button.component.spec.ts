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

  describe('type', () => {
    it('defaults to type="button" so it never submits an enclosing form by accident', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('type')).toBe('button');
    });

    it('renders type="submit" when requested', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('type')).toBe('submit');
    });

    it('submits an enclosing form when a submit-typed button is clicked', () => {
      const form = document.createElement('form');
      form.appendChild(fixture.nativeElement);
      document.body.appendChild(form);
      const submitSpy = jest.fn((event: Event) => event.preventDefault());
      form.addEventListener('submit', submitSpy);

      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button').click();

      expect(submitSpy).toHaveBeenCalledTimes(1);
      form.remove();
    });
  });

  describe('icon', () => {
    it('renders no icon by default', () => {
      const icon = fixture.nativeElement.querySelector('tn-icon');
      expect(icon).toBeNull();
      expect(component.classes()).not.toContain('storybook-button--has-icon');
    });

    it('renders a tn-icon with the given name when icon is set', () => {
      fixture.componentRef.setInput('icon', 'check');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('tn-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('check');
    });

    it('marks the icon as aria-hidden so its name does not leak into the button accessible name', () => {
      fixture.componentRef.setInput('icon', 'check');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('tn-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });

    it('adds the has-icon class when an icon is present', () => {
      fixture.componentRef.setInput('icon', 'check');
      fixture.detectChanges();
      expect(component.classes()).toContain('storybook-button--has-icon');
    });

    it('renders the icon before the label by default (left)', () => {
      fixture.componentRef.setInput('icon', 'check');
      fixture.componentRef.setInput('label', 'Save');
      fixture.detectChanges();
      const children = Array.from(fixture.nativeElement.querySelector('button').children);
      const iconIndex = children.findIndex((el) => (el as Element).tagName.toLowerCase() === 'tn-icon');
      const labelIndex = children.findIndex((el) => (el as Element).classList.contains('storybook-button__label'));
      expect(iconIndex).toBeGreaterThanOrEqual(0);
      expect(iconIndex).toBeLessThan(labelIndex);
    });

    it('renders the icon after the label when iconPosition is right', () => {
      fixture.componentRef.setInput('icon', 'check');
      fixture.componentRef.setInput('iconPosition', 'right');
      fixture.componentRef.setInput('label', 'Save');
      fixture.detectChanges();
      const children = Array.from(fixture.nativeElement.querySelector('button').children);
      const iconIndex = children.findIndex((el) => (el as Element).tagName.toLowerCase() === 'tn-icon');
      const labelIndex = children.findIndex((el) => (el as Element).classList.contains('storybook-button__label'));
      expect(iconIndex).toBeGreaterThan(labelIndex);
    });

    it('renders the icon in anchor (href) mode too', () => {
      fixture.componentRef.setInput('href', 'https://truenas.com');
      fixture.componentRef.setInput('icon', 'open-in-new');
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('a tn-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('open-in-new');
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
