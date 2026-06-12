import { CommonModule } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, computed, inject, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { LabelMarkupPipe } from '../pipes/label-markup/label-markup.pipe';
import { TnTestIdDirective, type TnTestIdValue } from '../test-id';

@Component({
  selector: 'tn-button',
  standalone: true,
  imports: [CommonModule, RouterLink, TnIconComponent, TnTestIdDirective, LabelMarkupPipe],
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
  /**
   * Name of an optional icon rendered alongside the label, resolved through
   * `tn-icon` (same names and libraries apply). The icon is decorative —
   * the visible `label` remains the accessible name.
   */
  icon = input<string | undefined>(undefined);
  /** Icon library the `icon` name belongs to. Mirrors `tn-icon`'s `library` input. */
  iconLibrary = input<IconLibraryType | undefined>(undefined);
  /** Which side of the label the icon renders on. */
  iconPosition = input<'start' | 'end'>('start');
  disabled = input<boolean>(false);
  /**
   * Native `type` of the rendered `<button>`. Defaults to `button` so stray
   * clicks never submit an enclosing form. Set to `submit` for a form's save
   * button — this is what makes pressing Enter in a form field fire the
   * form's `(submit)`/`(ngSubmit)` handler; a `(onClick)` binding alone does
   * not. Ignored in anchor mode (`href`/`routerLink`).
   */
  type = input<'button' | 'submit' | 'reset'>('button');
  /**
   * Semantic test-id base for the rendered element. The library prepends the
   * element type (`button`) and renders the result under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`) — e.g.
   * `testId="save"` → `button-save`. Accepts an array of segments to scope the
   * id (e.g. `[formControlName, 'submit']`).
   */
  testId = input<TnTestIdValue>(undefined);

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

    const classes = ['storybook-button', `storybook-button--${this.size}`, mode];
    if (this.icon()) {
      classes.push('storybook-button--with-icon');
      if (this.iconPosition() === 'end') {
        classes.push('storybook-button--icon-end');
      }
    }
    return classes;
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
  // The template renders exactly one of `<a [routerLink]>`, `<a [href]>`, or
  // `<button>` via `@if/@else`, and each carries the `#button` ref — so this
  // resolves to whichever variant is active. Using a viewChild instead of a
  // `:scope > button, :scope > a` querySelector keeps the wiring resilient if
  // the template ever wraps the inner element in an extra container.
  private innerRef = viewChild.required<ElementRef<HTMLElement>>('button');

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
    const inner = this.innerRef().nativeElement;

    if (host.hasAttribute('tabindex')) {
      const ti = host.getAttribute('tabindex');
      if (ti !== null) {inner.setAttribute('tabindex', ti);}
      host.removeAttribute('tabindex');
    }

    host.focus = (options?: FocusOptions) => inner.focus(options);
  }
}
