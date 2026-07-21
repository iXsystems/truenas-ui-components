import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, ElementRef, booleanAttribute, inject, input, signal } from '@angular/core';

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
 * By default it only sees ids in its own DOM subtree. Ids rendered into a CDK
 * overlay (select/menu/autocomplete/dialog/file-picker surfaces) are portaled
 * to `document.body` and never enter that subtree. Set `includeOverlay` for
 * stories whose ids live in such a surface:
 * ```html
 * <tn-testid-inspector includeOverlay>
 * ```
 * The table then re-scans on DOM mutations and appends whatever the overlay
 * container currently holds — open the overlay in the story canvas and its ids
 * appear live, marked `(overlay)`. The overlay container is shared per page,
 * so on an autodocs page the table reflects whichever overlay is open.
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
export class TestIdInspectorComponent implements AfterViewInit, OnDestroy {
  /**
   * Also list ids currently rendered in the CDK overlay container (portaled
   * surfaces: popups, dropdowns, dialogs), kept live via a MutationObserver.
   */
  readonly includeOverlay = input(false, { transform: booleanAttribute });

  protected readonly rows = signal<{ element: string; attribute: string; id: string }[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    // Defer one tick so the directive's attribute-writing effects have flushed.
    setTimeout(() => {
      this.scan();
      if (this.includeOverlay()) {
        // Overlay content appears/disappears outside Angular's view of this
        // component, so watch the document and re-scan. The scan is guarded
        // against no-op updates, which also keeps the observer from feeding
        // itself with the mutations of its own table re-render.
        this.observer = new MutationObserver(() => this.scan());
        this.observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-testid', 'data-test'] });
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private scan(): void {
    const collect = (root: ParentNode, suffix: string) =>
      Array.from(root.querySelectorAll<HTMLElement>('[data-testid],[data-test]')).map((el) => {
        const attribute = el.hasAttribute('data-testid') ? 'data-testid' : 'data-test';
        return { element: el.tagName.toLowerCase() + suffix, attribute, id: el.getAttribute(attribute) ?? '' };
      });

    const rows = collect(this.host.nativeElement, '');
    if (this.includeOverlay()) {
      const overlay = document.querySelector('.cdk-overlay-container');
      if (overlay) {
        rows.push(...collect(overlay, ' (overlay)'));
      }
    }
    // Update only on real changes so the observer doesn't loop on the
    // mutations caused by rendering the table itself.
    if (JSON.stringify(rows) !== JSON.stringify(this.rows())) {
      this.rows.set(rows);
    }
  }
}
