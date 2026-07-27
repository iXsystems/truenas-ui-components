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
