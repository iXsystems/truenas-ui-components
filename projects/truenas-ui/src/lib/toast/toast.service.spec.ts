import { ApplicationRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TnToastService } from './toast.service';
import { TnToastPosition, TnToastType } from './toast.types';
import { TnIconTesting } from '../icon/icon-testing';

describe('TnToastService', () => {
  let service: TnToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TnIconTesting.jest.providers()],
    });
    service = TestBed.inject(TnToastService);
  });

  afterEach(() => {
    document.querySelectorAll('tn-toast').forEach(el => el.remove());
  });

  function detectChanges() {
    TestBed.inject(ApplicationRef).tick();
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a toast and append it to the DOM', () => {
    service.open('Hello');
    expect(document.querySelector('tn-toast')).not.toBeNull();
  });

  it('should render the message text', () => {
    service.open('Hello world');
    detectChanges();
    const message = document.querySelector('.tn-toast__message');
    expect(message?.textContent?.trim()).toBe('Hello world');
  });

  it('should return a TnToastRef', () => {
    const ref = service.open('Test');
    expect(ref).toBeTruthy();
    expect(ref.dismiss).toBeDefined();
    expect(ref.onAction).toBeDefined();
    expect(ref.afterDismissed).toBeDefined();
    ref.dismiss();
  });

  it('should dismiss the toast programmatically', fakeAsync(() => {
    const ref = service.open('Test', { duration: 0 });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => { dismissed = true; });

    ref.dismiss();
    expect(dismissed).toBe(true);

    tick(200);
  }));

  it('should auto-dismiss after duration', fakeAsync(() => {
    const ref = service.open('Test', { duration: 1000 });
    let dismissed = false;
    ref.afterDismissed().subscribe(() => { dismissed = true; });

    tick(999);
    expect(dismissed).toBe(false);

    tick(1);
    expect(dismissed).toBe(true);

    tick(200);
  }));

  it('should dismiss previous toast when opening a new one', fakeAsync(() => {
    const ref1 = service.open('First', { duration: 0 });
    let dismissed1 = false;
    ref1.afterDismissed().subscribe(() => { dismissed1 = true; });

    service.open('Second', { duration: 0 });
    expect(dismissed1).toBe(true);

    tick(200);
  }));

  it('should render action button when action is provided', () => {
    service.open('Error', 'Retry');
    detectChanges();
    const button = document.querySelector('.tn-toast__action');
    expect(button?.textContent?.trim()).toBe('Retry');
  });

  it('should not render action button when no action', () => {
    service.open('Info');
    detectChanges();
    const button = document.querySelector('.tn-toast__action');
    expect(button).toBeNull();
  });

  it('should apply type modifier class', () => {
    service.open('Warning', { type: TnToastType.Warning });
    detectChanges();
    const toast = document.querySelector('.tn-toast');
    expect(toast?.classList.contains('tn-toast--warning')).toBe(true);
  });

  it('should apply error type with action and config', () => {
    service.open('Error', 'Retry', { type: TnToastType.Error });
    detectChanges();
    const toast = document.querySelector('.tn-toast');
    expect(toast?.classList.contains('tn-toast--error')).toBe(true);
    const button = document.querySelector('.tn-toast__action');
    expect(button?.textContent?.trim()).toBe('Retry');
  });

  it('should emit onAction when action button is clicked', fakeAsync(() => {
    const ref = service.open('Error', 'Retry', { duration: 0 });
    detectChanges();
    let actionFired = false;
    ref.onAction().subscribe(() => { actionFired = true; });

    const button = document.querySelector('.tn-toast__action') as HTMLButtonElement;
    button?.click();
    expect(actionFired).toBe(true);

    tick(200);
  }));

  it('should dismiss after action button is clicked', fakeAsync(() => {
    const ref = service.open('Error', 'Retry', { duration: 0 });
    detectChanges();
    let dismissed = false;
    ref.afterDismissed().subscribe(() => { dismissed = true; });

    const button = document.querySelector('.tn-toast__action') as HTMLButtonElement;
    button?.click();
    expect(dismissed).toBe(true);

    tick(200);
  }));

  it('should default to info type', () => {
    service.open('Info message');
    detectChanges();
    const toast = document.querySelector('.tn-toast');
    expect(toast?.classList.contains('tn-toast--info')).toBe(true);
  });

  it('should default to top position', () => {
    service.open('Test');
    detectChanges();
    const host = document.querySelector('tn-toast');
    expect(host?.classList.contains('tn-toast--top')).toBe(true);
  });

  it('should support top position', () => {
    service.open('Test', { position: TnToastPosition.Top });
    detectChanges();
    const host = document.querySelector('tn-toast');
    expect(host?.classList.contains('tn-toast--top')).toBe(true);
  });

  it('should default to 4000ms duration', fakeAsync(() => {
    const ref = service.open('Test');
    let dismissed = false;
    ref.afterDismissed().subscribe(() => { dismissed = true; });

    tick(3999);
    expect(dismissed).toBe(false);

    tick(1);
    expect(dismissed).toBe(true);

    tick(200);
  }));
});
