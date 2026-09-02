import { OverlayContainer } from '@angular/cdk/overlay';
import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { TnGroupAutocompleteComponent } from './group-autocomplete.component';
import { TnGroupChipsComponent } from './group-chips.component';
import { TnUserAutocompleteComponent } from './user-autocomplete.component';
import { TnUserChipsComponent } from './user-chips.component';
import {
  TN_USER_DIRECTORY,
  type TnDirectoryQuery,
  type TnPrincipalOption,
  type TnUserDirectory,
} from './user-directory';
import {
  TnGroupChipsHarness,
  TnUserAutocompleteHarness,
} from './user-directory.harness';
import { TnFormFieldComponent } from '../form-field/form-field.component';

/**
 * The four user/group fields, against a stub directory.
 *
 * These are the components that replaced five near-identical webui wrappers, so
 * what matters here is the contract each of those wrappers carried: the value
 * reaches a form control through two levels of `ControlValueAccessor`, a typed
 * name that does not exist is rejected, and an edit form does not open already
 * showing errors for values it just loaded.
 */

const users = ['root', 'operator', 'admin'];
const groups = ['wheel', 'builtin_administrators'];

class StubDirectory implements TnUserDirectory {
  readonly pageSize = 50;

  /** Every `directoryOptions` bag the field passed through. */
  seenOptions: TnDirectoryQuery[] = [];

  /** Swappable, so a spec can make a lookup fail. */
  queryUsersImpl: (search: string) => Observable<TnPrincipalOption[]> = (search) => of(
    users.filter((name) => name.startsWith(search)).map((name) => ({ label: name, value: name })),
  );

  createUserImpl: () => Observable<TnPrincipalOption | null> = () => of(null);

  queryUsers(search: string, page: number, options: TnDirectoryQuery): Observable<TnPrincipalOption[]> {
    this.seenOptions.push(options);
    return this.queryUsersImpl(search);
  }

  queryGroups(search: string, page: number, options: TnDirectoryQuery): Observable<TnPrincipalOption[]> {
    this.seenOptions.push(options);
    return of(groups.filter((name) => name.startsWith(search)).map((name) => ({ label: name, value: name })));
  }

  userExists(username: string): Observable<boolean> {
    return of(users.includes(username));
  }

  groupExists(groupName: string): Observable<boolean> {
    return of(groups.includes(groupName));
  }

  createUser(options: TnDirectoryQuery): Observable<TnPrincipalOption | null> {
    this.seenOptions.push(options);
    return this.createUserImpl();
  }
}

