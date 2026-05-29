import { CommonModule } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, computed, inject, input, output, viewChild } from '@angular/core';
import type { IconSize, IconLibraryType } from '../icon/icon.component';
import { TnIconComponent } from '../icon/icon.component';
import { TnTestIdDirective } from '../test-id';
import type { TooltipPosition } from '../tooltip/tooltip.directive';
import { TnTooltipDirective } from '../tooltip/tooltip.directive';

@Component({
  selector: 'tn-icon-button',
  standalone: true,
  imports: [CommonModule, TnIconComponent, TnTestIdDirective, TnTooltipDirective],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class TnIconButtonComponent implements AfterViewInit {
  // Button-related inputs
  disabled = input<boolean>(false);
  /** Compact variant with reduced padding, for dense contexts like toolbars. */
  dense = input<boolean>(false);
  ariaLabel = input<string | undefined>(undefined);
  /** Reflects an expanded/collapsed state (e.g. toggling a panel) onto the inner button. */
  ariaExpanded = input<boolean | undefined>(undefined);
  /**
   * Test-id applied to the rendered `<button>` element. Rendered under whichever attribute
   * name is configured via `TN_TEST_ATTR` (default `data-testid`).
   */
  testId = input<string | undefined>(undefined);

  // Icon-related inputs
  name = input<string>('');
  size = input<IconSize>('md');
  color = input<string | undefined>(undefined);
  tooltip = input<string | undefined>(undefined);
  /** Position of the styled tooltip relative to the button. */
  tooltipPosition = input<TooltipPosition>('above');
  library = input<IconLibraryType | undefined>(undefined);
  /** Extra class(es) applied to the inner icon, e.g. for animations or state colors. */
  iconClass = input<string>('');

  onClick = output<MouseEvent>();

  private hostRef = inject(ElementRef<HTMLElement>);
  private buttonRef = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  classes = computed(() => {
    const result = ['tn-icon-button'];
    if (this.color()) {result.push('tn-icon-button--custom-color');}
    if (this.dense()) {result.push('tn-icon-button--dense');}
    return result;
  });

  effectiveAriaLabel = computed(() => {
    return this.ariaLabel() || this.name() || 'Icon button';
  });

  /**
   * Focuses the inner native `<button>`. Exposed as a public method so callers
   * with a `TnIconButtonComponent` reference (e.g. `@ViewChild`) can focus it
   * without reaching into the DOM themselves.
   */
  focus(options?: FocusOptions): void {
    this.buttonRef().nativeElement.focus(options);
  }

  ngAfterViewInit(): void {
    // Make `host.focus()` delegate to the inner `<button>`. Triggers that take
    // an element ref and call `.focus()` on it (MatMenuTrigger restores focus
    // this way; CDK A11y FocusMonitor also uses raw `.focus()`) target the
    // host custom element, which isn't focusable on its own — so without this
    // override the focus call silently no-ops and users see the focus ring
    // disappear after a menu closes. Forwarding to the inner button keeps the
    // public DOM API behaving like a native button.
    //
    // Intentionally per-instance, not on the prototype: each host owns its own
    // inner button ref. We don't restore the original `focus` on destroy
    // because the host element is destroyed at the same time.
    //
    // If this component is ever moved to `ViewEncapsulation.ShadowDom`, drop
    // this override and rely on the shadow root's `delegatesFocus: true`
    // option, which is the platform-native equivalent.
    const host = this.hostRef.nativeElement as HTMLElement;
    const inner = this.buttonRef().nativeElement;
    host.focus = (options?: FocusOptions) => inner.focus(options);
  }
}
