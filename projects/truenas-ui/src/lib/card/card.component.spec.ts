import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TN_TEST_ATTR } from '../test-id';
import { TnCardFooterActionsDirective, TnCardHeaderActionsDirective } from './card-action.directive';
import { TnCardComponent } from './card.component';
import type {
  TnCardAction,
  TnCardControl,
  TnCardFooterLink,
  TnCardHeaderStatus,
} from './card.interfaces';
import type { TnMenuItem } from '../menu/menu.component';

@Component({
  standalone: true,
  imports: [TnCardComponent],
  template: `<tn-card [headerStatus]="status()" [headerControl]="control()" [headerMenu]="menu()" [headerMenuTriggerTestId]="menuTriggerTestId()" [primaryAction]="primary()" [secondaryAction]="secondary()" [footerLink]="footerLink()">Content</tn-card>`,
})
class HostComponent {
  status = signal<TnCardHeaderStatus | undefined>(undefined);
  control = signal<TnCardControl | undefined>(undefined);
  menu = signal<TnMenuItem[] | undefined>(undefined);
  menuTriggerTestId = signal<string | undefined>(undefined);
  primary = signal<TnCardAction | undefined>(undefined);
  secondary = signal<TnCardAction | undefined>(undefined);
  footerLink = signal<TnCardFooterLink | undefined>(undefined);
}

