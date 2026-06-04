import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TN_TEST_ATTR } from '../test-id';
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
