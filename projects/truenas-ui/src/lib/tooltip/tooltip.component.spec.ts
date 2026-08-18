import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { hasInteractiveContent } from './interactive-content';
import { TnTooltipComponent } from './tooltip.component';
import { TnTooltipDirective } from './tooltip.directive';

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

  it('focuses the panel on request, so Tab reaches the message before the dismiss button', () => {
    const fixture = createStickyTooltip();
    document.body.appendChild(fixture.nativeElement);

    fixture.componentInstance.focusPanel();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.tn-tooltip'));
    fixture.nativeElement.remove();
  });

  it('makes the panel focusable only in sticky mode', () => {
    const hoverFixture = createTooltip('Hover message');
    expect((hoverFixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement).hasAttribute('tabindex')).toBe(false);

    const stickyFixture = createStickyTooltip();
    expect((stickyFixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement).getAttribute('tabindex')).toBe('-1');
  });

  // ARIA's `tooltip` role is non-focusable, non-interactive content, so a screen reader may
  // flatten a pinned panel to a text description and never expose the link or the dismiss button -
  // the very things pinning exists to make reachable.
  it('becomes a labelled dialog once pinned, so its content is exposed to assistive tech', () => {
    const fixture = createStickyTooltip();
    fixture.componentRef.setInput('id', 'tn-tooltip-abc');
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-labelledby')).toBe('tn-tooltip-abc-message');
    expect(fixture.nativeElement.querySelector('#tn-tooltip-abc-message')).not.toBeNull();
  });

  it('stays a plain tooltip while it is only shown on hover', () => {
    const panel = createTooltip('Hover message').nativeElement.querySelector('.tn-tooltip') as HTMLElement;

    expect(panel.getAttribute('role')).toBe('tooltip');
    expect(panel.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('keeps the message readable when the dismiss button is present', () => {
    const fixture = createStickyTooltip();
    const message = fixture.nativeElement.querySelector('.tn-tooltip__message') as HTMLElement;

    expect(message.textContent?.trim()).toBe('Pinned message');
  });
});

describe('hasInteractiveContent', () => {
  it('detects a link, which is what makes a tooltip worth pinning', () => {
    expect(hasInteractiveContent('Token (<a href="https://example.com">Instructions</a>)')).toBe(true);
  });

  it.each([
    ['<button type="button">Retry</button>'],
    ['<input type="text">'],
    ['<select><option>a</option></select>'],
    ['<textarea></textarea>'],
    ['<span tabindex="0">focusable</span>'],
  ])('detects other reachable content: %s', (message) => {
    expect(hasInteractiveContent(message)).toBe(true);
  });

  it('rejects plain help text, which is the overwhelming majority of tooltips', () => {
    expect(hasInteractiveContent('Customizes the importance of the alert.')).toBe(false);
  });

  it('rejects markup that is only formatting', () => {
    expect(hasInteractiveContent('<b>Online</b> &mdash; <i>healthy</i><br>Second line')).toBe(false);
  });

  it('rejects an anchor with no href, which is not a link the user can follow', () => {
    expect(hasInteractiveContent('<a>Not a link</a>')).toBe(false);
  });

  it('rejects an empty message', () => {
    expect(hasInteractiveContent('')).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<button class="interactive-host" tnTooltip="Button reason">Direct</button>
    <div class="wrapper" tnTooltip="Wrapper reason"><button>Only control</button></div>
    <div class="container" tnTooltip="Container reason"><button>First</button><button>Second</button></div>`,
})
class DescriptionHostComponent {}

@Component({
  standalone: true,
  imports: [TnTooltipDirective],
  template: `<button class="null-host" [tnTooltip]="message">Null message</button>`,
})
class NullMessageHostComponent {
  // Real consumers bind expressions like `reason ?? null` — the input accepts them
  // by contract (via its transform) and the runtime must treat them as "no tooltip".
  message: string | null | undefined = null;
}

describe('TnTooltipDirective nullish message tolerance', () => {
  function createNullHost() {
    TestBed.configureTestingModule({ imports: [NullMessageHostComponent] });
    return TestBed.createComponent(NullMessageHostComponent);
  }

  it('tolerates a null message binding without throwing and adds no description', () => {
    const fixture = createNullHost();

    expect(() => fixture.detectChanges()).not.toThrow();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.null-host');
    expect(button?.getAttribute('aria-describedby')).toBeNull();
  });

  it('treats an undefined message the same as no tooltip', () => {
    const fixture = createNullHost();
    fixture.componentInstance.message = undefined;

    expect(() => fixture.detectChanges()).not.toThrow();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.null-host');
    expect(button?.getAttribute('aria-describedby')).toBeNull();
  });

  it('removes an existing description when the message becomes null', () => {
    const fixture = createNullHost();
    fixture.componentInstance.message = 'Reason';
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.null-host');
    expect(button?.getAttribute('aria-describedby')).toBeTruthy();

    fixture.componentInstance.message = null;
    fixture.detectChanges();

    expect(button?.getAttribute('aria-describedby')).toBeNull();
  });
});

describe('TnTooltipDirective aria description targeting', () => {
  function createHosts() {
    TestBed.configureTestingModule({ imports: [DescriptionHostComponent] });
    const fixture = TestBed.createComponent(DescriptionHostComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function describedText(el: Element | null): string | null {
    const id = el?.getAttribute('aria-describedby');
    if (!id) {
      return null;
    }
    return document.getElementById(id.split(/\s+/)[0])?.textContent ?? null;
  }

  it('describes an interactive host directly', () => {
    const root = createHosts();
    expect(describedText(root.querySelector('.interactive-host'))).toBe('Button reason');
  });

  it('forwards the description to the single interactive descendant of a wrapper', () => {
    const root = createHosts();
    const wrapper = root.querySelector('.wrapper');

    expect(describedText(wrapper!.querySelector('button'))).toBe('Wrapper reason');
    expect(wrapper?.getAttribute('aria-describedby')).toBeNull();
  });

  it('keeps the description on a container host with several controls', () => {
    const root = createHosts();
    const container = root.querySelector('.container');

    // Forwarding would attach the reason to an arbitrary first control — with more
    // than one interactive descendant the description stays on the host itself.
    expect(describedText(container)).toBe('Container reason');
    for (const button of Array.from(container!.querySelectorAll('button'))) {
      expect(button.getAttribute('aria-describedby')).toBeNull();
    }
  });
});
