import { Component, ContentChildren, QueryList, AfterContentInit, input, output, ChangeDetectionStrategy, inject, ChangeDetectorRef, viewChild, ElementRef, AfterViewInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusMonitor, A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, HOME, END, ENTER, SPACE } from '@angular/cdk/keycodes';
import { IxTabComponent } from '../ix-tab/ix-tab.component';
import { IxTabPanelComponent } from '../ix-tab-panel/ix-tab-panel.component';

export interface TabChangeEvent {
  index: number;
  tab: IxTabComponent;
  previousIndex: number;
}

@Component({
  selector: 'ix-tabs',
  standalone: true,
  imports: [CommonModule, A11yModule, IxTabComponent, IxTabPanelComponent],
  templateUrl: './ix-tabs.component.html',
  styleUrl: './ix-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IxTabsComponent implements AfterContentInit, AfterViewInit {
  @ContentChildren(IxTabComponent) tabs!: QueryList<IxTabComponent>;
  @ContentChildren(IxTabPanelComponent) panels!: QueryList<IxTabPanelComponent>;
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
  private liveAnnouncer = inject(LiveAnnouncer);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Sync input to internal state
    effect(() => {
      this.internalSelectedIndex.set(this.selectedIndex());
    });

    // Reactive child state management - update tabs and panels when selectedIndex changes
    effect(() => {
      const currentIndex = this.internalSelectedIndex();

      if (this.tabs && this.tabs.length > 0) {
        this.tabs.forEach((tab, i) => {
          tab.isActive.set(i === currentIndex);
        });
      }

      if (this.panels && this.panels.length > 0) {
        this.panels.forEach((panel, i) => {
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
    this.tabs.changes.subscribe(() => {
      this.initializeTabs();
      this.updateHighlightBar();
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
    this.tabs.forEach(tab => {
      if (tab.elementRef) {
        this.focusMonitor.stopMonitoring(tab.elementRef);
      }
    });
  }

  private initializeTabs() {
    const currentIndex = this.internalSelectedIndex();

    this.tabs.forEach((tab, index) => {
      tab.index.set(index);
      tab.isActive.set(index === currentIndex);
      tab.tabsComponent = this;

      // Set up focus monitoring
      if (tab.elementRef) {
        this.focusMonitor.monitor(tab.elementRef)
          .subscribe(origin => {
            if (origin) {
              console.log(`Tab ${index} focused via: ${origin}`);
            }
          });
      }

      // Set up click handlers
      tab.selected.subscribe(() => {
        if (!tab.disabled()) {
          this.selectTab(index);
        }
      });
    });

    this.panels.forEach((panel, index) => {
      panel.index.set(index);
      panel.isActive.set(index === currentIndex);
    });

    // Trigger change detection to update DOM
    this.cdr.detectChanges();
  }

  selectTab(index: number) {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }

    const tab = this.tabs.get(index);
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
    if (!tabHeader || !this.tabs || this.tabs.length === 0) {
      return;
    }

    const activeTab = this.tabs.get(this.internalSelectedIndex());
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
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.tabs.get(i)?.disabled()) {
        return i;
      }
    }
    return this.getLastEnabledTabIndex();
  }

  private getNextEnabledTabIndex(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this.tabs.length; i++) {
      if (!this.tabs.get(i)?.disabled()) {
        return i;
      }
    }
    return this.getFirstEnabledTabIndex();
  }

  private getFirstEnabledTabIndex(): number {
    for (let i = 0; i < this.tabs.length; i++) {
      if (!this.tabs.get(i)?.disabled()) {
        return i;
      }
    }
    return 0;
  }

  private getLastEnabledTabIndex(): number {
    for (let i = this.tabs.length - 1; i >= 0; i--) {
      if (!this.tabs.get(i)?.disabled()) {
        return i;
      }
    }
    return this.tabs.length - 1;
  }

  private focusTab(index: number) {
    const tab = this.tabs.get(index);
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
