import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TN_TEST_ATTR } from './test-attr.token';
import { TnTestIdDirective } from './test-id.directive';

/**
 * The hosts below hold their bound value in a `signal` rather than a plain
 * field, and that is load-bearing rather than stylistic since #304 made this
 * project's tests zoneless. Assigning a plain property marks no view dirty, so
 * `fixture.detectChanges()` — which is `ApplicationRef.tick()` with nothing to
 * do — refreshes nothing and the attribute under test keeps its old value. Dev
 * mode then reports it as `NG0100` from the `checkNoChanges` pass, which reads
 * as a component bug rather than as a spec that never re-rendered.
 */
@Component({
  standalone: true,
  imports: [TnTestIdDirective],
  template: `
    <!-- eslint-disable-next-line tn-local/require-tn-testid-type -- exercises verbatim (no tnTestIdType) directive behavior -->
    <button [tnTestId]="value()">click</button>
  `,
})
class HostComponent {
  value = signal<string | null | undefined>('my-id');
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

    fixture.componentInstance.value.set('updated-id');
    fixture.detectChanges();

    expect(button.getAttribute('data-testid')).toBe('updated-id');
  });

  it('removes the attribute when the value becomes falsy', () => {
    const fixture = createHost();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-testid')).toBe('my-id');

    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();

    fixture.componentInstance.value.set('');
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();

    fixture.componentInstance.value.set(undefined);
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBeNull();
  });

  it('prepends the component-declared type when tnTestIdType is set', () => {
    @Component({
      standalone: true,
      imports: [TnTestIdDirective],
      template: `<button tnTestIdType="button" [tnTestId]="value()">click</button>`,
    })
    class TypedHostComponent {
      value = signal<string | (string | number)[]>('save');
    }

    TestBed.configureTestingModule({ imports: [TypedHostComponent] });
    const fixture = TestBed.createComponent(TypedHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLElement;

    expect(button.getAttribute('data-testid')).toBe('button-save');

    fixture.componentInstance.value.set(['username', 'Jane Doe']);
    fixture.detectChanges();
    expect(button.getAttribute('data-testid')).toBe('button-username-jane-doe');
  });

  it('does not add an empty attribute when no value is set initially', () => {
    @Component({
      standalone: true,
      imports: [TnTestIdDirective],
  template: `
    <!-- eslint-disable-next-line tn-local/require-tn-testid-type -- exercises verbatim (no tnTestIdType) directive behavior -->
    <button [tnTestId]="value()">click</button>
  `,
    })
    class EmptyHostComponent {
      value = signal<string | undefined>(undefined);
    }

    TestBed.configureTestingModule({ imports: [EmptyHostComponent] });
    const fixture = TestBed.createComponent(EmptyHostComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    expect(button.hasAttribute('data-testid')).toBe(false);
    expect(button.hasAttribute('data-test')).toBe(false);
  });
});
