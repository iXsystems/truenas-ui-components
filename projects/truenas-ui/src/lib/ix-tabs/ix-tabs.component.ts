import { Component, ContentChildren, QueryList, AfterContentInit, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  @ViewChild('tabHeader') tabHeader!: ElementRef<HTMLElement>;

  @Input() selectedIndex = 0;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() highlightPosition: 'left' | 'right' | 'top' | 'bottom' = 'bottom';

  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<TabChangeEvent>();

  highlightBarLeft = 0;
  highlightBarWidth = 0;
  highlightBarTop = 0;
  highlightBarHeight = 0; // Start hidden
  highlightBarVisible = false;

  private focusMonitor = inject(FocusMonitor);
  private liveAnnouncer = inject(LiveAnnouncer);
  private cdr = inject(ChangeDetectorRef);

  ngAfterContentInit() {
    this.initializeTabs();
    this.selectTab(this.selectedIndex);

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
      this.highlightBarVisible = true;
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
    this.tabs.forEach((tab, index) => {
      tab.index = index;
      tab.isActive = index === this.selectedIndex;
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
        if (!tab.disabled) {
          this.selectTab(index);
        }
      });
    });

    this.panels.forEach((panel, index) => {
      panel.index = index;
      panel.isActive = index === this.selectedIndex;
    });

    // Trigger change detection to update DOM
    this.cdr.detectChanges();
  }

  selectTab(index: number) {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }

    const tab = this.tabs.get(index);
    if (tab && tab.disabled) {
      return;
    }

    const previousIndex = this.selectedIndex;
    this.selectedIndex = index;

    // Update tab states
    this.tabs.forEach((tab, i) => {
      tab.isActive = i === index;
    });

    // Update panel states
    this.panels.forEach((panel, i) => {
      panel.isActive = i === index;
      if (i === index) {
        panel.onActivate();
      }
    });

    // Trigger change detection to update DOM
    this.cdr.detectChanges();

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
    if (!this.tabHeader || !this.tabs || this.tabs.length === 0) {
      return;
    }

    const activeTab = this.tabs.get(this.selectedIndex);
    if (!activeTab || !activeTab.elementRef) {
      return;
    }

    const tabElement = activeTab.elementRef.nativeElement;
    const headerElement = this.tabHeader.nativeElement;
    
    // Get the position and dimensions of the active tab relative to the header
    const tabRect = tabElement.getBoundingClientRect();
    const headerRect = headerElement.getBoundingClientRect();
    
    if (this.orientation === 'vertical') {
      // For vertical tabs, animate top position and height
      this.highlightBarTop = tabRect.top - headerRect.top;
      this.highlightBarHeight = tabRect.height;
      // Position highlight bar based on highlightPosition
      if (this.highlightPosition === 'left') {
        this.highlightBarLeft = tabRect.left - headerRect.left;
        this.highlightBarWidth = 3;
      } else { // right
        this.highlightBarLeft = (tabRect.right - headerRect.left) - 3;
        this.highlightBarWidth = 3;
      }
    } else {
      // For horizontal tabs, animate left position and width
      this.highlightBarLeft = tabRect.left - headerRect.left;
      this.highlightBarWidth = tabRect.width;
      // Position highlight bar based on highlightPosition
      if (this.highlightPosition === 'top') {
        this.highlightBarTop = tabRect.top - headerRect.top;
        this.highlightBarHeight = 2;
      } else { // bottom
        this.highlightBarTop = (tabRect.bottom - headerRect.top) - 2;
        this.highlightBarHeight = 2;
      }
    }


    // Trigger change detection to update the highlight bar position
    this.cdr.detectChanges();
  }

  onKeydown(event: KeyboardEvent, currentIndex: number) {

    let targetIndex = currentIndex;

    switch (event.keyCode) {
      case LEFT_ARROW:
        if (this.orientation === 'horizontal') {
          targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
        } else {
          return; // No action for vertical tabs
        }
        break;
      case RIGHT_ARROW:
        if (this.orientation === 'horizontal') {
          targetIndex = this.getNextEnabledTabIndex(currentIndex);
        } else {
          return; // No action for vertical tabs
        }
        break;
      case UP_ARROW:
        if (this.orientation === 'vertical') {
          targetIndex = this.getPreviousEnabledTabIndex(currentIndex);
        } else {
          return; // No action for horizontal tabs
        }
        break;
      case DOWN_ARROW:
        if (this.orientation === 'vertical') {
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
      if (!this.tabs.get(i)?.disabled) {
        return i;
      }
    }
    return this.getLastEnabledTabIndex();
  }

  private getNextEnabledTabIndex(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this.tabs.length; i++) {
      if (!this.tabs.get(i)?.disabled) {
        return i;
      }
    }
    return this.getFirstEnabledTabIndex();
  }

  private getFirstEnabledTabIndex(): number {
    for (let i = 0; i < this.tabs.length; i++) {
      if (!this.tabs.get(i)?.disabled) {
        return i;
      }
    }
    return 0;
  }

  private getLastEnabledTabIndex(): number {
    for (let i = this.tabs.length - 1; i >= 0; i--) {
      if (!this.tabs.get(i)?.disabled) {
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


  get classes(): string {
    const classes = ['ix-tabs'];
    
    if (this.orientation === 'vertical') {
      classes.push('ix-tabs--vertical');
    } else {
      classes.push('ix-tabs--horizontal');
    }
    
    // Add highlight position class
    classes.push(`ix-tabs--highlight-${this.highlightPosition}`);
    
    return classes.join(' ');
  }
}
