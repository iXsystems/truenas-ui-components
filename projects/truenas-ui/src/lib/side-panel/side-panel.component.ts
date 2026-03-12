import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component, Directive, input, output, model, computed, effect, inject, signal,
  contentChildren, viewChild, afterNextRender,
} from '@angular/core';
import type { ElementRef, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'tn-side-panel',
  standalone: true,
  imports: [CommonModule, A11yModule, TnIconButtonComponent],
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  host: {
    'class': 'tn-side-panel',
    '[attr.data-tn-panel]': 'panelId',
  },
})
export class TnSidePanelComponent implements OnDestroy {
  private iconRegistry = inject(TnIconRegistryService);
  private document = inject(DOCUMENT);

  private overlayRef = viewChild.required<ElementRef>('overlay');
  protected initialized = signal(false);

  // Two-way bindable via [(open)]
  open = model<boolean>(false);

  // Inputs
  title = input<string>('');
  width = input<string>('480px');
  hasBackdrop = input<boolean>(true);
  closeOnBackdropClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);

  // Outputs
  opened = output<void>();
  closed = output<void>();

  // Content projection queries
  private actionContent = contentChildren(TnSidePanelActionDirective);
  protected hasActions = computed(() => this.actionContent().length > 0);

  // Unique IDs for aria-labelledby and portal correlation
  readonly panelId = `tn-side-panel-${Math.random().toString(36).substring(2, 9)}`;
  readonly titleId = `${this.panelId}-title`;

  // Focus restoration
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    this.registerMdiIcons();

    effect(() => {
      if (this.open()) {
        this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
      }
    });

    afterNextRender(() => {
      this.document.body.appendChild(this.overlayRef().nativeElement);
      this.initialized.set(true);
    });
  }

  ngOnDestroy(): void {
    this.overlayRef().nativeElement.remove();
  }

  protected dismiss(): void {
    this.open.set(false);
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

  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }

    if (this.open()) {
      this.opened.emit();
    } else {
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
