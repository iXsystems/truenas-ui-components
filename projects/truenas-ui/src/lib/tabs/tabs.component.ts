import { FocusMonitor, A11yModule } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, HOME, END, ENTER, SPACE } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import type { AfterContentInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Component, contentChildren, input, output, ChangeDetectionStrategy, inject, ChangeDetectorRef, viewChild, signal, computed, effect } from '@angular/core';
import { TnTabComponent } from '../tab/tab.component';
import { TnTabPanelComponent } from '../tab-panel/tab-panel.component';

export interface TabChangeEvent {
  index: number;
  tab: TnTabComponent;
  previousIndex: number;
}

@Component({
  selector: 'ix-tabs',
  standalone: true,
  imports: [CommonModule, A11yModule, TnTabComponent, TnTabPanelComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TnTabsComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  tabs = contentChildren(TnTabComponent);
  panels = contentChildren(TnTabPanelComponent);
  tabHeader = viewChild.required<ElementRef<HTMLElement>>('tabHeader');

  selectedIndex = input<number>(0);
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  highlightPosition = input<'left' | 'right' | 'top' | 'bottom'>('bottom');

  selectedIndexChange = output<number>();
  tabChange = output<TabChangeEvent>();

  // Internal state for selected index (mutable)
  private internalSelectedIndex = signal<number>(0);

  highlightBarLeft = signal<number>(0);
  highlightBarWidth = signal<number>(0);
  highlightBarTop = signal<number>(0);
  highlightBarHeight = signal<number>(0);
  highlightBarVisible = signal<boolean>(false);

  private focusMonitor = inject(FocusMonitor);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Sync input to internal state
    effect(() => {
      this.internalSelectedIndex.set(this.selectedIndex());
    });

    // Reactive child state management - update tabs and panels when selectedIndex changes
    effect(() => {
      const currentIndex = this.internalSelectedIndex();

      const tabs = this.tabs();
      if (tabs && tabs.length > 0) {
        tabs.forEach((tab, i) => {
          tab.isActive.set(i === currentIndex);
        });
      }

      const panels = this.panels();
      if (panels && panels.length > 0) {
        panels.forEach((panel, i) => {
          panel.isActive.set(i === currentIndex);
          if (i === currentIndex) {
            panel.onActivate();
          }
        });
      }

      this.cdr.detectChanges();
    });
  }

  ngAfterContentInit() {
    this.initializeTabs();
    this.selectTab(this.internalSelectedIndex());

    // Listen for tab changes
    effect(() => {
      // Track tabs signal to react to changes
      const tabs = this.tabs();
      if (tabs.length > 0) {
        this.initializeTabs();
        this.updateHighlightBar();
      }
    });
  }

  ngAfterViewInit() {
    // Wait for next tick to ensure DOM is fully rendered
    setTimeout(() => {
      this.updateHighlightBar();
      this.highlightBarVisible.set(true);
      this.cdr.detectChanges();
    }, 0);
  }


  ngOnDestroy() {
    this.tabs().forEach(tab => {
      if (tab.elementRef) {
        this.focusMonitor.stopMonitoring(tab.elementRef);
      }
    });
  }

  private initializeTabs() {
    const currentIndex = this.internalSelectedIndex();

    this.tabs().forEach((tab, index) => {
      tab.index.set(index);
      tab.isActive.set(index === currentIndex);
      tab.tabsComponent = this;

      // Set up focus monitoring
      if (tab.elementRef) {
        this.focusMonitor.monitor(tab.elementRef);
      }

      // Set up click handlers
      tab.selected.subscribe(() => {
        if (!tab.disabled()) {
          this.selectTab(index);
        }
      });
    });

    this.panels().forEach((panel, index) => {
      panel.index.set(index);
      panel.isActive.set(index === currentIndex);
    });

    // Trigger change detection to update DOM
    this.cdr.detectChanges();
  }

  selectTab(index: number) {
    const tabs = this.tabs();
    if (index < 0 || index >= tabs.length) {
      return;
    }

    const tab = tabs[index];
    if (tab && tab.disabled()) {
      return;
    }

    const previousIndex = this.internalSelectedIndex();
    this.internalSelectedIndex.set(index);

    // Effect will update child states automatically

    // Update highlight bar
    this.updateHighlightBar();

    // Emit events
    this.selectedIndexChange.emit(index);
    if (tab) {
      this.tabChange.emit({
        index,
        tab,
        previousIndex
      });
    }
  }

  private updateHighlightBar() {
    const tabHeader = this.tabHeader();
    const tabs = this.tabs();
    if (!tabHeader || !tabs || tabs.length === 0) {
      return;
    }

    const activeTab = tabs[this.internalSelectedIndex()];
    if (!activeTab || !activeTab.elementRef) {
      return;
    }

    const tabElement = activeTab.elementRef.nativeElement;
    const headerElement = tabHeader.nativeElement;

    // Get the position and dimensions of the active tab relative to the header
    const tabRect = tabElement.getBoundingClientRect();
    const headerRect = headerElement.getBoundingClientRect();

    if (this.orientation() === 'vertical') {
      // For vertical tabs, animate top position and height
      this.highlightBarTop.set(tabRect.top - headerRect.top);
      this.highlightBarHeight.set(tabRect.height);
      // Position highlight bar based on highlightPosition
      if (this.highlightPosition() === 'left') {
        this.highlightBarLeft.set(tabRect.left - headerRect.left);
        this.highlightBarWidth.set(3);
      } else { // right
        this.highlightBarLeft.set((tabRect.right - headerRect.left) - 3);
        this.highlightBarWidth.set(3);
      }
    } else {
      // For horizontal tabs, animate left position and width
      this.highlightBarLeft.set(tabRect.left - headerRect.left);
      this.highlightBarWidth.set(tabRect.width);
      // Position highlight bar based on highlightPosition
      if (this.highlightPosition() === 'top') {
        this.highlightBarTop.set(tabRect.top - headerRect.top);
        this.highlightBarHeight.set(2);
      } else { // bottom
        this.highlightBarTop.set((tabRect.bottom - headerRect.top) - 2);
        this.highlightBarHeight.set(2);
      }
    }

    // Trigger change detection to update the highlight bar position
    this.cdr.detectChanges();
  }

  onKeydown(event: KeyboardEvent, currentIndex: number) {
    let targetIndex = currentIndex;

    switch (event.keyCode) {
      case LEFT_ARROW:
        if (this.orientation() === 'horizontal') {
          targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
        } else {
          return; // No action for vertical tabs
        }
        break;
      case RIGHT_ARROW:
        if (this.orientation() === 'horizontal') {
          targetIndex = this.getNextEnabledTabIndex(currentIndex);
        } else {
          return; // No action for vertical tabs
        }
        break;
      case UP_ARROW:
        if (this.orientation() === 'vertical') {
          targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
        } else {
          return; // No action for horizontal tabs
        }
        break;
      case DOWN_ARROW:
        if (this.orientation() === 'vertical') {
          targetIndex = this.getNextEnabledTabIndex(currentIndex);
        } else {
          return; // No action for horizontal tabs
        }
        break;
      case HOME:
        targetIndex = this.getFirstEnabledTabIndex();
        break;
      case END:
        targetIndex = this.getLastEnabledTabIndex();
        break;
      case ENTER:
      case SPACE:
        this.selectTab(currentIndex);
        event.preventDefault();
        return;
      default:
        return;
    }

    if (targetIndex !== currentIndex) {
      this.focusTab(targetIndex);
      event.preventDefault();
    }
  }

  private getPreviousEnabledTabIndex(currentIndex: number): number {
    const tabs = this.tabs();
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!tabs[i]?.disabled()) {
        return i;
      }
    }
    return this.getLastEnabledTabIndex();
  }

  private getNextEnabledTabIndex(currentIndex: number): number {
    const tabs = this.tabs();
    for (let i = currentIndex + 1; i < tabs.length; i++) {
      if (!tabs[i]?.disabled()) {
        return i;
      }
    }
    return this.getFirstEnabledTabIndex();
  }

  private getFirstEnabledTabIndex(): number {
    const tabs = this.tabs();
    for (let i = 0; i < tabs.length; i++) {
      if (!tabs[i]?.disabled()) {
        return i;
      }
    }
    return 0;
  }

  private getLastEnabledTabIndex(): number {
    const tabs = this.tabs();
    for (let i = tabs.length - 1; i >= 0; i--) {
      if (!tabs[i]?.disabled()) {
        return i;
      }
    }
    return tabs.length - 1;
  }

  private focusTab(index: number) {
    const tab = this.tabs()[index];
    if (tab && tab.elementRef) {
      tab.elementRef.nativeElement.focus();
    }
  }

  classes = computed(() => {
    const classes = ['ix-tabs'];

    if (this.orientation() === 'vertical') {
      classes.push('ix-tabs--vertical');
    } else {
      classes.push('ix-tabs--horizontal');
    }

    // Add highlight position class
    classes.push(`ix-tabs--highlight-${this.highlightPosition()}`);

    return classes.join(' ');
  });
}
