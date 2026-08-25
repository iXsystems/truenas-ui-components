import { DialogRef } from '@angular/cdk/dialog';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TN_DIALOG_SHELL_DEFAULT_LABEL, TnDialogShellComponent } from './dialog-shell.component';

/**
 * Guards `tn-dialog-shell` against being rendered OUTSIDE an open dialog.
 *
 * Consumers test a dialog component by creating it directly and satisfying its
 * `DialogRef` with a mock provider — the shape spectator's `mockProvider` and
 * Angular's own `useValue` stubs produce: the methods are there, `config` is
 * not. That violates `DialogRef`'s type, which is why nothing warns at compile
 * time, and it is also what most of the dialog specs downstream of this library
 * do. Reading `ref.config` unguarded threw for every one of them, before the
 * component had rendered anything.
 *
 * The naming routes themselves are covered against real, opened dialogs in
 * `dialog-shell-a11y.spec.ts`; this file only pins the config-less case.
 */

@Component({
  selector: 'tn-mocked-ref-host',
  imports: [TnDialogShellComponent],
  template: `
    <tn-dialog-shell [title]="title()" [ariaLabel]="ariaLabel()">
      <p>Content</p>
    </tn-dialog-shell>
  `,
})
class MockedRefHostComponent {
  readonly title = signal('');
  readonly ariaLabel = signal<string | null>(null);
}

describe('tn-dialog-shell with a mocked DialogRef', () => {
  let warn: jest.SpyInstance;

  /** Applies `setup` BEFORE the first render, so the naming runs once, with it. */
  function render(setup: (host: MockedRefHostComponent) => void = () => undefined): void {
    const fixture = TestBed.createComponent(MockedRefHostComponent);
    setup(fixture.componentInstance);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [MockedRefHostComponent],
      // No `config`, exactly as a mock provider leaves it.
      providers: [{ provide: DialogRef, useValue: { close: jest.fn() } }],
    }).compileComponents();
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('renders instead of throwing when the ref carries no config', () => {
    expect(() => render()).not.toThrow();
  });

  it('still names an untitled shell from the fallback', () => {
    render();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining(TN_DIALOG_SHELL_DEFAULT_LABEL));
  });

  it('still takes the name from its own ariaLabel input', () => {
    render((host) => host.ariaLabel.set('Restart SMB service'));

    expect(warn).not.toHaveBeenCalled();
  });

  it('still takes the name from its own title', () => {
    render((host) => host.title.set('Restart SMB service'));

    expect(warn).not.toHaveBeenCalled();
  });
});