@Component({
  selector: 'tn-directory-host',
  standalone: true,
  imports: [
    TnUserAutocompleteComponent,
    TnGroupAutocompleteComponent,
    TnUserChipsComponent,
    TnGroupChipsComponent,
    TnFormFieldComponent,
    ReactiveFormsModule,
  ],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <form [formGroup]="form">
      <tn-form-field label="Owner">
        <tn-user-autocomplete
          formControlName="owner"
          [allowCreate]="allowCreate()"
          [directoryOptions]="directoryOptions()"
          [extraOptions]="extraOptions()"
          [debounce]="0" />
      </tn-form-field>

      <tn-form-field label="Group">
        <tn-group-autocomplete formControlName="group" [debounce]="0" />
      </tn-form-field>

      <tn-form-field label="Users">
        <tn-user-chips formControlName="userList" [debounce]="0" />
      </tn-form-field>

      <tn-form-field label="Groups">
        <tn-group-chips formControlName="groupList" [debounce]="0" />
      </tn-form-field>
    </form>
  `,
})
class DirectoryHostComponent {
  form = new FormGroup({
    owner: new FormControl<string | null>(null),
    group: new FormControl<string | null>(null),
    userList: new FormControl<string[]>([]),
    groupList: new FormControl<string[]>([]),
  });

  get owner() { return this.form.controls.owner; }
  get groupList() { return this.form.controls.groupList; }

  allowCreate = signal(false);
  directoryOptions = signal<TnDirectoryQuery>({});
  extraOptions = signal<TnPrincipalOption[]>([]);
}

describe('tn-user-* / tn-group-* directory fields', () => {
  let fixture: ComponentFixture<DirectoryHostComponent>;
  let host: DirectoryHostComponent;
  let loader: HarnessLoader;
  let directory: StubDirectory;

  /** Let the zero-length validation timer and the stub's `of()` settle. */
  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    directory = new StubDirectory();

    await TestBed.configureTestingModule({
      imports: [DirectoryHostComponent],
      providers: [{ provide: TN_USER_DIRECTORY, useValue: directory }],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectoryHostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  describe('value plumbing', () => {
    it('commits a picked user through both accessors to the form control', async () => {
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();

      expect(await owner.getOptions()).toEqual(users);

      await owner.selectOption('operator');

      expect(host.owner.value).toBe('operator');
    });

    it('renders a value written before the inner control existed', async () => {
      // The forms layer hands a CVA its value while setting the directive up,
      // which is before the inner view is created — the buffered replay is what
      // keeps an edit form from opening blank.
      const owner = await loader.getHarness(TnUserAutocompleteHarness);

      expect(await owner.getInputValue()).toBe('');

      host.owner.setValue('root');
      await settle();

      expect(await owner.getInputValue()).toBe('root');
    });

    it('commits a typed custom value on blur', async () => {
      // The draft has to survive every change-detection pass between the
      // keystroke and the blur: the effect that registers the inner control
      // re-runs constantly, and replaying `writeValue` on each run would wipe
      // the text, leaving nothing to commit and a field that silently refuses
      // everything typed into it.
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();
      await owner.setInputValue('typed-name');
      fixture.detectChanges();
      await owner.blur();
      await settle();

      expect(host.owner.value).toBe('typed-name');
      expect(await owner.getInputValue()).toBe('typed-name');
    });

    it('reflects the disabled state of the form control', async () => {
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      host.owner.disable();
      await settle();

      expect(await owner.isDisabled()).toBe(true);
    });

    it('commits chips to a list-valued control', async () => {
      const groupChips = await loader.getHarness(TnGroupChipsHarness);
      await groupChips.addChip('wheel');

      expect(host.groupList.value).toEqual(['wheel']);
    });
  });

  describe('test ids', () => {
    it('stamps the inner control from the bound control name', () => {
      // The inner control has no NgControl of its own — this field claimed it —
      // so without the base being resolved here and passed down, every
      // data-test on a user/group field would silently disappear.
      const input = fixture.nativeElement
        .querySelector('tn-user-autocomplete .tn-autocomplete__input') as HTMLElement;

      expect(input.getAttribute('data-testid')).toBe('autocomplete-owner');
    });
  });

  describe('[extraOptions]', () => {
    it('lists a pinned option ahead of the fetched page, without duplicating it', async () => {
      // A value already on the record, resolved to its name elsewhere: the
      // search cannot produce it, but the field still has to name it.
      host.extraOptions.set([
        { label: 'archived-user', value: 4242 },
        { label: 'root', value: 'root' },
      ]);
      fixture.detectChanges();

      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();

      expect(await owner.getOptions()).toEqual(['archived-user', 'root', 'operator', 'admin']);
    });
  });

  describe('directoryOptions', () => {
    it('passes the app-defined bag through to the directory verbatim', async () => {
      host.directoryOptions.set({ localOnly: true, valueField: 'id' });
      fixture.detectChanges();

      await (await loader.getHarness(TnUserAutocompleteHarness)).focus();

      expect(directory.seenOptions).toContainEqual({ localOnly: true, valueField: 'id' });
    });
  });

  describe('existence validation', () => {
    it('does not flag a value the form was opened with', async () => {
      // Attaching the validator must not RUN it. A parent patches its form in
      // its own ngOnInit, which is before this field's — so an edit form opens
      // showing the loaded value plainly, not as an error. A fresh fixture,
      // because the shared one has already initialized its fields.
      const fresh = TestBed.createComponent(DirectoryHostComponent);
      fresh.componentInstance.form.controls.owner.setValue('does-not-exist');

      fresh.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fresh.detectChanges();
      await fresh.whenStable();

      expect(fresh.componentInstance.form.controls.owner.errors).toBeNull();
    });

    it('rejects a typed user that the directory does not have', async () => {
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();
      await owner.setInputValue('ghost');
      await owner.blur();
      await settle();

      expect(host.owner.errors?.userDoesNotExist).toEqual({
        message: 'User "ghost" does not exist',
      });
    });

    it('accepts a typed user that does exist', async () => {
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();
      await owner.setInputValue('admin');
      await owner.blur();
      await settle();

      expect(host.owner.errors).toBeNull();
    });

    it('names every missing group in one message', async () => {
      const groupChips = await loader.getHarness(TnGroupChipsHarness);
      await groupChips.addChip('wheel');
      await groupChips.addChip('ghost-a');
      await groupChips.addChip('ghost-b');
      await settle();

      expect(host.groupList.errors?.groupsDoNotExist).toEqual({
        message: 'The following groups do not exist: ghost-a, ghost-b',
      });
    });

    it('does not flag a name when the existence lookup itself fails', async () => {
      // A transport error is not evidence that a real user is wrong.
      jest.spyOn(directory, 'userExists').mockReturnValue(throwError(() => new Error('offline')));

      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();
      await owner.setInputValue('ghost');
      await owner.blur();
      await settle();

      expect(host.owner.errors).toBeNull();
    });
  });

  describe('[allowCreate]', () => {
    it('offers no create row by default', async () => {
      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();

      expect(await owner.getOptions()).toEqual(users);
    });

    it('pins the create row and selects whoever the flow returns', async () => {
      host.allowCreate.set(true);
      directory.createUserImpl = () => of({ label: 'newbie', value: 'newbie' });
      fixture.detectChanges();

      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();

      expect(await owner.getOptions()).toEqual(['Add New', ...users]);

      await owner.selectOption('Add New');
      await settle();

      expect(host.owner.value).toBe('newbie');
    });

    it('leaves the previous selection alone when the create flow is dismissed', async () => {
      host.allowCreate.set(true);
      directory.createUserImpl = () => of(null);
      fixture.detectChanges();

      const owner = await loader.getHarness(TnUserAutocompleteHarness);
      await owner.focus();
      await owner.selectOption('root');
      await settle();

      await owner.focus();
      await owner.selectOption('Add New');
      await settle();

      expect(host.owner.value).toBe('root');
      expect(await owner.getInputValue()).toBe('root');
    });
  });
});
