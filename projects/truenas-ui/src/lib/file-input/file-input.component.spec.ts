import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TnFileInputComponent } from './file-input.component';
import { TnFileInputHarness } from './file-input.harness';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnFileInputComponent, ReactiveFormsModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-file-input
      testId="main"
      [buttonLabel]="buttonLabel()"
      [accept]="accept()"
      [multiple]="multiple()"
      [disabled]="disabled()"
      [showFileName]="showFileName()"
      [formControl]="control"
      (selectionChange)="onSelectionChange($event)" />
  `
})
class TestHostComponent {
  buttonLabel = signal('Choose File');
  accept = signal<string | undefined>(undefined);
  multiple = signal(false);
  disabled = signal(false);
  showFileName = signal(true);
  control = new FormControl<File | File[] | null>(null);
  lastEmitted: File | File[] | null | undefined = undefined;
  onSelectionChange(value: File | File[] | null): void {
    this.lastEmitted = value;
  }
}

/** Forces the native input to report `files` and fires a `change` event. */
function selectFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
  input.dispatchEvent(new Event('change'));
}

describe('TnFileInputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const getContainer = (): HTMLElement =>
    fixture.nativeElement.querySelector('[data-testid="file-input-main"]');

  const getButton = (): HTMLButtonElement =>
    getContainer().querySelector('.tn-file-input__button .storybook-button') as HTMLButtonElement;

  const getNative = (): HTMLInputElement =>
    getContainer().querySelector('input[type="file"]') as HTMLInputElement;

  const getFilename = (): HTMLElement | null =>
    getContainer().querySelector('.tn-file-input__filename');

  const getAnnouncer = (): HTMLElement =>
    getContainer().querySelector('.tn-file-input__announcer') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and renders the trigger button', () => {
    expect(getButton()).toBeTruthy();
    expect(getButton().textContent?.trim()).toBe('Choose File');
  });

  it('uses a custom button label', () => {
    host.buttonLabel.set('Upload');
    fixture.detectChanges();
    expect(getButton().textContent?.trim()).toBe('Upload');
  });

  it('forwards accept and multiple to the native input', () => {
    host.accept.set('.tar,.txt');
    host.multiple.set(true);
    fixture.detectChanges();
    expect(getNative().getAttribute('accept')).toBe('.tar,.txt');
    expect(getNative().multiple).toBe(true);
  });

  it('shows the empty-state text when nothing is selected', () => {
    expect(getFilename()?.textContent?.trim()).toBe('No file chosen');
    expect(getFilename()?.classList).toContain('tn-file-input__filename--empty');
  });

  it('hides the file name when showFileName is false', () => {
    host.showFileName.set(false);
    fixture.detectChanges();
    expect(getFilename()).toBeNull();
  });

  it('announces the selection to screen readers even when the file name is hidden', () => {
    host.showFileName.set(false);
    fixture.detectChanges();
    expect(getAnnouncer().getAttribute('aria-live')).toBe('polite');
    expect(getAnnouncer().textContent?.trim()).toBe('');

    selectFiles(getNative(), [new File(['data'], 'report.pdf')]);
    fixture.detectChanges();
    expect(getAnnouncer().textContent?.trim()).toBe('report.pdf');
  });

  it('opens the native dialog when the button is clicked', () => {
    const spy = jest.spyOn(getNative(), 'click');
    getButton().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('does not open the dialog when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    const spy = jest.spyOn(getNative(), 'click');
    getButton().click();
    expect(spy).not.toHaveBeenCalled();
    expect(getButton().disabled).toBe(true);
    expect(getNative().disabled).toBe(true);
  });

  it('emits a single File and updates the form value on selection', () => {
    const file = new File(['data'], 'report.pdf', { type: 'application/pdf' });
    selectFiles(getNative(), [file]);
    fixture.detectChanges();

    expect(host.lastEmitted).toBe(file);
    expect(host.control.value).toBe(file);
    expect(getFilename()?.textContent?.trim()).toBe('report.pdf');
    expect(getFilename()?.classList).not.toContain('tn-file-input__filename--empty');
  });

  it('emits an array of Files when multiple is enabled', () => {
    host.multiple.set(true);
    fixture.detectChanges();
    const a = new File(['a'], 'a.txt');
    const b = new File(['b'], 'b.txt');
    selectFiles(getNative(), [a, b]);
    fixture.detectChanges();

    expect(host.lastEmitted).toEqual([a, b]);
    expect(host.control.value).toEqual([a, b]);
    expect(getFilename()?.textContent?.trim()).toBe('a.txt, b.txt');
  });

  it('clears the selection when the form value is reset', () => {
    const file = new File(['data'], 'report.pdf');
    selectFiles(getNative(), [file]);
    fixture.detectChanges();
    expect(getFilename()?.textContent?.trim()).toBe('report.pdf');

    host.control.reset();
    fixture.detectChanges();
    expect(getFilename()?.textContent?.trim()).toBe('No file chosen');
    expect(getNative().value).toBe('');
  });

  it('reflects the form control disabled state', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(getButton().disabled).toBe(true);
    expect(getNative().disabled).toBe(true);
  });

  it('marks the control as touched when focus leaves it', () => {
    expect(host.control.touched).toBe(false);
    getContainer().dispatchEvent(new FocusEvent('focusout'));
    expect(host.control.touched).toBe(true);
  });

  it('clears the native value before opening so re-picking the same file fires change', () => {
    const native = getNative();
    const clickSpy = jest.spyOn(native, 'click');
    const valueSetter = jest.fn();
    Object.defineProperty(native, 'value', { configurable: true, get: () => '', set: valueSetter });

    getButton().click();

    expect(valueSetter).toHaveBeenCalledWith('');
    expect(clickSpy).toHaveBeenCalled();
  });

  describe('harness', () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('reads the button text', async () => {
      const harness = await loader.getHarness(TnFileInputHarness);
      expect(await harness.getButtonText()).toBe('Choose File');
    });

    it('reports the empty file-name state', async () => {
      const harness = await loader.getHarness(TnFileInputHarness);
      expect(await harness.hasFile()).toBe(false);
      expect(await harness.getFileName()).toBe('No file chosen');
    });

    it('reports disabled state', async () => {
      host.disabled.set(true);
      fixture.detectChanges();
      const harness = await loader.getHarness(TnFileInputHarness);
      expect(await harness.isDisabled()).toBe(true);
    });

    it('finds by testId and reads it back', async () => {
      const harness = await loader.getHarness(
        TnFileInputHarness.with({ testId: 'file-input-main' })
      );
      expect(await harness.getTestId()).toBe('file-input-main');
    });
  });
});
