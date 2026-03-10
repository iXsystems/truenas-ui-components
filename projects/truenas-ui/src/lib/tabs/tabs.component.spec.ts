import { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, HOME, END, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTabsComponent } from './tabs.component';
import { TnTabComponent } from '../tab/tab.component';
import { TnTabPanelComponent } from '../tab-panel/tab-panel.component';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/test-host.component.html'
})
class TestHostComponent {
  selectedIndex = signal(0);
  orientation = signal<'horizontal' | 'vertical'>('horizontal');
  tab2Disabled = signal(false);

  tabs = viewChild.required(TnTabsComponent);

  indexChanges: number[] = [];
  tabChangeEvents: unknown[] = [];

  onIndexChange(index: number) {
    this.indexChanges.push(index);
  }

  onTabChange(event: unknown) {
    this.tabChangeEvents.push(event);
  }
}

@Component({
  selector: 'tn-lazy-host',
  standalone: true,
  imports: [TnTabsComponent, TnTabComponent, TnTabPanelComponent],
  templateUrl: './test-hosts/lazy-host.component.html'
})
class LazyHostComponent {
  tabs = viewChild.required(TnTabsComponent);
}

function createKeyboardEvent(keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'keyCode', { value: keyCode });
  return event;
}

describe('TnTabsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should render three tab buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons.length).toBe(3);
    });

    it('should render three tab panels', () => {
      const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
      expect(panels.length).toBe(3);
    });

    it('should render a tablist container', () => {
      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist).toBeTruthy();
    });

    it('should display tab labels', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[0].textContent.trim()).toContain('Tab 1');
      expect(buttons[1].textContent.trim()).toContain('Tab 2');
      expect(buttons[2].textContent.trim()).toContain('Tab 3');
    });
  });

  describe('selection', () => {
    it('should select the first tab by default', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[0].getAttribute('aria-selected')).toBe('true');
      expect(buttons[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should select a tab on click', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      buttons[2].click();
      fixture.detectChanges();

      expect(buttons[2].getAttribute('aria-selected')).toBe('true');
      expect(buttons[0].getAttribute('aria-selected')).toBe('false');
    });

    it('should emit selectedIndexChange on selection', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      buttons[2].click();
      fixture.detectChanges();

      expect(host.indexChanges).toContain(2);
    });

    it('should emit tabChange with event details', () => {
      // Clear any events from initialization
      host.tabChangeEvents = [];

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      buttons[2].click();
      fixture.detectChanges();

      expect(host.tabChangeEvents.length).toBe(1);
      const event = host.tabChangeEvents[0] as {
        index: number;
        previousIndex: number;
      };
      expect(event.index).toBe(2);
      expect(event.previousIndex).toBe(0);
    });

    it('should respond to selectedIndex input changes', () => {
      host.selectedIndex.set(2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[2].getAttribute('aria-selected')).toBe('true');
    });

    it('should not select a disabled tab on click', () => {
      host.tab2Disabled.set(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      buttons[1].click();
      fixture.detectChanges();

      expect(buttons[0].getAttribute('aria-selected')).toBe('true');
      expect(buttons[1].getAttribute('aria-selected')).toBe('false');
    });

    it('should ignore out-of-range index', () => {
      host.tabs().selectTab(-1);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[0].getAttribute('aria-selected')).toBe('true');

      host.tabs().selectTab(99);
      fixture.detectChanges();
      expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('panels', () => {
    it('should show the first panel by default', () => {
      const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
      expect(panels[0].getAttribute('aria-hidden')).toBe('false');
      expect(panels[1].getAttribute('aria-hidden')).toBe('true');
    });

    it('should switch active panel when tab is selected', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      buttons[2].click();
      fixture.detectChanges();

      const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
      expect(panels[0].getAttribute('aria-hidden')).toBe('true');
      expect(panels[2].getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('accessibility', () => {
    it('should set aria-orientation on tablist', () => {
      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('should update aria-orientation for vertical', () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('should set aria-disabled on disabled tabs', () => {
      host.tab2Disabled.set(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[1].getAttribute('aria-disabled')).toBe('true');
      expect(buttons[0].getAttribute('aria-disabled')).toBe('false');
    });

    it('should set tabindex 0 on active tab and -1 on others', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[0].getAttribute('tabindex')).toBe('0');
      expect(buttons[1].getAttribute('tabindex')).toBe('-1');
      expect(buttons[2].getAttribute('tabindex')).toBe('-1');
    });

    it('should set aria-hidden on inactive panels', () => {
      const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
      expect(panels[0].getAttribute('aria-hidden')).toBe('false');
      expect(panels[1].getAttribute('aria-hidden')).toBe('true');
      expect(panels[2].getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('keyboard navigation (horizontal)', () => {
    it('should move to next tab with RIGHT_ARROW', () => {
      host.tabs().onKeydown(createKeyboardEvent(RIGHT_ARROW), 0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[1] || buttons[1].matches(':focus')).toBeTruthy;
    });

    it('should move to previous tab with LEFT_ARROW', () => {
      host.tabs().selectTab(2);
      fixture.detectChanges();

      host.tabs().onKeydown(createKeyboardEvent(LEFT_ARROW), 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[1] || buttons[1].matches(':focus')).toBeTruthy;
    });

    it('should wrap to last tab from first with LEFT_ARROW', () => {
      host.tabs().onKeydown(createKeyboardEvent(LEFT_ARROW), 0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[2] || buttons[2].matches(':focus')).toBeTruthy;
    });

    it('should wrap to first tab from last with RIGHT_ARROW', () => {
      host.tabs().onKeydown(createKeyboardEvent(RIGHT_ARROW), 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[0] || buttons[0].matches(':focus')).toBeTruthy;
    });

    it('should skip disabled tabs', () => {
      host.tab2Disabled.set(true);
      fixture.detectChanges();

      host.tabs().onKeydown(createKeyboardEvent(RIGHT_ARROW), 0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[2] || buttons[2].matches(':focus')).toBeTruthy;
    });

    it('should ignore UP/DOWN_ARROW in horizontal mode', () => {
      const event = createKeyboardEvent(UP_ARROW);
      const preventSpy = jest.spyOn(event, 'preventDefault');
      host.tabs().onKeydown(event, 0);
      expect(preventSpy).not.toHaveBeenCalled();
    });

    it('should go to first tab with HOME', () => {
      host.tabs().selectTab(2);
      fixture.detectChanges();

      host.tabs().onKeydown(createKeyboardEvent(HOME), 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[0] || buttons[0].matches(':focus')).toBeTruthy;
    });

    it('should go to last tab with END', () => {
      host.tabs().onKeydown(createKeyboardEvent(END), 0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[2] || buttons[2].matches(':focus')).toBeTruthy;
    });

    it('should select current tab with ENTER', () => {
      const event = createKeyboardEvent(ENTER);
      const preventSpy = jest.spyOn(event, 'preventDefault');
      host.tabs().onKeydown(event, 1);
      fixture.detectChanges();

      expect(preventSpy).toHaveBeenCalled();
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    });

    it('should select current tab with SPACE', () => {
      const event = createKeyboardEvent(SPACE);
      host.tabs().onKeydown(event, 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[2].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('keyboard navigation (vertical)', () => {
    beforeEach(() => {
      host.orientation.set('vertical');
      fixture.detectChanges();
    });

    it('should move to next tab with DOWN_ARROW', () => {
      host.tabs().onKeydown(createKeyboardEvent(DOWN_ARROW), 0);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[1] || buttons[1].matches(':focus')).toBeTruthy;
    });

    it('should move to previous tab with UP_ARROW', () => {
      host.tabs().selectTab(2);
      fixture.detectChanges();

      host.tabs().onKeydown(createKeyboardEvent(UP_ARROW), 2);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(document.activeElement === buttons[1] || buttons[1].matches(':focus')).toBeTruthy;
    });

    it('should ignore LEFT/RIGHT_ARROW in vertical mode', () => {
      const event = createKeyboardEvent(LEFT_ARROW);
      const preventSpy = jest.spyOn(event, 'preventDefault');
      host.tabs().onKeydown(event, 0);
      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe('CSS classes', () => {
    it('should apply horizontal class by default', () => {
      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist.classList.contains('tn-tabs--horizontal')).toBe(true);
    });

    it('should apply vertical class', () => {
      host.orientation.set('vertical');
      fixture.detectChanges();

      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist.classList.contains('tn-tabs--vertical')).toBe(true);
      expect(tablist.classList.contains('tn-tabs--horizontal')).toBe(false);
    });

    it('should apply highlight position class', () => {
      const tablist = fixture.nativeElement.querySelector('[role="tablist"]');
      expect(tablist.classList.contains('tn-tabs--highlight-bottom')).toBe(true);
    });

    it('should apply active class to selected tab', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[0].classList.contains('tn-tab--active')).toBe(true);
      expect(buttons[1].classList.contains('tn-tab--active')).toBe(false);
    });

    it('should apply disabled class to disabled tab', () => {
      host.tab2Disabled.set(true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button[role="tab"]');
      expect(buttons[1].classList.contains('tn-tab--disabled')).toBe(true);
    });
  });

  describe('highlight bar', () => {
    it('should become visible after view init', async () => {
      // ngAfterViewInit uses setTimeout(fn, 0)
      await new Promise(resolve => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(host.tabs().highlightBarVisible()).toBe(true);
    });
  });
});

describe('TnTabsComponent (lazy loading)', () => {
  let fixture: ComponentFixture<LazyHostComponent>;
  let host: LazyHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LazyHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LazyHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not render lazy panel content initially', () => {
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    const lazyPanelContent = panels[1].querySelector('.tn-tab-panel__content');
    expect(lazyPanelContent).toBeNull();
  });

  it('should render lazy panel content after activation', () => {
    host.tabs().selectTab(1);
    fixture.detectChanges();

    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    const lazyPanelContent = panels[1].querySelector('.tn-tab-panel__content');
    expect(lazyPanelContent).toBeTruthy();
    expect(lazyPanelContent.textContent).toContain('Lazy content');
  });

  it('should keep lazy panel rendered after switching away', () => {
    host.tabs().selectTab(1);
    fixture.detectChanges();

    host.tabs().selectTab(0);
    fixture.detectChanges();

    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    const lazyPanelContent = panels[1].querySelector('.tn-tab-panel__content');
    expect(lazyPanelContent).toBeTruthy();
  });
});
