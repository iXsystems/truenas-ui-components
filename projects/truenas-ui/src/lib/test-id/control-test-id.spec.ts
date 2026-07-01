import { Component, forwardRef, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ControlValueAccessor} from '@angular/forms';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import type { TnTestIdValue } from './compose-test-id';
import { controlTestId } from './control-test-id';
import { TnTestIdDirective } from './test-id.directive';

// A minimal ControlValueAccessor mirroring the library's form controls: it
// registers NG_VALUE_ACCESSOR (so eagerly injecting NgControl would be circular)
// and binds its element type + the resolved base on the control element.
@Component({
  selector: 'tn-test-control',
  standalone: true,
  imports: [TnTestIdDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TestControlComponent),
      multi: true,
    },
  ],
  template: `<span tnTestIdType="input" [tnTestId]="resolvedTestId()">x</span>`,
})
class TestControlComponent implements ControlValueAccessor {
  testId = input<TnTestIdValue>(undefined);
  protected resolvedTestId = controlTestId(this.testId);
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

function renderHost(component: unknown): HTMLElement {
  TestBed.configureTestingModule({ imports: [component as never] });
  const fixture = TestBed.createComponent(component as never);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).querySelector('span') as HTMLElement;
}

describe('controlTestId', () => {
  it('falls back to the bound control name, kebab-cased and type-prefixed', () => {
    @Component({
      standalone: true,
      imports: [TestControlComponent, ReactiveFormsModule],
      template: `<form [formGroup]="form"><tn-test-control formControlName="sshPort" /></form>`,
    })
    class HostComponent {
      form = new FormGroup({ sshPort: new FormControl('') });
    }

    // control name `sshPort` → `input-ssh-port` (matches a hand-written testId).
    expect(renderHost(HostComponent).getAttribute('data-testid')).toBe('input-ssh-port');
  });

  it('prefers an explicit testId over the control name', () => {
    @Component({
      standalone: true,
      imports: [TestControlComponent, ReactiveFormsModule],
      template: `<form [formGroup]="form"><tn-test-control formControlName="sshPort" testId="custom" /></form>`,
    })
    class HostComponent {
      form = new FormGroup({ sshPort: new FormControl('') });
    }

    expect(renderHost(HostComponent).getAttribute('data-testid')).toBe('input-custom');
  });

  it('emits no attribute when there is neither a testId nor a named control', () => {
    // `[formControl]` binds a value accessor but carries no control name.
    @Component({
      standalone: true,
      imports: [TestControlComponent, ReactiveFormsModule],
      template: `<tn-test-control [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl('');
    }

    expect(renderHost(HostComponent).hasAttribute('data-testid')).toBe(false);
  });

  it('does not borrow an ancestor control name (self-scoped)', () => {
    // The control has no formControlName of its own; the only NgControl is on an
    // ancestor element. A self-scoped lookup must NOT pick it up.
    @Component({
      standalone: true,
      imports: [TestControlComponent, ReactiveFormsModule],
      template: `<div [formGroup]="form"><input formControlName="outer" /><tn-test-control /></div>`,
    })
    class HostComponent {
      form = new FormGroup({ outer: new FormControl('') });
    }

    expect(renderHost(HostComponent).hasAttribute('data-testid')).toBe(false);
  });
});
