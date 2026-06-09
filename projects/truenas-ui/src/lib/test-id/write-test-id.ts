import type { Renderer2 } from '@angular/core';

/**
 * Apply a composed test-id string to `element`'s `attrName`, removing the
 * attribute entirely when `composed` is empty (avoids `attr=""`).
 *
 * Shared by {@link TnTestIdDirective} and by components that must write the
 * attribute imperatively because they also read their base back — notably
 * `tn-table-pager`, where injecting a host directive to read its input signal
 * is unreliable in the AOT-linked package build. Centralizing the set/remove
 * branch keeps those write semantics in one place so they can't drift.
 */
export function writeTestId(
  renderer: Renderer2,
  element: Element,
  attrName: string,
  composed: string,
): void {
  if (composed) {
    renderer.setAttribute(element, attrName, composed);
  } else {
    renderer.removeAttribute(element, attrName);
  }
}
