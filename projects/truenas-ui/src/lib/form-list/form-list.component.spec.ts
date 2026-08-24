import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TnFormListItemComponent } from './form-list-item.component';
import { TnFormListComponent } from './form-list.component';
import { TnFormListHarness } from './form-list.harness';
import { TnInputComponent } from '../input/input.component';

@Component({
  selector: 'tn-form-list-host',
  imports: [ReactiveFormsModule, TnFormListComponent, TnFormListItemComponent, TnInputComponent],
  templateUrl: './test-hosts/form-list-host.component.html',
})
class HostComponent {
  readonly entries = new FormArray<FormControl<string | null>>([], Validators.minLength(2));

  readonly label = signal('Allowed addresses');
  readonly required = signal(false);
  readonly canAdd = signal(true);
  readonly canDelete = signal(true);
  readonly disabled = signal(false);
  readonly empty = signal<boolean | undefined>(undefined);

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
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
      fixture.detectChanges();

      expect(host.entries.length).toBe(1);
      expect(await list.getItemCount()).toBe(1);
      expect(await list.isEmpty()).toBe(false);
    });

    it('asks the consumer to remove the entry that was pressed', async () => {
      host.entries.push(new FormControl('first'));
      host.entries.push(new FormControl('second'));
      fixture.detectChanges();

      const [first] = await list.getItems();
      await first.remove();
      fixture.detectChanges();

      expect(host.entries.value).toEqual(['second']);
    });

    it('stays quiet while the entries are still loading, if told to', async () => {
      host.empty.set(false);
      fixture.detectChanges();

      expect(await list.getItemCount()).toBe(0);
      expect(await list.isEmpty()).toBe(false);
    });

    it('goes back to the empty message when the last entry is removed', async () => {
      host.entries.push(new FormControl('only'));
      fixture.detectChanges();

      const [only] = await list.getItems();
      await only.remove();
      fixture.detectChanges();

      expect(await list.isEmpty()).toBe(true);
    });
  });

  describe('what the consumer can turn off', () => {
    it('hides Add at a maximum length', async () => {
      host.canAdd.set(false);
      fixture.detectChanges();

      expect(await list.canAdd()).toBe(false);
    });

    it('hides the remove button on an entry the form requires', async () => {
      host.entries.push(new FormControl('fixed'));
      host.canDelete.set(false);
      fixture.detectChanges();

      const [only] = await list.getItems();

      expect(await only.canRemove()).toBe(false);
    });

    it('disables Add for a list the user may not edit', async () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(await list.isAddDisabled()).toBe(true);

      await list.add();
      fixture.detectChanges();

      expect(host.entries.length).toBe(0);
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
      fixture.detectChanges();

      const remove: HTMLElement = fixture.nativeElement
        .querySelector('.tn-form-list-item__remove button');

      expect(remove.getAttribute('aria-label')).toBe('Remove address');
    });

    it('marks a required list, without putting the asterisk in the name', async () => {
      host.required.set(true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.required-asterisk')).not.toBeNull();
      expect(await list.getLabel()).toBe('Allowed addresses');
    });

    it('leaves the group unnamed rather than naming it something wrong', () => {
      host.label.set('');
      fixture.detectChanges();

      const group: HTMLElement = fixture.nativeElement.querySelector('[role="group"]');

      expect(group.getAttribute('aria-labelledby')).toBeNull();
    });
  });

  describe('the array-level error', () => {
    it('shows an error that belongs to the array, once it is touched', () => {
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      fixture.detectChanges();

      expect(host.entries.errors).toEqual({ minlength: expect.anything() });
      expect(fixture.nativeElement.querySelector('.tn-form-errors')?.textContent?.trim())
        .toBe('Minimum length is 2');
    });

    it('shows nothing while the array satisfies it', () => {
      host.entries.push(new FormControl(''));
      host.entries.push(new FormControl(''));
      host.entries.markAllAsTouched();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.tn-form-errors')).toBeNull();
    });
  });
});
