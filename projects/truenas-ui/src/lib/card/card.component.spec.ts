import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TN_TEST_ATTR } from '../test-id';
import { TnCardComponent } from './card.component';
import type {
  TnCardAction,
  TnCardControl,
  TnCardHeaderStatus,
} from './card.interfaces';
import type { TnMenuItem } from '../menu/menu.component';

@Component({
  standalone: true,
  imports: [TnCardComponent],
  template: `<tn-card [headerStatus]="status()" [headerControl]="control()" [headerMenu]="menu()" [headerMenuTriggerTestId]="menuTriggerTestId()" [primaryAction]="primary()" [secondaryAction]="secondary()">Content</tn-card>`,
})
class HostComponent {
  status = signal<TnCardHeaderStatus | undefined>(undefined);
  control = signal<TnCardControl | undefined>(undefined);
  menu = signal<TnMenuItem[] | undefined>(undefined);
  menuTriggerTestId = signal<string | undefined>(undefined);
  primary = signal<TnCardAction | undefined>(undefined);
  secondary = signal<TnCardAction | undefined>(undefined);
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
    fixture.componentInstance.primary.set({
      label: 'Add',
      handler: () => {},
      testId: 'button-smb-share-add',
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
      testId: 'button-webshare-open',
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
    fixture.componentInstance.menuTriggerTestId.set('button-4-actions-menu');
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

    expect(primaryBtn.getAttribute('data-test')).toBe('p-id');
    expect(primaryBtn.getAttribute('data-testid')).toBeNull();

    expect(secondaryBtn.getAttribute('data-test')).toBe('s-id');
    expect(kebabBtn.getAttribute('data-test')).toBe('k-id');
    expect(pill.getAttribute('data-test')).toBe('st-id');
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
