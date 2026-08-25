import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormListItemComponent } from './form-list-item.component';
import { TnFormListComponent } from './form-list.component';
import { TnFormListHarness } from './form-list.harness';
import { TnButtonComponent } from '../button/button.component';
import { TnIconButtonComponent } from '../icon-button/icon-button.component';
import { TnInputComponent } from '../input/input.component';

@Component({
  selector: 'tn-form-list-host',
  imports: [
    ReactiveFormsModule,
    TnButtonComponent,
    TnFormListComponent,
    TnFormListItemComponent,
    TnIconButtonComponent,
    TnInputComponent,
  ],
  templateUrl: './test-hosts/form-list-host.component.html',
})
class HostComponent {
  readonly entries = new FormArray<FormControl<string | null>>([], Validators.minLength(2));

  readonly label = signal('Allowed addresses');
  readonly tooltip = signal('');
  readonly required = signal(false);
  readonly canAdd = signal(true);
  readonly canDelete = signal(true);
  readonly disabled = signal(false);
  readonly lockFirstEntry = signal(false);
  readonly empty = signal<boolean | undefined>(undefined);
  /** Entry-level controls the consumer projects alongside the fields. */
  readonly entryActions = signal(false);

  readonly tested: number[] = [];

  testEntry(index: number): void {
    this.tested.push(index);
  }

  addEntry(): void {
    this.entries.push(new FormControl(''));
  }

  removeEntry(index: number): void {
    this.entries.removeAt(index);
  }
}

