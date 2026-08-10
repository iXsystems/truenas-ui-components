import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import type { Observable } from 'rxjs';
import type { TnTreeExpansion } from './tree-expansion.interface';

/**
 * Factory functions for creating tree controls without triggering deprecation warnings
 * in consuming code.
 *
 * ## Why we still use deprecated TreeControl classes
 *
 * Angular CDK deprecated TreeControl, FlatTreeControl, and NestedTreeControl in v19,
 * with plans to remove them in v21. However, a complete replacement API has not been
 * provided yet.
 *
 * ### The Problem with Current Migration Path
 *
 * The deprecation message suggests using `levelAccessor` or `childrenAccessor` on CdkTree,
 * but these are only for describing your data structure - they don't provide:
 *
 * 1. **Programmatic access to expansion state** - CdkTree's `_expansionModel` is private
 * 2. **Access to data nodes** - Needed for operations like `expandAll()`
 * 3. **Helper methods** - Like `getDescendants()`, `isExpandable()`, `getLevel()`
 * 4. **External expansion control** - Data sources need to react to expansion changes
 *
 * ### Our Solution: Centralized Technical Debt
 *
 * This file encapsulates ALL usage of deprecated TreeControl classes:
 *
 * - Consumers work with the `TnTreeExpansion` interface (not deprecated)
 * - When Angular provides a proper replacement API, only this file changes and the
 *   `TnTreeExpansion` interface stays stable, making the migration transparent
 *
 * @see https://github.com/angular/components/issues/29856 - GitHub issue discussing the migration gap
 */

/** Optional configuration for flat tree control */
export interface FlatTreeControlOptions<T, K> {
  trackBy?: (dataNode: T) => K;
}

/** Optional configuration for nested tree control */
export interface NestedTreeControlOptions<T, K> {
  isExpandable?: (dataNode: T) => boolean;
  trackBy?: (dataNode: T) => K;
}

/**
 * Creates a flat tree control for managing expansion state of flat tree structures.
 *
 * @param getLevel - Function that returns the level/depth of a node
 * @param isExpandable - Function that returns whether a node can be expanded
 * @param options - Optional configuration including trackBy function
 * @returns TnTreeExpansion instance for managing tree state
 *
 * @example
 * ```ts
 * const treeControl = createFlatTreeControl<DatasetDetails, string>(
 *   (dataset) => (dataset?.name?.split('/')?.length || 0) - 1,
 *   (dataset) => Number(dataset?.children?.length) > 0,
 *   { trackBy: (dataset) => dataset.id }
 * );
 * ```
 */
export function createFlatTreeControl<T, K = T>(
  getLevel: (dataNode: T) => number,
  isExpandable: (dataNode: T) => boolean,
  options?: FlatTreeControlOptions<T, K>,
): TnTreeExpansion<T, K> {
  return new FlatTreeControl<T, K>(getLevel, isExpandable, options);
}

/**
 * Creates a nested tree control for managing expansion state of nested tree structures.
 *
 * @param getChildren - Function that returns the children of a node
 * @param options - Optional configuration including isExpandable and trackBy functions
 * @returns TnTreeExpansion instance for managing tree state
 *
 * @example
 * ```ts
 * const treeControl = createNestedTreeControl<VDevNode, string>(
 *   (vdev) => vdev.children,
 *   { trackBy: (vdev) => vdev.guid }
 * );
 * ```
 */
export function createNestedTreeControl<T, K = T>(
  getChildren: (dataNode: T) => Observable<T[]> | T[] | undefined | null,
  options?: NestedTreeControlOptions<T, K>,
): TnTreeExpansion<T, K> {
  // NestedTreeControl leaves `isExpandable` undefined unless provided, which
  // reads as "every node is a leaf" — default it from getChildren (sync arrays).
  const isExpandable = options?.isExpandable
    ?? ((dataNode: T): boolean => {
      const children = getChildren(dataNode);
      return Array.isArray(children) && children.length > 0;
    });
  return new NestedTreeControl<T, K>(getChildren, { ...options, isExpandable });
}
