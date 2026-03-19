import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import type { HarnessLoader } from '@angular/cdk/testing';
import { Component, inject } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnDialogShellComponent } from './dialog-shell.component';
import { TnDialogTesting } from './dialog-testing';
import { TnDialogHarness } from './dialog.harness';
import { TnDialog } from './dialog.service';
import { TnButtonComponent } from '../button/button.component';

/* eslint-disable @angular-eslint/component-max-inline-declarations */

@Component({
  selector: 'tn-test-dialog',
  standalone: true,
  imports: [TnDialogShellComponent, TnButtonComponent],
  template: `
    <tn-dialog-shell
      [title]="data?.title ?? 'Test Dialog'"
      [showFullscreenButton]="data?.showFullscreen ?? false">
      <p>{{ data?.content ?? 'Dialog content' }}</p>
      <div tnDialogAction>
        <tn-button
          variant="outline"
          [label]="data?.cancelLabel ?? 'Cancel'"
          (click)="ref.close(false)" />
        <tn-button
          color="primary"
          [label]="data?.saveLabel ?? 'Save'"
          (click)="ref.close(true)" />
      </div>
    </tn-dialog-shell>
  `,
})
class TestDialogComponent {
  ref = inject(DialogRef);
  data = inject<Record<string, unknown>>(DIALOG_DATA, { optional: true });
}

@Component({
  selector: 'tn-test-host',
  standalone: true,
  template: '',
})
class TestHostComponent {}

/* eslint-enable @angular-eslint/component-max-inline-declarations */

