import { TestBed } from '@angular/core/testing';
import { TnToastMock, TnToastTesting } from './toast-testing';
import { TnToastService } from './toast.service';
import { TnToastType } from './toast.types';

describe('TnToastTesting', () => {
  let mock: TnToastMock;
  let service: TnToastService;

  beforeEach(() => {
    mock = new TnToastMock();
    TestBed.configureTestingModule({
      providers: [TnToastTesting.providers(mock)],
    });
    service = TestBed.inject(TnToastService);
  });

  it('should provide the mock as TnToastService', () => {
    expect(service).toBe(mock as unknown);
  });

  it('should record open() calls', () => {
    service.open('Hello');
    expect(mock.calls.length).toBe(1);
    expect(mock.lastCall?.message).toBe('Hello');
  });

  it('should record action and config', () => {
    service.open('Error', 'Retry', { type: TnToastType.Error });
    expect(mock.lastCall?.action).toBe('Retry');
    expect(mock.lastCall?.config.type).toBe(TnToastType.Error);
  });

  it('should record config as second argument', () => {
    service.open('Warning', { type: TnToastType.Warning });
    expect(mock.lastCall?.action).toBeUndefined();
    expect(mock.lastCall?.config.type).toBe(TnToastType.Warning);
  });

  it('should return a TnToastRef', () => {
    const ref = service.open('Test');
    expect(ref).toBeTruthy();
    expect(ref.dismiss).toBeDefined();
    expect(ref.onAction).toBeDefined();
  });

  it('should support triggering action on the ref', () => {
    const ref = service.open('Error', 'Retry');
    let actionFired = false;
    ref.onAction().subscribe(() => { actionFired = true; });

    ref._triggerAction();
    expect(actionFired).toBe(true);
  });

  it('should reset recorded calls', () => {
    service.open('One');
    service.open('Two');
    expect(mock.calls.length).toBe(2);

    mock.reset();
    expect(mock.calls.length).toBe(0);
    expect(mock.lastCall).toBeUndefined();
  });
});
