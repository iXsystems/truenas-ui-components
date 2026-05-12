import {
  Directive,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';
import { TN_TEST_ATTR } from './test-attr.token';

/**
 * Primitive directive that writes a raw `testId` value to whichever attribute name has been
 * configured via {@link TN_TEST_ATTR} (default `data-testid`).
 *
 * Library components should use this directive instead of hard-coding `[attr.data-testid]` so
 * the attribute name remains centrally controlled and consumers with different conventions
 * (e.g. `data-test`) can opt in with a single root-level provider.
 *
 * @example
 * ```html
 * <button [tnTestId]="myTestId()">Click me</button>
 * ```
 *
 * Passing `null` / `undefined` / `''` removes the attribute entirely (avoids `data-testid=""`).
 */
@Directive({
  selector: '[tnTestId]',
  standalone: true,
})
export class TnTestIdDirective {
  private readonly renderer = inject(Renderer2);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly attrName = inject(TN_TEST_ATTR);

  /** The raw test-id value to apply. Falsy values remove the attribute. */
  readonly testId = input<string | null | undefined>(undefined, { alias: 'tnTestId' });

  constructor() {
    effect(() => {
      const value = this.testId();
      const element = this.host.nativeElement;
      if (value) {
        this.renderer.setAttribute(element, this.attrName, value);
      } else {
        this.renderer.removeAttribute(element, this.attrName);
      }
    });
  }
}
