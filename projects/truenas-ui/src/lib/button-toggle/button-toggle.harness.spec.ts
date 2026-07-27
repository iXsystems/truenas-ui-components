import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnButtonToggleGroupComponent } from './button-toggle-group.component';
import { TnButtonToggleComponent } from './button-toggle.component';
import { TnButtonToggleHarness, TnButtonToggleGroupHarness } from './button-toggle.harness';

@Component({
  selector: 'tn-button-toggle-harness-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group>
      <tn-button-toggle value="bold">Bold</tn-button-toggle>
      <tn-button-toggle value="italic">Italic</tn-button-toggle>
      <tn-button-toggle value="underline" [disabled]="true">Underline</tn-button-toggle>
    </tn-button-toggle-group>

    <tn-button-toggle value="standalone">Standalone</tn-button-toggle>
  `,
})
class ButtonToggleHarnessTestComponent {}

describe('TnButtonToggleHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleHarnessTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonToggleHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('with()', () => {
    it('should find toggle by label', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
      expect(await toggle.getLabelText()).toContain('Bold');
    });

    it('should find toggle by label regex', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /italic/i }));
      expect(await toggle.getLabelText()).toContain('Italic');
    });

    it('should find all toggles', async () => {
      const toggles = await loader.getAllHarnesses(TnButtonToggleHarness);
      expect(toggles.length).toBe(4);
    });
  });

  describe('getLabelText()', () => {
    it('should return the label text', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.getLabelText()).toContain('Standalone');
    });
  });

  describe('isChecked()', () => {
    it('should return false when unchecked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should return true after toggling', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(true);
    });
  });

  describe('isDisabled()', () => {
    it('should return false for enabled toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
      expect(await toggle.isDisabled()).toBe(false);
    });

    it('should return true for disabled toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Underline/ }));
      expect(await toggle.isDisabled()).toBe(true);
    });
  });

  describe('toggle()', () => {
    it('should toggle the state', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);

      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.toggle();
      expect(await toggle.isChecked()).toBe(false);
    });
  });

  describe('check()', () => {
    it('should check the toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);
    });

    it('should be a no-op if already checked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);
    });
  });

  describe('uncheck()', () => {
    it('should uncheck the toggle', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      await toggle.check();
      expect(await toggle.isChecked()).toBe(true);

      await toggle.uncheck();
      expect(await toggle.isChecked()).toBe(false);
    });

    it('should be a no-op if already unchecked', async () => {
      const toggle = await loader.getHarness(TnButtonToggleHarness.with({ label: /Standalone/ }));
      expect(await toggle.isChecked()).toBe(false);

      await toggle.uncheck();
      expect(await toggle.isChecked()).toBe(false);
    });
  });
});

describe('TnButtonToggleGroupHarness', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleHarnessTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonToggleHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('getToggles()', () => {
    it('should return all toggles in the group', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const toggles = await group.getToggles();
      expect(toggles.length).toBe(3);
    });
  });

  describe('getCheckedToggle()', () => {
    it('should return null when no toggle is checked', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const checked = await group.getCheckedToggle();
      expect(checked).toBeNull();
    });

    it('should return the checked toggle', async () => {
      const group = await loader.getHarness(TnButtonToggleGroupHarness);
      const toggles = await group.getToggles();
      await toggles[0].toggle();

      const checked = await group.getCheckedToggle();
      expect(checked).not.toBeNull();
      expect(await checked!.getLabelText()).toContain('Bold');
    });
  });
});

// --- ControlValueAccessor integration tests ---

@Component({
  selector: 'tn-button-toggle-cva-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group [formControl]="control">
      <tn-button-toggle value="bold">Bold</tn-button-toggle>
      <tn-button-toggle value="italic">Italic</tn-button-toggle>
      <tn-button-toggle value="underline">Underline</tn-button-toggle>
    </tn-button-toggle-group>

    <tn-button-toggle-group [formControl]="multiControl" [multiple]="true">
      <tn-button-toggle value="a">A</tn-button-toggle>
      <tn-button-toggle value="b">B</tn-button-toggle>
      <tn-button-toggle value="c">C</tn-button-toggle>
    </tn-button-toggle-group>
  `,
})
class ButtonToggleCvaTestComponent {
  control = new FormControl<string | null>(null);
  multiControl = new FormControl<string[]>([]);
}

