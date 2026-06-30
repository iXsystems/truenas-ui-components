import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';
import { composeTestId, type TnTestIdValue } from './compose-test-id';
import { TN_TEST_ATTR } from './test-attr.token';
import { writeTestId } from './write-test-id';

/**
 * Writes a composed `testId` value to whichever attribute name is configured via
 * {@link TN_TEST_ATTR} (default `data-testid`).
 *
 * The library owns the whole id: the consumer passes only the *semantic* base
 * (`tnTestId`), the component declares its element type (`tnTestIdType`), and
 * this directive assembles `${type}-${base}` (kebab-cased, see
 * {@link composeTestId}). When no `tnTestIdType` is set the value is written
 * verbatim, so existing call sites are unaffected.
 *
 * Form controls derive an unset base from the bound control's name via
 * {@link controlTestId} before passing it here, so a control stays targetable by
 * automation without the consumer repeating the name as a `testId`.
 *
 * @example
 * ```html
 * <!-- component-owned prefix: emits data-testid="button-save" -->
 * <button [tnTestId]="'save'" tnTestIdType="button">Save</button>
 *
 * <!-- array base scopes a dynamic child: emits data-testid="option-username-jane-doe" -->
 * <li [tnTestId]="['username', option.label]" tnTestIdType="option"></li>
 *
 * <!-- no type: written verbatim (legacy behavior) -->
 * <button [tnTestId]="myTestId()">Click me</button>
 * ```
 *
 * Falsy / empty results remove the attribute entirely (avoids `data-testid=""`).
 */
@Directive({
  selector: '[tnTestId]',
  standalone: true,
})
export class TnTestIdDirective {
  private readonly renderer = inject(Renderer2);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly attrName = inject(TN_TEST_ATTR);

  /** The semantic base value (token or ordered segments). Falsy parts are dropped. */
  readonly testId = input<TnTestIdValue>(undefined, { alias: 'tnTestId' });

  /**
   * Element-type prefix the component declares (e.g. `'button'`, `'option'`).
   * Omit to write the base verbatim with no prefix.
   */
  readonly tnTestIdType = input<string | null | undefined>(undefined);

  constructor() {
    effect(() => {
      const composed = composeTestId(this.tnTestIdType(), this.testId());
      writeTestId(this.renderer, this.host.nativeElement, this.attrName, composed);
    });
  }
}
