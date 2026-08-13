import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TnTooltipComponent } from './tooltip.component';

function createTooltip(message: string) {
  const fixture = TestBed.createComponent(TnTooltipComponent);
  fixture.componentRef.setInput('message', message);
  fixture.detectChanges();
  return fixture;
}

describe('TnTooltipComponent HTML rendering', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TnTooltipComponent] });
  });

  it('renders HTML markup in the message', () => {
    const fixture = createTooltip('<b>Online</b> &mdash; <i>healthy</i>');
    const tooltip = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(tooltip.querySelector('b')?.textContent).toBe('Online');
    expect(tooltip.querySelector('i')?.textContent).toBe('healthy');
  });

  it('renders <br> line breaks', () => {
    const fixture = createTooltip('Line 1<br>Line 2');
    const tooltip = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(tooltip.querySelector('br')).toBeTruthy();
  });

  it('strips <script> tags via Angular sanitization', () => {
    const fixture = createTooltip("Safe <script>alert('xss')</script> text");
    const tooltip = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(tooltip.querySelector('script')).toBeNull();
    expect(tooltip.innerHTML).not.toContain('<script');
    expect(tooltip.textContent).toContain('Safe');
  });

  it('strips inline event handlers via Angular sanitization', () => {
    const fixture = createTooltip('<img src="x" onerror="alert(1)">');
    const tooltip = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(tooltip.querySelector('img')?.getAttribute('onerror')).toBeNull();
  });

  it('renders plain text safely', () => {
    const fixture = createTooltip('Just plain text');
    const tooltip = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(tooltip.textContent?.trim()).toBe('Just plain text');
  });
});

describe('TnTooltipComponent sticky mode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TnTooltipComponent],
      // The dismiss button renders a tn-icon, which loads the sprite config over HTTP.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  function createStickyTooltip() {
    const fixture = TestBed.createComponent(TnTooltipComponent);
    fixture.componentRef.setInput('message', 'Pinned message');
    fixture.componentRef.setInput('sticky', true);
    fixture.detectChanges();
    return fixture;
  }

  it('renders no dismiss button outside sticky mode', () => {
    const fixture = createTooltip('Hover message');

    expect(fixture.nativeElement.querySelector('.tn-tooltip__close')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).classList).not.toContain('tn-tooltip-component--sticky');
  });

  it('renders a labelled dismiss button in sticky mode', () => {
    const fixture = createStickyTooltip();
    const close = fixture.nativeElement.querySelector('.tn-tooltip__close') as HTMLButtonElement;

    expect(close).not.toBeNull();
    expect(close.type).toBe('button');
    expect(close.getAttribute('aria-label')).toBe('Close tooltip');
    expect((fixture.nativeElement as HTMLElement).classList).toContain('tn-tooltip-component--sticky');
  });

  it('lets the dismiss button label be localized', () => {
    const fixture = createStickyTooltip();
    fixture.componentRef.setInput('closeAriaLabel', 'Cerrar');
    fixture.detectChanges();
    const close = fixture.nativeElement.querySelector('.tn-tooltip__close') as HTMLButtonElement;

    expect(close.getAttribute('aria-label')).toBe('Cerrar');
  });

  it('emits onDismiss when the dismiss button is clicked', () => {
    const fixture = createStickyTooltip();
    const dismissed = jest.fn();
    fixture.componentInstance.onDismiss.subscribe(dismissed);

    (fixture.nativeElement.querySelector('.tn-tooltip__close') as HTMLButtonElement).click();

    expect(dismissed).toHaveBeenCalledTimes(1);
  });

  it('focuses the dismiss button on request', () => {
    const fixture = createStickyTooltip();
    document.body.appendChild(fixture.nativeElement);

    fixture.componentInstance.focusCloseButton();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.tn-tooltip__close'));
    fixture.nativeElement.remove();
  });

  it('keeps the message readable when the dismiss button is present', () => {
    const fixture = createStickyTooltip();
    const message = fixture.nativeElement.querySelector('.tn-tooltip__message') as HTMLElement;

    expect(message.textContent?.trim()).toBe('Pinned message');
  });
});