@Component({
  selector: 'tn-button-toggle-initial-value-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group [formControl]="control">
      <tn-button-toggle value="alert">Alert</tn-button-toggle>
      <tn-button-toggle value="warn">Warn</tn-button-toggle>
      <tn-button-toggle value="info">Info</tn-button-toggle>
    </tn-button-toggle-group>

    <tn-button-toggle-group [formControl]="multiControl" [multiple]="true">
      <tn-button-toggle value="x">X</tn-button-toggle>
      <tn-button-toggle value="y">Y</tn-button-toggle>
      <tn-button-toggle value="z">Z</tn-button-toggle>
    </tn-button-toggle-group>
  `,
})
class ButtonToggleInitialValueTestComponent {
  control = new FormControl<string | null>('alert');
  multiControl = new FormControl<string[]>(['x', 'z']);
}

@Component({
  selector: 'tn-button-toggle-for-loop-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group [formControl]="control">
      @for (option of options; track option.value) {
        <tn-button-toggle [value]="option.value">{{ option.label }}</tn-button-toggle>
      }
    </tn-button-toggle-group>
  `,
})
class ButtonToggleForLoopTestComponent {
  control = new FormControl<string | null>('alert');
  options = [
    { value: 'alert', label: 'Alert' },
    { value: 'warn', label: 'Warn' },
    { value: 'info', label: 'Info' },
  ];
}

describe('TnButtonToggleGroup — ControlValueAccessor', () => {
  let fixture: ComponentFixture<ButtonToggleCvaTestComponent>;
  let component: ButtonToggleCvaTestComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleCvaTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonToggleCvaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should propagate the primitive value to FormControl on click', async () => {
    const bold = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
    await bold.check();
    fixture.detectChanges();

    expect(component.control.value).toBe('bold');
  });

  it('should update the checked toggle when FormControl value changes programmatically', async () => {
    component.control.setValue('italic');
    fixture.detectChanges();

    const group = await loader.getHarness(TnButtonToggleGroupHarness);
    const checked = await group.getCheckedToggle();
    expect(checked).not.toBeNull();
    expect(await checked!.getLabelText()).toContain('Italic');
  });

  it('should set FormControl to null when the selected toggle is deselected', async () => {
    const bold = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
    await bold.check();
    fixture.detectChanges();
    expect(component.control.value).toBe('bold');

    // Click again to deselect in radio mode
    await bold.toggle();
    fixture.detectChanges();
    expect(component.control.value).toBeNull();
  });

  it('should replace the previous value when a different toggle is clicked', async () => {
    const bold = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Bold' }));
    const italic = await loader.getHarness(TnButtonToggleHarness.with({ label: 'Italic' }));

    await bold.check();
    fixture.detectChanges();
    expect(component.control.value).toBe('bold');

    await italic.check();
    fixture.detectChanges();
    expect(component.control.value).toBe('italic');
  });

  it('should propagate an array of primitive values in multiple mode', async () => {
    const groups = await loader.getAllHarnesses(TnButtonToggleGroupHarness);
    const multiGroup = groups[1];
    const toggles = await multiGroup.getToggles();

    await toggles[0].check(); // A
    await toggles[2].check(); // C
    fixture.detectChanges();

    expect(component.multiControl.value).toEqual(['a', 'c']);
  });
});

