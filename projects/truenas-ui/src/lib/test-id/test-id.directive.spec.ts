import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TN_TEST_ATTR } from './test-attr.token';
import { TnTestIdDirective } from './test-id.directive';

@Component({
  standalone: true,
  imports: [TnTestIdDirective],
  template: `<button [tnTestId]="value">click</button>`,
})
class HostComponent {
  value: string | null | undefined = 'my-id';
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

describe('TnTestIdDirective', () => {
  it('writes to data-testid by default', () => {
    const fixture = createHost();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-testid')).toBe('my-id');
    expect(button.getAttribute('data-test')).toBeNull();
  });

  it('writes to data-test when TN_TEST_ATTR is overridden', () => {
    const fixture = createHost([{ provide: TN_TEST_ATTR, useValue: 'data-test' }]);
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-test')).toBe('my-id');
    expect(button.getAttribute('data-testid')).toBeNull();
  });

  it('updates the attribute reactively when the value changes', () => {
    const fixture = createHost();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-testid')).toBe('my-id');

    fixture.componentInstance.value = 'updated-id';
    fixture.detectChanges();

    expect(button.getAttribute('data-testid')).toBe('updated-id');
  });

  it('removes the attribute when the value becomes falsy', () => {
    const fixture = createHost();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-testid')).toBe('my-id');

    fixture.componentInstance.value = null;
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();

    fixture.componentInstance.value = '';
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();

    fixture.componentInstance.value = undefined;
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();
  });

  it('does not add an empty attribute when no value is set initially', () => {
    @Component({
      standalone: true,
      imports: [TnTestIdDirective],
      template: `<button [tnTestId]="value">click</button>`,
    })
    class EmptyHostComponent {
      value: string | undefined = undefined;
    }

    TestBed.configureTestingModule({ imports: [EmptyHostComponent] });
    const fixture = TestBed.createComponent(EmptyHostComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    expect(button.hasAttribute('data-testid')).toBe(false);
    expect(button.hasAttribute('data-test')).toBe(false);
  });
});