describe('TnDialogHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dialogLoader: HarnessLoader;
  let tnDialog: TnDialog;
  let cdkDialog: Dialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    dialogLoader = TnDialogTesting.rootLoader(fixture);
    tnDialog = TestBed.inject(TnDialog);
    cdkDialog = TestBed.inject(Dialog);
  });

  afterEach(() => {
    cdkDialog.closeAll();
  });

  describe('harness methods', () => {
    let dialogRef: DialogRef;

    beforeEach(() => {
      dialogRef = tnDialog.open(TestDialogComponent, {
        data: {
          title: 'Edit User',
          content: 'Edit the user details below',
          cancelLabel: 'Discard',
          saveLabel: 'Save Changes',
        },
      });
      fixture.detectChanges();
    });

    it('should load harness', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(dialog).toBeTruthy();
    });

    it('should get title text', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(await dialog.getTitle()).toBe('Edit User');
    });

    it('should get content text', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(await dialog.getContentText()).toContain('Edit the user details below');
    });

    it('should close dialog via close button', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      await dialog.close();
      expect(await dialogLoader.hasHarness(TnDialogHarness)).toBe(false);
    });

    it('should click action button by exact label', async () => {
      const closedSpy = jest.fn();
      dialogRef.closed.subscribe(closedSpy);

      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      await dialog.clickActionButton('Save Changes');

      expect(closedSpy).toHaveBeenCalledWith(true);
    });

    it('should click action button by regex', async () => {
      const closedSpy = jest.fn();
      dialogRef.closed.subscribe(closedSpy);

      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      await dialog.clickActionButton(/discard/i);

      expect(closedSpy).toHaveBeenCalledWith(false);
    });

    it('should throw when clicking non-existent action button', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      await expect(dialog.clickActionButton('NonExistent')).rejects.toThrow(
        'No action button found with label matching: NonExistent',
      );
    });

    it('should get all action buttons', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      const buttons = await dialog.getActionButtons();
      expect(buttons).toHaveLength(2);
      expect(await buttons[0].getLabel()).toBe('Discard');
      expect(await buttons[1].getLabel()).toBe('Save Changes');
    });

    it('should report no fullscreen button by default', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(await dialog.hasFullscreenButton()).toBe(false);
      expect(await dialog.isFullscreen()).toBe(false);
    });

    it('should throw when toggling fullscreen without button', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      await expect(dialog.toggleFullscreen()).rejects.toThrow(
        'Dialog does not have a fullscreen button',
      );
    });
  });

  describe('fullscreen', () => {
    beforeEach(() => {
      tnDialog.open(TestDialogComponent, {
        data: { title: 'Fullscreen Dialog', showFullscreen: true },
      });
      fixture.detectChanges();
    });

    it('should detect fullscreen button', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(await dialog.hasFullscreenButton()).toBe(true);
    });

    it('should toggle fullscreen', async () => {
      const dialog = await dialogLoader.getHarness(TnDialogHarness);
      expect(await dialog.isFullscreen()).toBe(false);
      await dialog.toggleFullscreen();
      expect(await dialog.isFullscreen()).toBe(true);
      await dialog.toggleFullscreen();
      expect(await dialog.isFullscreen()).toBe(false);
    });
  });

  describe('with() filter', () => {
    it('should filter by exact title', async () => {
      tnDialog.open(TestDialogComponent, { data: { title: 'First Dialog' } });
      fixture.detectChanges();

      const dialog = await dialogLoader.getHarness(
        TnDialogHarness.with({ title: 'First Dialog' }),
      );
      expect(await dialog.getTitle()).toBe('First Dialog');
    });

    it('should filter by title regex', async () => {
      tnDialog.open(TestDialogComponent, { data: { title: 'Delete Dataset?' } });
      fixture.detectChanges();

      const dialog = await dialogLoader.getHarness(
        TnDialogHarness.with({ title: /delete/i }),
      );
      expect(await dialog.getTitle()).toBe('Delete Dataset?');
    });

    it('should return false for non-matching title', async () => {
      tnDialog.open(TestDialogComponent, { data: { title: 'Edit User' } });
      fixture.detectChanges();

      expect(
        await dialogLoader.hasHarness(TnDialogHarness.with({ title: 'NonExistent' })),
      ).toBe(false);
    });

    it('should distinguish between multiple open dialogs', async () => {
      tnDialog.open(TestDialogComponent, { data: { title: 'First Dialog' } });
      tnDialog.open(TestDialogComponent, { data: { title: 'Second Dialog' } });
      fixture.detectChanges();

      const first = await dialogLoader.getHarness(
        TnDialogHarness.with({ title: 'First Dialog' }),
      );
      const second = await dialogLoader.getHarness(
        TnDialogHarness.with({ title: 'Second Dialog' }),
      );
      expect(await first.getTitle()).toBe('First Dialog');
      expect(await second.getTitle()).toBe('Second Dialog');
    });
  });

  describe('TnDialog service', () => {
    describe('open()', () => {
      it('should open a dialog', async () => {
        tnDialog.open(TestDialogComponent);
        fixture.detectChanges();

        expect(await dialogLoader.hasHarness(TnDialogHarness)).toBe(true);
      });

      it('should apply tn-dialog-panel class', () => {
        tnDialog.open(TestDialogComponent);
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel');
        expect(panel).toBeTruthy();
      });

      it('should merge custom panelClass', () => {
        tnDialog.open(TestDialogComponent, { panelClass: 'custom-panel' });
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel.custom-panel');
        expect(panel).toBeTruthy();
      });
    });

    describe('open() panelClass merging', () => {
      it('should merge panelClass array', () => {
        tnDialog.open(TestDialogComponent, { panelClass: ['custom-a', 'custom-b'] });
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel.custom-a.custom-b');
        expect(panel).toBeTruthy();
      });
    });

    describe('openFullscreen()', () => {
      it('should apply fullscreen class', () => {
        tnDialog.openFullscreen(TestDialogComponent);
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel.tn-dialog--fullscreen');
        expect(panel).toBeTruthy();
      });

      it('should merge panelClass string into fullscreen', () => {
        tnDialog.openFullscreen(TestDialogComponent, { panelClass: 'custom-fs' });
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel.tn-dialog--fullscreen.custom-fs');
        expect(panel).toBeTruthy();
      });

      it('should merge panelClass array into fullscreen', () => {
        tnDialog.openFullscreen(TestDialogComponent, { panelClass: ['fs-a', 'fs-b'] });
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel.tn-dialog--fullscreen.fs-a.fs-b');
        expect(panel).toBeTruthy();
      });

      it('should set 100vw/100vh dimensions', () => {
        tnDialog.openFullscreen(TestDialogComponent);
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog-panel') as HTMLElement;
        expect(panel.style.width).toBe('100vw');
        expect(panel.style.height).toBe('100vh');
      });
    });

    describe('confirm()', () => {
      it('should open confirm dialog with provided title', async () => {
        void tnDialog.confirm({ title: 'Delete Dataset?' });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(
          TnDialogHarness.with({ title: 'Delete Dataset?' }),
        );
        expect(await dialog.getTitle()).toBe('Delete Dataset?');
      });

      it('should show provided message', async () => {
        void tnDialog.confirm({
          title: 'Delete?',
          message: 'This action cannot be undone.',
        });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        expect(await dialog.getContentText()).toContain('This action cannot be undone.');
      });

      it('should show default button labels', async () => {
        void tnDialog.confirm({ title: 'Confirm?' });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        const buttons = await dialog.getActionButtons();
        expect(await buttons[0].getLabel()).toBe('Cancel');
        expect(await buttons[1].getLabel()).toBe('OK');
      });

      it('should show custom button labels', async () => {
        void tnDialog.confirm({
          title: 'Delete?',
          confirmText: 'Delete',
          cancelText: 'Keep',
        });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        const buttons = await dialog.getActionButtons();
        expect(await buttons[0].getLabel()).toBe('Keep');
        expect(await buttons[1].getLabel()).toBe('Delete');
      });

      it('should resolve true when confirm is clicked', async () => {
        const confirmPromise = tnDialog.confirm({ title: 'Delete?' });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        await dialog.clickActionButton('OK');

        expect(await confirmPromise).toBe(true);
      });

      it('should resolve false when cancel is clicked', async () => {
        const confirmPromise = tnDialog.confirm({ title: 'Delete?' });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        await dialog.clickActionButton('Cancel');

        expect(await confirmPromise).toBe(false);
      });

      it('should resolve false when closed via close button', async () => {
        const confirmPromise = tnDialog.confirm({ title: 'Delete?' });
        fixture.detectChanges();

        const dialog = await dialogLoader.getHarness(TnDialogHarness);
        await dialog.close();

        expect(await confirmPromise).toBe(false);
      });

      it('should apply destructive styling', () => {
        void tnDialog.confirm({ title: 'Delete?', destructive: true });
        fixture.detectChanges();

        const panel = document.querySelector('.tn-dialog--destructive');
        expect(panel).toBeTruthy();
      });
    });
  });
});
