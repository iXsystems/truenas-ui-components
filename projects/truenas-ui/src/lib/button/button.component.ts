import { CommonModule } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TnTestIdDirective } from '../test-id';

@Component({
  selector: 'tn-button',
  standalone: true,
  imports: [CommonModule, RouterLink, TnTestIdDirective],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class TnButtonComponent implements AfterViewInit {
  size = 'large';

  primary = input<boolean>(false);
  color = input<'primary' | 'secondary' | 'warn' | 'default'>('default');
  variant = input<'filled' | 'outline'>('filled');
  backgroundColor = input<string | undefined>(undefined);
  label = input<string>('Button');
  disabled = input<boolean>(false);
  /**
   * Test-id applied to the rendered element. Rendered under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<string | undefined>(undefined);

  /**
   * Renders the button as an `<a>` with a plain `href` attribute.
   * Mutually exclusive with `routerLink` — if both are provided, `routerLink` wins.
   */
  href = input<string | undefined>(undefined);
  /**
   * Renders the button as an `<a>` driven by Angular Router. Accepts the same
   * shapes as `[routerLink]` (`string | any[]`).
   */
  routerLink = input<string | unknown[] | undefined>(undefined);
  queryParams = input<Record<string, unknown> | undefined>(undefined);
  fragment = input<string | undefined>(undefined);
  target = input<string | undefined>(undefined);
  rel = input<string | undefined>(undefined);
  /**
   * Accessible label for the rendered element. Mirrors `aria-label`; useful when
   * the visible label alone is insufficient (e.g. icon-only links).
   */
  ariaLabel = input<string | undefined>(undefined);

  onClick = output<MouseEvent>();

  isAnchor = computed(() => this.routerLink() !== undefined || this.href() !== undefined);
  isRouterLink = computed(() => this.routerLink() !== undefined);

  classes = computed(() => {
    // Support both primary boolean and color string approaches
    const isPrimary = this.primary() || this.color() === 'primary';
    const isWarn = this.color() === 'warn';

    let mode = '';
    if (this.variant() === 'outline') {
      if (isPrimary) {
        mode = 'button-outline-primary';
      } else if (isWarn) {
        mode = 'button-outline-warn';
      } else {
        mode = 'button-outline-default';
      }
    } else {
      if (isPrimary) {
        mode = 'button-primary';
      } else if (isWarn) {
        mode = 'button-warn';
      } else {
        mode = 'button-default';
      }
    }

    return ['storybook-button', `storybook-button--${this.size}`, mode];
  });

  handleAnchorClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.onClick.emit(event);
  }

  private hostRef = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    // The wrapped <button>/<a> is natively focusable. If a consumer also places
    // the <tn-button> host into the tab order (commonly `tabindex="0"` for
    // card-style focus management), both elements become tab stops — the user
    // perceives a "double focus" on the same logical button.
    //
    // Forward any tabindex set on the host to the inner element and clear it
    // from the host, so the button is a single tab stop with the focus ring
    // landing on the styled inner element (the host has no visual styling).
    // Also delegate `host.focus()` to the inner element so callers holding a
    // ref to the host (FocusMonitor, MatMenuTrigger restore, etc.) focus
    // something visible — same pattern used in TnIconButtonComponent.
    const host = this.hostRef.nativeElement as HTMLElement;
    const inner = host.querySelector(':scope > button, :scope > a') as HTMLElement | null;
    if (!inner) {return;}

    if (host.hasAttribute('tabindex')) {
      const ti = host.getAttribute('tabindex');
      if (ti !== null) {inner.setAttribute('tabindex', ti);}
      host.removeAttribute('tabindex');
    }

    host.focus = (options?: FocusOptions) => inner.focus(options);
  }
}