function createHost(providers: unknown[] = []) {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: providers as Parameters<typeof TestBed.configureTestingModule>[0]['providers'],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('TnCardComponent testId support', () => {
  it('applies testId from primaryAction to the rendered button', () => {
    const fixture = createHost();
    // The card forwards the action's testId into <tn-button>, which now owns
    // the `button-` element-type prefix — so the config carries the *semantic*
    // id ('smb-share-add') and the rendered DOM gets 'button-smb-share-add'.
    fixture.componentInstance.primary.set({
      label: 'Add',
      handler: () => {},
      testId: 'smb-share-add',
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const addButton = Array.from(buttons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'Add',
    ) as HTMLElement | undefined;

    expect(addButton).toBeTruthy();
    expect(addButton?.getAttribute('data-testid')).toBe('button-smb-share-add');
  });

  it('applies testId from secondaryAction to the rendered button', () => {
    const fixture = createHost();
    fixture.componentInstance.secondary.set({
      label: 'Open',
      handler: () => {},
      testId: 'webshare-open', // semantic; <tn-button> adds the `button-` prefix
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const openButton = Array.from(buttons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'Open',
    ) as HTMLElement | undefined;

    expect(openButton?.getAttribute('data-testid')).toBe('button-webshare-open');
  });

  it('applies testId from headerStatus to the status pill', () => {
    const fixture = createHost();
    fixture.componentInstance.status.set({
      label: 'Running',
      type: 'success',
      testId: 'button-service-status-cifs',
    });
    fixture.detectChanges();

    const pill = fixture.nativeElement.querySelector('.tn-card__status') as HTMLElement;
    expect(pill).toBeTruthy();
    expect(pill.getAttribute('data-testid')).toBe('button-service-status-cifs');
  });

  it('applies headerMenuTriggerTestId to the kebab trigger button', () => {
    const fixture = createHost();
    fixture.componentInstance.menu.set([
      { id: 'a', label: 'Action A' },
    ]);
    // kebab trigger renders via <tn-icon-button>, which owns the `button-`
    // prefix — config passes the semantic id, DOM gets 'button-4-actions-menu'.
    fixture.componentInstance.menuTriggerTestId.set('4-actions-menu');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.tn-card__menu button') as HTMLElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('data-testid')).toBe('button-4-actions-menu');
  });

  it('honors TN_TEST_ATTR override for every slot', () => {
    const fixture = createHost([{ provide: TN_TEST_ATTR, useValue: 'data-test' }]);

    fixture.componentInstance.primary.set({ label: 'P', handler: () => {}, testId: 'p-id' });
    fixture.componentInstance.secondary.set({ label: 'S', handler: () => {}, testId: 's-id' });
    fixture.componentInstance.status.set({ label: 'OK', testId: 'st-id' });
    fixture.componentInstance.menu.set([{ id: 'a', label: 'A' }]);
    fixture.componentInstance.menuTriggerTestId.set('k-id');
    fixture.detectChanges();

    const allButtons = fixture.nativeElement.querySelectorAll('button');
    const primaryBtn = Array.from(allButtons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'P',
    ) as HTMLElement;
    const secondaryBtn = Array.from(allButtons).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'S',
    ) as HTMLElement;
    const kebabBtn = fixture.nativeElement.querySelector('.tn-card__menu button') as HTMLElement;
    const pill = fixture.nativeElement.querySelector('.tn-card__status') as HTMLElement;

    // primary/secondary (<tn-button>) and the kebab trigger (<tn-icon-button>)
    // own the `button-` prefix; the status pill is a raw [tnTestId] (not typed
    // yet), so it stays verbatim.
    expect(primaryBtn.getAttribute('data-test')).toBe('button-p-id');
    expect(primaryBtn.getAttribute('data-testid')).toBeNull();

    expect(secondaryBtn.getAttribute('data-test')).toBe('button-s-id');
    expect(kebabBtn.getAttribute('data-test')).toBe('button-k-id');
    expect(pill.getAttribute('data-test')).toBe('st-id');
  });

  it('applies testId from footerLink to the rendered link button', () => {
    const fixture = createHost();
    fixture.componentInstance.footerLink.set({
      label: 'View details',
      handler: () => {},
      testId: 'view-details', // semantic; <button> footer link adds the `link-` prefix
    });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.tn-card__footer-link') as HTMLElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('data-testid')).toBe('link-view-details');
  });

  it('does not render data-testid when testId is omitted on actions / status / trigger', () => {
    const fixture = createHost();
    fixture.componentInstance.primary.set({ label: 'X', handler: () => {} });
    fixture.componentInstance.status.set({ label: 'Y' });
    fixture.componentInstance.menu.set([{ id: 'a', label: 'A' }]);
    // no menuTriggerTestId set
    fixture.detectChanges();

    const primaryBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((b) => (b as HTMLElement).textContent?.trim() === 'X') as HTMLElement;
    const pill = fixture.nativeElement.querySelector('.tn-card__status') as HTMLElement;
    const kebabBtn = fixture.nativeElement.querySelector('.tn-card__menu button') as HTMLElement;

    expect(primaryBtn.hasAttribute('data-testid')).toBe(false);
    expect(pill.hasAttribute('data-testid')).toBe(false);
    expect(kebabBtn.hasAttribute('data-testid')).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [TnCardComponent, TnCardHeaderActionsDirective, TnCardFooterActionsDirective],
  template: `<tn-card [primaryAction]="primary()">`
    + `@if (showHeaderAction()) {<ng-template tnCardHeaderActions><button type="button" class="projected-header-action">Toggle</button></ng-template>}`
    + `@if (showFooterAction()) {<ng-template tnCardFooterActions><button type="button" class="projected-footer-action">Add</button></ng-template>}`
    + `Content</tn-card>`,
})
class ProjectedActionsHostComponent {
  showHeaderAction = signal(false);
  showFooterAction = signal(false);
  primary = signal<TnCardAction | undefined>(undefined);
}

describe('TnCardComponent projected action templates', () => {
  function createProjectedHost() {
    TestBed.configureTestingModule({ imports: [ProjectedActionsHostComponent] });
    const fixture = TestBed.createComponent(ProjectedActionsHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders projected footer actions inside the footer, and shows the footer when only a projected action is present', () => {
    const fixture = createProjectedHost();
    expect(fixture.nativeElement.querySelector('.tn-card__footer')).toBeNull();

    fixture.componentInstance.showFooterAction.set(true);
    fixture.detectChanges();

    const footer = fixture.nativeElement.querySelector('.tn-card__footer') as HTMLElement;
    expect(footer).toBeTruthy();
    expect(footer.querySelector('.projected-footer-action')).toBeTruthy();
  });

  it('renders projected header actions inside the header-right, and shows the header when only a projected action is present', () => {
    const fixture = createProjectedHost();
    expect(fixture.nativeElement.querySelector('.tn-card__header')).toBeNull();

    fixture.componentInstance.showHeaderAction.set(true);
    fixture.detectChanges();

    const headerRight = fixture.nativeElement.querySelector('.tn-card__header-right') as HTMLElement;
    expect(headerRight).toBeTruthy();
    expect(headerRight.querySelector('.projected-header-action')).toBeTruthy();
  });

  it('renders the projected footer action as a direct child of the footer flex row, alongside a declarative primaryAction', () => {
    const fixture = createProjectedHost();
    fixture.componentInstance.primary.set({ label: 'Primary', handler: () => {} });
    fixture.componentInstance.showFooterAction.set(true);
    fixture.detectChanges();

    const footerRight = fixture.nativeElement.querySelector('.tn-card__footer-right') as HTMLElement;
    const projected = footerRight.querySelector('.projected-footer-action') as HTMLElement;
    // No wrapper element: the projected button sits directly in the flex row so it
    // aligns identically to the declarative <tn-button>.
    expect(projected).toBeTruthy();
    expect(projected.parentElement).toBe(footerRight);
    // Declarative action renders too — projected actions are additive, not a replacement.
    const primaryBtn = Array.from(footerRight.querySelectorAll('button')).find(
      (b) => (b as HTMLElement).textContent?.trim() === 'Primary',
    );
    expect(primaryBtn).toBeTruthy();
  });
});

@Component({
  standalone: true,
  imports: [TnCardComponent],
  template: `<tn-card [title]="title()" [titleRouterLink]="routerLink()" [titleTooltip]="tooltip()">Content</tn-card>`,
})
class TitleHostComponent {
  title = signal<string | undefined>('Recent Orders');
  routerLink = signal<string | unknown[] | undefined>(undefined);
  tooltip = signal<string | undefined>(undefined);
}

describe('TnCardComponent title router link & tooltip', () => {
  function createTitleHost() {
    TestBed.configureTestingModule({
      imports: [TitleHostComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(TitleHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the title as a routerLink anchor with a trailing link icon when titleRouterLink is set', () => {
    const fixture = createTitleHost();
    fixture.componentInstance.routerLink.set(['/orders', 'recent']);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('.tn-card__title a') as HTMLAnchorElement | null;
    expect(anchor).toBeTruthy();
    // RouterLink resolves the commands array to a client-side href.
    expect(anchor?.getAttribute('href')).toBe('/orders/recent');
    expect(anchor?.textContent).toContain('Recent Orders');
    // The link carries a trailing icon so it reads visually as a link...
    const linkIcon = anchor?.querySelector('.tn-card__title-link-icon');
    expect(linkIcon).toBeTruthy();
    // ...but the icon is decorative: hidden from the a11y tree so it does not
    // pollute the link's accessible name (which stays just "Recent Orders").
    expect(linkIcon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a plain h3 with no link or link icon when titleRouterLink is absent', () => {
    const fixture = createTitleHost();

    const title = fixture.nativeElement.querySelector('.tn-card__title') as HTMLElement;
    expect(title.tagName.toLowerCase()).toBe('h3');
    expect(title.querySelector('a')).toBeNull();
    expect(title.querySelector('.tn-card__title-link-icon')).toBeNull();
  });

  it('renders titleTooltip as a separate help-icon button (not on the title text) only when set', () => {
    const fixture = createTitleHost();

    // No tooltip: no help affordance is rendered.
    expect(fixture.nativeElement.querySelector('.tn-card__title-tooltip')).toBeNull();

    fixture.componentInstance.tooltip.set('Open the full orders page');
    fixture.detectChanges();

    const tooltipButton = fixture.nativeElement.querySelector('.tn-card__title-tooltip') as HTMLElement | null;
    expect(tooltipButton).toBeTruthy();
    expect(tooltipButton?.getAttribute('aria-label')).toBe('Open the full orders page');
  });
});
