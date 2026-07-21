import type { AfterViewInit } from '@angular/core';
import { Component, ElementRef, inject, signal } from '@angular/core';

/**
 * Storybook docs helper for "Test IDs" stories.
 *
 * Renders whatever is projected into it, then lists the test-id attributes the
 * library actually emitted on the rendered DOM. Reading from the live DOM keeps
 * the documented ids honest — they can't drift from the source.
 *
 * Usage: wrap a component in a story's `render` template:
 * ```html
 * <tn-testid-inspector>
 *   <tn-button testId="save" label="Save" />
 * </tn-testid-inspector>
 * ```
 *
 * Caveat: it only sees ids in its own DOM subtree. Ids rendered into a CDK
 * overlay (select/menu/autocomplete/dialog options & items) are portaled to
 * `document.body` and won't appear in the table until that surface is open —
 * document those in the story's prose instead, or open the overlay in a `play`.
 */
@Component({
  selector: 'tn-testid-inspector',
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <div #scope><ng-content /></div>
    @if (rows().length) {
      <table class="tn-testid-doc" style="margin-top:16px;border-collapse:collapse;font:13px/1.5 monospace;">
        <thead>
          <tr>
            <th style="text-align:left;padding:4px 12px;border-bottom:1px solid #ccc;">element</th>
            <th style="text-align:left;padding:4px 12px;border-bottom:1px solid #ccc;">attribute</th>
            <th style="text-align:left;padding:4px 12px;border-bottom:1px solid #ccc;">emitted id</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.id) {
            <tr>
              <td style="padding:4px 12px;">&lt;{{ row.element }}&gt;</td>
              <td style="padding:4px 12px;">{{ row.attribute }}</td>
              <td style="padding:4px 12px;"><strong>{{ row.id }}</strong></td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class TestIdInspectorComponent implements AfterViewInit {
  protected readonly rows = signal<{ element: string; attribute: string; id: string }[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    // Defer one tick so the directive's attribute-writing effects have flushed.
    setTimeout(() => {
      const els = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('[data-testid],[data-test]'));
      this.rows.set(
        els.map((el) => {
          const attribute = el.hasAttribute('data-testid') ? 'data-testid' : 'data-test';
          return { element: el.tagName.toLowerCase(), attribute, id: el.getAttribute(attribute) ?? '' };
        }),
      );
    });
  }
}
