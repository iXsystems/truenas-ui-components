import { CdkMenu } from '@angular/cdk/menu';
import type { AfterContentInit } from '@angular/core';
import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Activates CDK menu hover-to-open behavior — and keyboard focus entry — for a
 * root menu opened via a custom overlay instead of CDK's own `CdkMenuTrigger`.
 *
 * CDK's hover-to-open for submenu triggers is guarded by `!menuStack.isEmpty()`.
 * When a `CdkMenu` is opened via `TnMenuTriggerDirective` (custom overlay)
 * rather than `CdkMenuTrigger`, the menu is considered "inline" and doesn't
 * register with the stack, disabling hover for its submenu triggers and leaving
 * keyboard focus outside the panel.
 *
 * This directive pushes that root menu onto its own stack and moves focus to
 * the first (or selected) item so arrow-key navigation works immediately.
 * Submenus — opened by `CdkMenuTrigger` — already push themselves and are
 * focused by CDK, so for them this directive only installs the skip-disabled
 * predicate and otherwise stays out of the way.
 */
@Directive({
  selector: '[tnMenuActivateHover]',
  standalone: true,
})
export class TnMenuActivateHoverDirective implements AfterContentInit {
  private cdkMenu = inject(CdkMenu);
  private elementRef = inject(ElementRef<HTMLElement>);

  ngAfterContentInit(): void {
    // A root inline menu (opened via our custom overlay, not CdkMenuTrigger)
    // hasn't been pushed onto the stack yet. Submenus opened by CdkMenuTrigger
    // push themselves in CdkMenuBase.ngAfterContentInit, so the stack is already
    // non-empty by the time this runs for them — which is how we tell the two
    // apart without reaching for more CDK internals.
    const stack = this.cdkMenu.menuStack;
    const isRootInline = stack.isEmpty();
    if (isRootInline) {
      stack.push(this.cdkMenu);
    }

    // CdkMenu installs its FocusKeyManager with `.skipPredicate(() => false)`,
    // which deliberately makes ArrowUp/Down stop on disabled items so screen
    // readers can announce them. We want the more common app-menu behavior of
    // skipping disabled entries entirely (matches what mat-menu users expect),
    // so we override the predicate after CdkMenu's own ngAfterContentInit has
    // run. Skip-by-disabled also fixes the "first ArrowDown is a no-op when
    // item #2 is disabled" symptom — without it the manager visits the
    // disabled entry on press #1 and only advances on press #2.
    //
    // `keyManager` is `protected` on CdkMenuBase; reach in deliberately. If
    // CDK ever renames/restructures it, the optional-chain below degrades to
    // "disabled items aren't skipped" rather than a runtime crash. The CDK
    // guard test (menu.component.spec) will turn red so we notice and adapt.
    type WithKeyManager = {
      keyManager?: {
        skipPredicate?: (fn: (item: { disabled: boolean }) => boolean) => unknown;
        setActiveItem?: (index: number) => void;
      };
    };
    const km = (this.cdkMenu as unknown as WithKeyManager).keyManager;
    km?.skipPredicate?.((item) => item.disabled);

    // Only the root inline menu needs manual focus entry. CdkMenuTrigger already
    // focuses the first item of any submenu it opens, so we must not fight it.
    if (!isRootInline) {
      return;
    }

    // Prefer the marked "selected" item when one exists — matches user
    // expectation for option pickers (export format, sort key, etc.) where
    // reopening the menu should land focus on the current choice, not always
    // the first entry. Falls back to the first enabled item.
    const host = this.elementRef.nativeElement as HTMLElement;
    const items: HTMLElement[] = Array.from(
      host.querySelectorAll('[cdkMenuItem]'),
    ) as HTMLElement[];
    const selectedIndex = items.findIndex(
      (el: HTMLElement) => el.classList.contains('tn-menu-item--selected') && !el.hasAttribute('disabled'),
    );
    const selectedItem: HTMLElement | undefined = selectedIndex >= 0 ? items[selectedIndex] : undefined;
    if (selectedItem && km?.setActiveItem) {
      km.setActiveItem(selectedIndex);
      selectedItem.focus();
    } else {
      // Set the active index to the first enabled item so the next ArrowDown
      // advances correctly (instead of being a no-op while the manager "catches
      // up" to where DOM focus already is).
      this.cdkMenu.focusFirstItem('keyboard');
    }
  }
}
