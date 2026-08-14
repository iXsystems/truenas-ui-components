import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  // Typed loosely on purpose: real consumers bind expressions like `reason ?? null`,
  // which deliver null despite the input's string type.
  message: string | null = null;
}

describe('TnTooltipDirective null message tolerance', () => {
  it('tolerates a null message binding without throwing and adds no description', () => {
    TestBed.configureTestingModule({ imports: [NullMessageHostComponent] });
    const fixture = TestBed.createComponent(NullMessageHostComponent);

    expect(() => fixture.detectChanges()).not.toThrow();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.null-host');
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
