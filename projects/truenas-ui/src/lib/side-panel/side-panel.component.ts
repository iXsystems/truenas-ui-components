import { trigger, state, style, transition, animate } from '@angular/animations';
import type { AnimationEvent } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component, Directive, input, output, computed, effect, inject, contentChildren,
} from '@angular/core';
import { mdiClose } from '@mdi/js';
import { TnIconRegistryService } from '../icon/icon-registry.service';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';

/**
 * Directive to mark an element as a side-panel footer action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-button tnSidePanelAction label="Save" />
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelAction]',
  standalone: true,
})
export class TnSidePanelActionDirective {}

/**
 * Directive to mark an element as a side-panel header action.
 *
 * @example
 * ```html
 * <tn-side-panel [(open)]="isOpen" title="Edit">
 *   <tn-icon-button tnSidePanelHeaderAction name="fullscreen" />
 *   Content here
 * </tn-side-panel>
 * ```
 */
@Directive({
  selector: '[tnSidePanelHeaderAction]',
  standalone: true,
})
export class TnSidePanelHeaderActionDirective {}

const slidePanelAnimation = trigger('slidePanel', [
  state('closed', style({ transform: 'translateX(100%)' })),
  state('open', style({ transform: 'translateX(0)' })),
  transition('closed => open', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
  transition('open => closed', [
    animate('250ms cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
]);

const backdropAnimation = trigger('backdrop', [
  state('hidden', style({ opacity: 0 })),
  state('visible', style({ opacity: 1 })),
  transition('hidden => visible', animate('200ms ease')),
  transition('visible => hidden', animate('200ms ease')),
]);

@Component({
  selector: 'tn-side-panel',
  standalone: true,
  imports: [CommonModule, A11yModule, TnIconButtonComponent],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  animations: [slidePanelAnimation, backdropAnimation],
  host: {
    'class': 'tn-side-panel',
    '[class.tn-side-panel--open]': 'open()',
    '[class.tn-side-panel--contained]': 'contained()',
    'role': 'dialog',
    '[attr.aria-modal]': 'open() ? "true" : null',
    '[attr.aria-labelledby]': 'open() ? titleId : null',
    '[attr.aria-hidden]': '!open() ? "true" : null',
  },
})
export class TnSidePanelComponent {
  private iconRegistry = inject(TnIconRegistryService);
  private document = inject(DOCUMENT);

  // Inputs
  open = input<boolean>(false);
  title = input<string>('');
  width = input<string>('480px');
  contained = input<boolean>(false);
  hasBackdrop = input<boolean>(true);
  closeOnBackdropClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);

  // Outputs
  openChange = output<boolean>();
  opened = output<void>();
  closed = output<void>();

  // Content projection queries
  private actionContent = contentChildren(TnSidePanelActionDirective);
  protected hasActions = computed(() => this.actionContent().length > 0);

  // Unique ID for aria-labelledby
  readonly titleId = `tn-side-panel-title-${Math.random().toString(36).substring(2, 9)}`;

  // Animation state
  protected animationState = computed(() => this.open() ? 'open' : 'closed');
  protected backdropState = computed(() => this.open() ? 'visible' : 'hidden');

  // Focus restoration
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    this.registerMdiIcons();

    effect(() => {
      if (this.open()) {
        this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
      }
    });
  }

  protected dismiss(): void {
    this.openChange.emit(false);
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.dismiss();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape() && this.open()) {
      event.stopPropagation();
      this.dismiss();
    }
  }

  protected onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'open') {
      this.opened.emit();
    } else if (event.toState === 'closed') {
      this.closed.emit();
      this.restoreFocus();
    }
  }

  private restoreFocus(): void {
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  private registerMdiIcons(): void {
    const mdiIcons: Record<string, string> = {
      'close': mdiClose,
    };

    this.iconRegistry.registerLibrary({
      name: 'mdi',
      resolver: (iconName: string) => {
        const pathData = mdiIcons[iconName];
        if (!pathData) {
          return null;
        }
        return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="${pathData}"/></svg>`;
      },
    });
  }
}
