import { Component } from '@angular/core';

/**
 * The flex row that lays a `tn-drawer` out beside a `tn-drawer-content`.
 *
 * WHY IT CARRIES NO ROLE, NO LANDMARK AND NO NAME (#214)
 * -----------------------------------------------------
 * #214 reported axe evaluating ZERO rules against this component, which is true
 * and is not a defect in it: the container renders `<ng-content />` and a
 * stylesheet, so scanned on its own there is nothing there to have a role. The
 * scan in the report was the childless case, the same way #204's turned out to
 * be a stepper with no steps.
 *
 * The surface a user perceives is `tn-drawer`, and that is where the model is
 * declared — `role="navigation"` in `side` mode, `role="dialog"` with
 * `aria-modal` and a focus trap in `over` mode. Giving the container a role of
 * its own would put a second, unnamed thing in the accessibility tree between a
 * listener and that surface, describing a layout box.
 *
 * `role="main"` on `tn-drawer-content` is the other tempting one, and it belongs
 * to the application rather than to this library: a page decides where its main
 * landmark is, and a component library that claims it makes two `main`s the
 * moment an app has its own.
 *
 * Guarded by `drawer-a11y.spec.ts`, which asserts the drawer inside the
 * container is what axe attributes its results to.
 */
@Component({
  selector: 'tn-drawer-container',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './drawer-container.component.scss',
})
export class TnDrawerContainerComponent {}