describe('TnFormListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;
  let list: TnFormListHarness;

  /**
   * Renders, after a change Angular has no way to hear about.
   *
   * WHY THIS IS NOT `fixture.detectChanges()`. The suite is zoneless (#304),
   * and a zoneless `detectChanges()` is `ApplicationRef.tick()`: it refreshes
   * the views that are DIRTY, then runs check-no-changes over the rest. What
   * marks a view dirty is a signal write it consumes, or an event listener —
   * and a `FormArray` is neither. These specs edit one straight from the test
   * body, outside the `(add)`/`(delete)` handlers a consumer pushes from, so
   * nothing is dirty: the refresh pass does nothing and the `@for` over
   * `entries.controls` creates its embedded views inside check-no-changes
   * instead, which is the NG0100 this suite spent thirteen failures on.
   *
   * `markForCheck()` stands in for the listener. It is here rather than at the
   * sites that need it because the ones that do not are not obviously safe:
   * `host.disabled.set(true)` happens to dirty the host view, so a `push()`
   * beside it renders — while `host.canDelete.set(false)`, read inside the
   * `@for` and so consumed by no view that exists yet, does not. A spec should
   * not turn on which of those it picked.
   */
  function detectChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    list = await loader.getHarness(TnFormListHarness);
  });

  describe('growing and shrinking the array', () => {
    it('starts empty, and says so', async () => {
      expect(await list.getItemCount()).toBe(0);
      expect(await list.isEmpty()).toBe(true);
      expect(await list.getEmptyMessage()).toBe('No items have been added yet.');
    });

    it('asks the consumer to append — it does not touch the array itself', async () => {
      await list.add();
      detectChanges();

      expect(host.entries.length).toBe(1);
      expect(await list.getItemCount()).toBe(1);
      expect(await list.isEmpty()).toBe(false);
    });

    it('asks the consumer to remove the entry that was pressed', async () => {
      host.entries.push(new FormControl('first'));
      host.entries.push(new FormControl('second'));
      detectChanges();

      const [first] = await list.getItems();
      await first.remove();
      detectChanges();

      expect(host.entries.value).toEqual(['second']);
    });

    it('stays quiet while the entries are still loading, if told to', async () => {
      host.empty.set(false);
      detectChanges();

      expect(await list.getItemCount()).toBe(0);
      expect(await list.isEmpty()).toBe(false);
    });

    it('goes back to the empty message when the last entry is removed', async () => {
      host.entries.push(new FormControl('only'));
      detectChanges();

      const [only] = await list.getItems();
      await only.remove();
      detectChanges();

      expect(await list.isEmpty()).toBe(true);
    });
  });

  describe('what the consumer can turn off', () => {
    it('hides Add at a maximum length', async () => {
      host.canAdd.set(false);
      detectChanges();

      expect(await list.canAdd()).toBe(false);
    });

    it('hides the remove button on an entry the form requires', async () => {
      host.entries.push(new FormControl('fixed'));
      host.canDelete.set(false);
      detectChanges();

      const [only] = await list.getItems();

      expect(await only.canRemove()).toBe(false);
    });

    it('disables Add for a list the user may not edit', async () => {
      host.disabled.set(true);
      detectChanges();

      expect(await list.isAddDisabled()).toBe(true);

      await list.add();
      detectChanges();

      expect(host.entries.length).toBe(0);
    });

    it('says the group is disabled, rather than hiding it', () => {
      host.entries.push(new FormControl('first'));
      host.disabled.set(true);
      detectChanges();

      // `aria-disabled` and not `inert`: the entries are still on screen, and a
      // screen-reader user has to be able to read the values a sighted user is
      // being shown but not allowed to edit. It sits on the `role="group"`
      // element, which is the role that supports the attribute.
      const group: HTMLElement = fixture.nativeElement.querySelector('.tn-form-list');

      expect(group.getAttribute('role')).toBe('group');
      expect(group.getAttribute('aria-disabled')).toBe('true');
      expect(fixture.nativeElement.querySelector('[inert]')).toBeNull();

      host.disabled.set(false);
      detectChanges();

      expect(group.hasAttribute('aria-disabled')).toBe(false);
    });

    it('disables each entry remove button, so the keyboard cannot delete from a locked list', async () => {
      host.entries.push(new FormControl('first'));
      detectChanges();

      const [entry] = await list.getItems();

      expect(await entry.isRemoveDisabled()).toBe(false);

      host.disabled.set(true);
      detectChanges();

      // Reached over TN_FORM_LIST_CONTEXT, so the consumer binds `disabled` on
      // the list alone and not again inside its own @for.
      expect(await entry.isRemoveDisabled()).toBe(true);

      await entry.remove();
      detectChanges();

      expect(host.entries.length).toBe(1);
    });

    it('lets one entry be locked inside an editable list', async () => {
      host.entries.push(new FormControl('first'));
      host.lockFirstEntry.set(true);
      detectChanges();

      const [entry] = await list.getItems();

      expect(await entry.isRemoveDisabled()).toBe(true);
    });
  });

  describe('telling its own controls apart from the ones the consumer projects', () => {
    beforeEach(() => {
      host.entries.push(new FormControl('first'));
      host.entryActions.set(true);
    });

    it('reports no remove button when the entry only projects other icon buttons', async () => {
      host.canDelete.set(false);
      detectChanges();

      const [only] = await list.getItems();

      expect(await only.canRemove()).toBe(false);
      await expect(only.remove()).rejects.toThrow(/no remove button/);
      expect(host.tested).toEqual([]);
    });

    it('removes through its own button, not the projected one', async () => {
      detectChanges();

      const [only] = await list.getItems();
      await only.remove();
      detectChanges();

      expect(host.entries.length).toBe(0);
      expect(host.tested).toEqual([]);
    });

    it('reports no Add when the header has none, whatever the entries project', async () => {
      host.canAdd.set(false);
      detectChanges();

      expect(await list.canAdd()).toBe(false);
      expect(await list.isAddDisabled()).toBe(false);
      await expect(list.add()).rejects.toThrow(/no add button/);
      expect(host.tested).toEqual([]);
    });

    it('adds through the header button, not an entry\'s', async () => {
      detectChanges();

      await list.add();
      detectChanges();

      expect(host.entries.length).toBe(2);
      expect(host.tested).toEqual([]);
    });
  });

  describe('naming the group', () => {
    it('names the group by its label, and nothing else in the header', () => {
      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');
      const labelId = group.getAttribute('aria-labelledby');

      expect(labelId).toBeTruthy();
      expect(fixture.nativeElement.querySelector(`#${labelId}`)?.textContent?.trim())
        .toBe('Allowed addresses');
    });

    it('names Add after the list it adds to, not a bare "Add"', () => {
      const add: HTMLElement = fixture.nativeElement.querySelector('.tn-form-list__add button');

      expect(add.getAttribute('aria-label')).toBe('Add Allowed addresses');
    });

    it('names each remove button after one entry, in the singular', async () => {
      host.entries.push(new FormControl(''));
      detectChanges();

      const remove: HTMLElement = fixture.nativeElement
        .querySelector('.tn-form-list-item__remove button');

      expect(remove.getAttribute('aria-label')).toBe('Remove address');
    });

    it('marks a required list, without putting the asterisk in the name', async () => {
      host.required.set(true);
      detectChanges();

      expect(fixture.nativeElement.querySelector('.required-asterisk')).not.toBeNull();
      expect(await list.getLabel()).toBe('Allowed addresses');
    });

    it('leaves the group unnamed rather than naming it something wrong', () => {
      host.label.set('');
      detectChanges();

      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');

      expect(group.getAttribute('aria-labelledby')).toBeNull();
    });
  });

  describe('the array-level error', () => {
    it('shows an error that belongs to the array, once it is touched', () => {
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      detectChanges();

      expect(host.entries.errors).toEqual({ minlength: expect.anything() });
      expect(fixture.nativeElement.querySelector('.tn-form-errors')?.textContent?.trim())
        .toBe('Minimum length is 2');
    });

    it('shows nothing while the array satisfies it', () => {
      host.entries.push(new FormControl(''));
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      detectChanges();

      expect(fixture.nativeElement.querySelector('.tn-form-errors')).toBeNull();
    });

    it('describes the group by the message, so tabbing in later still finds it', () => {
      // role="alert" only covers the moment it appears.
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      detectChanges();

      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');
      const message: HTMLElement = fixture.nativeElement.querySelector('.tn-form-errors');

      expect(group.getAttribute('aria-describedby')).toBe(message.id);
      expect(message.id).toBeTruthy();
    });

    it('describes the group by nothing while no message is on screen', () => {
      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');

      expect(group.getAttribute('aria-describedby')).toBeNull();
    });

    it('stops describing the group once the message goes', () => {
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      detectChanges();
      host.entries.push(new FormControl(''));
      detectChanges();

      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');

      expect(group.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('the help tooltip', () => {
    it('renders on a list with no label, rather than going with it', () => {
      host.label.set('');
      host.tooltip.set('One address per entry');
      detectChanges();

      const trigger: HTMLElement = fixture.nativeElement.querySelector('.tn-form-list__tooltip');

      expect(trigger).not.toBeNull();
      expect(trigger.getAttribute('aria-label')).toBe('One address per entry');
    });

    it('renders on a list with no label and no Add, which has no header otherwise', () => {
      host.label.set('');
      host.canAdd.set(false);
      host.tooltip.set('One address per entry');
      detectChanges();

      expect(fixture.nativeElement.querySelector('.tn-form-list__tooltip')).not.toBeNull();
    });
  });
});
