import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TnIconButtonComponent } from './icon-button.component';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';

describe('TnIconButtonComponent', () => {
  let component: TnIconButtonComponent;
  let fixture: ComponentFixture<TnIconButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnIconButtonComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TnIconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('testId (library owns the element-type prefix)', () => {
    it('prepends "button-" to the semantic base on the inner button', () => {
      fixture.componentRef.setInput('testId', 'first-page');
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button') as HTMLElement;
      expect(button.getAttribute('data-testid')).toBe('button-first-page');
    });

    it('emits NO test-id attribute when testId is unset', () => {
      const button = fixture.nativeElement.querySelector('button') as HTMLElement;
      expect(button.hasAttribute('data-testid')).toBe(false);
    });
  });

  describe('focus delegation', () => {
    it('forwards host.focus() to the inner native <button>', () => {
      // External triggers (MatMenuTrigger, CDK FocusMonitor, etc.) call .focus()
      // on the component's host element. The host custom element isn't
      // focusable on its own, so without delegation the call would silently
      // no-op — observable as "focus disappears" after a menu closes.
      const host = fixture.nativeElement as HTMLElement;
      const inner = host.querySelector('button') as HTMLButtonElement;

      host.focus();

      expect(document.activeElement).toBe(inner);
    });

    it('component.focus() focuses the inner native <button>', () => {
      const host = fixture.nativeElement as HTMLElement;
      const inner = host.querySelector('button') as HTMLButtonElement;

      component.focus();

      expect(document.activeElement).toBe(inner);
    });
  });

  it('should emit onClick event when clicked', () => {
    const clickSpy = jest.fn();
    component.onClick.subscribe(clickSpy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit onClick when disabled', () => {
    const clickSpy = jest.fn();
    component.onClick.subscribe(clickSpy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should render icon with correct properties', () => {
    fixture.componentRef.setInput('name', 'home');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('library', 'mdi');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('tn-icon');
    expect(icon).toBeTruthy();

    // Check component properties directly instead of DOM attributes
    expect(component.name()).toBe('home');
    expect(component.size()).toBe('lg');
    expect(component.library()).toBe('mdi');
  });

  it('should use aria-label when provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'Custom label');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Custom label');
  });

  it('should use name as fallback aria-label', () => {
    fixture.componentRef.setInput('name', 'settings');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('settings');
  });

  it('wires the tooltip into the styled tnTooltip directive', () => {
    fixture.componentRef.setInput('tooltip', 'Click me');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    // The styled tooltip is an overlay, not a native title attribute.
    expect(button.getAttribute('title')).toBeNull();

    const tooltip = fixture.debugElement.query(By.directive(TnTooltipDirective))
      .injector.get(TnTooltipDirective);
    expect(tooltip.message()).toBe('Click me');
  });

  // The flag is only worth re-exporting if it reaches the directive, and only observable through
  // a message that could be pinned in the first place - a plain label never is.
  describe('tooltipSticky', () => {
    const LINK_MESSAGE = 'Read the <a href="#docs">docs</a>';
    const button = () => fixture.nativeElement.querySelector('button') as HTMLElement;
    const panel = () => document.querySelector('.tn-tooltip');
    const closeButton = () => document.querySelector('.tn-tooltip__close');

    function settle(): void {
      jest.advanceTimersByTime(1);
      fixture.detectChanges();
    }

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
      fixture.destroy();
      jest.useRealTimers();
    });

    it('pins on click by default, so the link can be reached', () => {
      fixture.componentRef.setInput('tooltip', LINK_MESSAGE);
      fixture.detectChanges();

      button().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      settle();

      expect(panel()).not.toBeNull();
      expect(closeButton()).not.toBeNull();
    });

    it('forwards false, putting the same message back on hover', () => {
      fixture.componentRef.setInput('tooltip', LINK_MESSAGE);
      fixture.componentRef.setInput('tooltipSticky', false);
      fixture.detectChanges();

      button().dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      settle();
      expect(closeButton()).toBeNull();

      button().dispatchEvent(new MouseEvent('mouseenter'));
      settle();

      expect(panel()).not.toBeNull();
      expect(closeButton()).toBeNull();
    });
  });

  it('only sets aria-describedby when a tooltip is present', () => {
    const button = fixture.nativeElement.querySelector('button');
    // No tooltip → no dangling reference to an unrendered tooltip element.
    expect(button.getAttribute('aria-describedby')).toBeNull();

    fixture.componentRef.setInput('tooltip', 'Click me');
    fixture.detectChanges();

    expect(button.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('applies the dense modifier class when dense', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).not.toContain('tn-icon-button--dense');

    fixture.componentRef.setInput('dense', true);
    fixture.detectChanges();

    expect(button.classList).toContain('tn-icon-button--dense');
  });

  it('reflects aria-expanded onto the inner button', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBeNull();

    fixture.componentRef.setInput('ariaExpanded', true);
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
