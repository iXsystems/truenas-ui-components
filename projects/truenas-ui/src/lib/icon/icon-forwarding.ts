/**
 * Marker interface for components that forward icon inputs to `<tn-icon>`.
 *
 * When a component implements this interface, the sprite generation scanner
 * will read its template to discover which inputs map to `<tn-icon>` `[name]`
 * and `[library]` bindings, then scan consumer templates for those attributes.
 *
 * This means icons passed as template attributes to these components are
 * automatically included in the sprite — no `tnIconMarker()` needed.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'tn-empty',
 *   templateUrl: './empty.component.html',
 * })
 * export class TnEmptyComponent implements TnIconForwardingComponent {
 *   icon = input<string>();
 *   iconLibrary = input<IconLibraryType>('mdi');
 * }
 * ```
 *
 * The scanner will detect that `tn-empty` forwards `icon` to `<tn-icon [name]>`,
 * so `<tn-empty icon="inbox">` in consumer templates will automatically include
 * `mdi-inbox` in the sprite.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TnIconForwardingComponent {}
