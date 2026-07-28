import type { ElementRef, Injector } from '@angular/core';
import { afterNextRender } from '@angular/core';

/** The cell holding the grid's roving tabindex — the one cell focus belongs on. */
const ACTIVE_CELL = '.tn-calendar-body-cell[tabindex="0"]';

/**
 * Follows the roving tabindex with real focus, once the grid it names has rendered.
 *
 * Two situations need it, and both leave focus somewhere wrong until it runs. Arrowing
 * within a grid re-renders cells that persist as elements, so the browser keeps focus on
 * the cell just left. Switching between the day and year grids destroys the cell that
 * was focused outright, which drops focus to `<body>` and restarts the tab order.
 *
 * Tied to the render rather than a zero timeout: the target cell doesn't exist until the
 * new grid is painted.
 *
 * Does nothing when no cell can take focus — a month or page with every day disabled has
 * nothing worth focusing.
 */
export function focusActiveCellAfterRender(host: ElementRef<HTMLElement>, injector: Injector): void {
  afterNextRender(() => {
    host.nativeElement.querySelector<HTMLButtonElement>(ACTIVE_CELL)?.focus();
  }, { injector });
}
