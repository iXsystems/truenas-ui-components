import { Directive } from '@angular/core';

/**
 * Marks an `<ng-template>` whose content is rendered as the card's footer actions,
 * bottom-right in the footer after any declarative `secondaryAction`/`primaryAction`
 * buttons. The template's root nodes become direct children of the footer's flex row,
 * so projected `<tn-button>`s sit and align exactly like the declarative ones — pass
 * bare buttons, no wrapper or styling required.
 *
 * Reach for this only when an action needs markup the declarative `TnCardAction` config
 * can't express — most commonly a permission-gated button wrapped in a structural
 * directive. Because the content renders via `ngTemplateOutlet` in the consumer's
 * context (not light-DOM projection), structural directives like `*ixRequiresRoles`
 * work directly on the button with no wrapper element:
 *
 * @example
 * ```html
 * <tn-card>
 *   <ng-template tnCardFooterActions>
 *     <tn-button *ixRequiresRoles="roles" label="Add" (click)="add()" />
 *   </ng-template>
 * </tn-card>
 * ```
 */
@Directive({
  selector: 'ng-template[tnCardFooterActions]',
  standalone: true,
})
export class TnCardFooterActionsDirective {}

/**
 * Marks an `<ng-template>` whose content is rendered as the card's header actions,
 * top-right in the header between the header control and the kebab menu. Use it for
 * header controls the declarative `headerControl`/`headerMenu` config can't express —
 * e.g. a permission-gated slide toggle. Same template-outlet semantics (and structural
 * directive support) as {@link TnCardFooterActionsDirective}.
 *
 * @example
 * ```html
 * <tn-card title="Shares">
 *   <ng-template tnCardHeaderActions>
 *     <tn-slide-toggle *ixRequiresRoles="roles" [checked]="running()" />
 *   </ng-template>
 * </tn-card>
 * ```
 */
@Directive({
  selector: 'ng-template[tnCardHeaderActions]',
  standalone: true,
})
export class TnCardHeaderActionsDirective {}