describe('TnButtonToggleGroup — initial FormControl value', () => {
  let fixture: ComponentFixture<ButtonToggleInitialValueTestComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleInitialValueTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonToggleInitialValueTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should check the correct toggle when FormControl has an initial value', async () => {
    const group = (await loader.getAllHarnesses(TnButtonToggleGroupHarness))[0];
    const checked = await group.getCheckedToggle();
    expect(checked).not.toBeNull();
    expect(await checked!.getLabelText()).toContain('Alert');
  });

  it('should leave other toggles unchecked when FormControl has an initial value', async () => {
    const group = (await loader.getAllHarnesses(TnButtonToggleGroupHarness))[0];
    const toggles = await group.getToggles();

    expect(await toggles[0].isChecked()).toBe(true);
    expect(await toggles[1].isChecked()).toBe(false);
    expect(await toggles[2].isChecked()).toBe(false);
  });

  it('should check the correct toggles when multiple FormControl has initial values', async () => {
    const group = (await loader.getAllHarnesses(TnButtonToggleGroupHarness))[1];
    const toggles = await group.getToggles();

    expect(await toggles[0].isChecked()).toBe(true);  // X
    expect(await toggles[1].isChecked()).toBe(false);  // Y
    expect(await toggles[2].isChecked()).toBe(true);   // Z
  });
});

describe('TnButtonToggleGroup — initial FormControl value with @for loop', () => {
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleForLoopTestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ButtonToggleForLoopTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should check the correct toggle when toggles are produced by @for', async () => {
    const group = await loader.getHarness(TnButtonToggleGroupHarness);
    const checked = await group.getCheckedToggle();
    expect(checked).not.toBeNull();
    expect(await checked!.getLabelText()).toContain('Alert');
  });
});

@Component({
  selector: 'tn-button-toggle-checked-style-test',
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-button-toggle-group
      [checkedBg]="bg"
      [checkedColor]="color"
      [checkedBorder]="border">
      <tn-button-toggle value="a">A</tn-button-toggle>
      <tn-button-toggle value="b">B</tn-button-toggle>
    </tn-button-toggle-group>
  `,
})
class ButtonToggleCheckedStyleTestComponent {
  bg: string | null = null;
  color: string | null = null;
  border: string | null = null;
}

describe('TnButtonToggleGroup — checked style inputs', () => {
  let fixture: ComponentFixture<ButtonToggleCheckedStyleTestComponent>;
  let component: ButtonToggleCheckedStyleTestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonToggleCheckedStyleTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonToggleCheckedStyleTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should leave CSS custom properties unset when inputs are null', () => {
    const groupEl = fixture.nativeElement.querySelector('tn-button-toggle-group') as HTMLElement;
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-bg')).toBe('');
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-color')).toBe('');
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-border')).toBe('');
  });

  it('should set the CSS custom properties from inputs', () => {
    component.bg = '#71BF44';
    component.color = '#ffffff';
    component.border = '#5fa036';
    fixture.detectChanges();

    const groupEl = fixture.nativeElement.querySelector('tn-button-toggle-group') as HTMLElement;
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-bg')).toBe('#71BF44');
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-color')).toBe('#ffffff');
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-border')).toBe('#5fa036');
  });

  it('should accept CSS var() references', () => {
    component.bg = 'var(--tn-primary)';
    fixture.detectChanges();

    const groupEl = fixture.nativeElement.querySelector('tn-button-toggle-group') as HTMLElement;
    expect(groupEl.style.getPropertyValue('--tn-button-toggle-checked-bg')).toBe('var(--tn-primary)');
  });
});

@Component({
  standalone: true,
  imports: [TnButtonToggleComponent, TnButtonToggleGroupComponent],
  template: `<tn-button-toggle-group testId="format"><tn-button-toggle testId="bold" value="b">B</tn-button-toggle></tn-button-toggle-group>`,
})
class ButtonToggleTestIdHostComponent {}

describe('TnButtonToggle test-id prefixes', () => {
  it('prefixes the group (button-toggle-group-) and each toggle (button-toggle-)', async () => {
    await TestBed.configureTestingModule({ imports: [ButtonToggleTestIdHostComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ButtonToggleTestIdHostComponent);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('div.tn-button-toggle-group') as HTMLElement;
    const toggleBtn = fixture.nativeElement.querySelector('.tn-button-toggle__button') as HTMLElement;
    expect(group.getAttribute('data-testid')).toBe('button-toggle-group-format');
    expect(toggleBtn.getAttribute('data-testid')).toBe('button-toggle-bold');
  });
});
