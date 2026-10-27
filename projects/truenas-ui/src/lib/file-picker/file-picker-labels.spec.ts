import { OverlayContainer } from '@angular/cdk/overlay';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_FILE_PICKER_DEFAULT_LABELS, TN_FILE_PICKER_LABELS, type TnFilePickerLabels } from './file-picker-labels';
import { TnFilePickerComponent } from './file-picker.component';
import { TnFilePickerHarness } from './file-picker.harness';
import type { FilePickerCallbacks, FilePickerCreateAction, FileSystemItem } from './file-picker.interfaces';

/**
 * The app-wide labels for `tn-file-picker` and its popup: everything the
 * picker renders or announces comes from `TN_FILE_PICKER_LABELS`, an explicit
 * `[placeholder]` other than the English default still wins, and a
 * signal-valued token re-renders when the app switches language.
 */

@Component({
  selector: 'tn-file-picker-labels-host',
  standalone: true,
  imports: [TnFilePickerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<tn-file-picker [multiSelect]="true" [placeholder]="placeholder()" [rootPath]="rootPath()"
    [callbacks]="callbacks" [createActions]="actions()" />`,
})
class LabelsHostComponent {
  readonly picker = viewChild.required(TnFilePickerComponent);
  placeholder = signal(TN_FILE_PICKER_DEFAULT_LABELS.placeholder);
  rootPath = signal<string | undefined>(undefined);
  items: FileSystemItem[] = [
    { path: '/mnt/tank', name: 'tank', type: 'dataset', modified: new Date() },
    { path: '/mnt/old.txt', name: 'old.txt', type: 'file', modified: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ];

  callbacks: FilePickerCallbacks = { getChildren: () => Promise.resolve(this.items) };
  actions = signal<FilePickerCreateAction[]>([
    { id: 'folder', label: 'Dossier', create: () => Promise.resolve('/mnt/x') },
  ]);
}

describe('TnFilePickerComponent labels', () => {
  // Every key is overridden (no spread of the English defaults), so a string
  // that stops coming from the token shows up as English in an assertion
  const french: TnFilePickerLabels = {
    placeholder: 'Choisir un fichier',
    openPicker: 'Ouvrir le sélecteur',
    breadcrumb: 'Chemin',
    navigateTo: (path) => `Aller à ${path}`,
    loading: 'Chargement…',
    noItems: 'Aucun élément',
    selectColumn: 'Sélection',
    selectItem: (name) => `Choisir ${name}`,
    openItem: (name) => `Ouvrir ${name}`,
    nameColumn: 'Nom',
    sizeColumn: 'Taille',
    modifiedColumn: 'Modifié',
    itemsSelected: (count) => `${count} sélectionné(s)`,
    currentDirectorySelected: 'Dossier courant',
    noItemsSelected: 'Rien de sélectionné',
    clearSelection: 'Effacer',
    select: 'Choisir',
    inlineCreateName: (actionLabel) => `Nom : ${actionLabel}`,
    inlineCreateFailed: 'Échec de la création',
    today: (time) => `Aujourd'hui ${time}`,
    yesterday: (time) => `Hier ${time}`,
    pathOutsideRoot: (root) => `Hors de ${root}`,
    invalidPath: (path) => `Chemin invalide : ${path}`,
    pathValidationFailed: 'Échec de la validation',
    loadFailed: 'Échec du chargement',
    createFailed: 'Échec de la création de l’élément',
    createdOutsideRoot: (root) => `Créé hors de ${root}`,
  };

  let fixture: ComponentFixture<LabelsHostComponent>;
  let overlay: HTMLElement;

  async function setup(labels?: TnFilePickerLabels | ReturnType<typeof signal<TnFilePickerLabels>>): Promise<void> {
    TestBed.configureTestingModule({
      imports: [LabelsHostComponent],
      providers: labels ? [{ provide: TN_FILE_PICKER_LABELS, useValue: labels }] : [],
    });
    fixture = TestBed.createComponent(LabelsHostComponent);
    fixture.detectChanges();
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  }

  async function open(): Promise<void> {
    fixture.componentInstance.picker().openFilePicker();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function input(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.tn-file-picker-input')!;
  }

  function text(selector: string): string {
    return overlay.querySelector(selector)?.textContent?.trim() ?? '';
  }

  function collectErrors(): string[] {
    const errors: string[] = [];
    fixture.componentInstance.picker().error.subscribe((error) => errors.push(error.message));
    return errors;
  }

  async function commitTypedPath(path: string): Promise<void> {
    input().value = path;
    input().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  afterEach(() => fixture.componentInstance.picker().close());

  it('renders the English defaults without a provider', async () => {
    await setup();
    await open();

    expect(input().placeholder).toBe('Select file or folder');
    expect(text('.selection-count')).toBe('Current directory selected');
    expect(overlay.querySelector('.tn-file-picker-breadcrumb')?.getAttribute('aria-label')).toBe('File path');
  });

  it('renders every string of the picker and popup from the token', async () => {
    await setup(french);
    await open();

    expect(input().placeholder).toBe('Choisir un fichier');
    expect((fixture.nativeElement as HTMLElement).querySelector('.tn-file-picker-toggle')?.getAttribute('aria-label'))
      .toBe('Ouvrir le sélecteur');
    expect(overlay.querySelector('.tn-file-picker-breadcrumb')?.getAttribute('aria-label')).toBe('Chemin');
    const headers = Array.from(overlay.querySelectorAll('th')).map((th) => th.textContent?.trim()).filter(Boolean);
    expect(headers).toEqual(expect.arrayContaining(['Sélection', 'Nom', 'Taille', 'Modifié']));
    expect(overlay.querySelector('[aria-label="Ouvrir tank"]')).not.toBeNull();
    expect(overlay.querySelector('input[type="checkbox"][aria-label="Choisir tank"]')).not.toBeNull();
    expect(overlay.textContent).toMatch(/Aujourd'hui \d/);
    expect(overlay.textContent).toMatch(/Hier \d/);
    expect(text('.selection-count')).toBe('Dossier courant');

    fixture.componentInstance.picker().onItemClick(fixture.componentInstance.items[0]);
    fixture.detectChanges();
    expect(text('.selection-count')).toBe('1 sélectionné(s)');
    expect(text('.footer-selection tn-button')).toBe('Effacer');
    expect(text('.footer-actions tn-button:last-child')).toBe('Choisir');
  });

  it('words the empty listing and the errors from the token', async () => {
    await setup(french);
    // Not an Error, so the picker words the failure itself.
    fixture.componentInstance.callbacks.getChildren = () => Promise.reject(new Map());
    await open();

    expect(text('.tn-file-picker-error .error-text')).toBe('Échec du chargement');
    expect(overlay.textContent).toContain('Aucun élément');

    const errors = collectErrors();
    await fixture.componentInstance.picker().selectPath('/elsewhere');
    expect(errors).toEqual(['Hors de /mnt']);
  });

  it('words the typed-path and create-action errors from the token', async () => {
    await setup(french);
    const host = fixture.componentInstance;
    const errors = collectErrors();

    host.callbacks.validatePath = () => Promise.resolve(false);
    await commitTypedPath('/mnt/missing');
    // Rejected without a message, so the picker words the failure itself
    host.callbacks.validatePath = () => Promise.reject(new Map());
    await commitTypedPath('/mnt/broken');

    // Neither rejects with an Error, nor stays inside the root
    host.actions.set([
      { id: 'fails', label: 'Échoue', run: () => Promise.reject(new Map()) },
      { id: 'escapes', label: 'S’évade', run: () => Promise.resolve('/elsewhere') },
    ]);
    fixture.detectChanges();
    await host.picker().runCreateAction({ actionId: 'fails', parentPath: '/mnt' });
    await host.picker().runCreateAction({ actionId: 'escapes', parentPath: '/mnt' });

    expect(errors).toEqual([
      'Chemin invalide : /mnt/missing',
      'Échec de la validation',
      'Échec de la création de l’élément',
      'Créé hors de /mnt',
    ]);
  });

  it('words the loading state and a nameless breadcrumb segment from the token', async () => {
    await setup(french);
    const host = fixture.componentInstance;
    host.rootPath.set('/');
    host.callbacks.getChildren = () => new Promise<FileSystemItem[]>(() => undefined);
    host.picker().openFilePicker();
    fixture.detectChanges();

    expect(overlay.textContent).toContain('Chargement…');
    expect(overlay.querySelector('.breadcrumb-segment.nameless')?.getAttribute('aria-label')).toBe('Aller à /');
  });

  it('words the inline creation row and its non-Error failure from the token', async () => {
    await setup(french);
    const host = fixture.componentInstance;
    host.actions.set([{ id: 'folder', label: 'Dossier', create: () => Promise.reject(new Map()) }]);
    await open();

    const footerButton = Array.from(overlay.querySelectorAll<HTMLButtonElement>('.footer-actions button'))
      .find((button) => button.textContent?.trim() === 'Dossier')!;
    footerButton.click();
    fixture.detectChanges();

    const row = overlay.querySelector<HTMLInputElement>('.inline-create-input')!;
    expect(row.getAttribute('aria-label')).toBe('Nom : Dossier');

    row.value = 'nouveau';
    row.dispatchEvent(new Event('input'));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text('.inline-create-error .error-text')).toBe('Échec de la création');
  });

  it('keeps the harness working when no English label is on screen', async () => {
    await setup(french);
    const host = fixture.componentInstance;
    host.callbacks.getChildren = (path?: string) => Promise.resolve(path === '/mnt/tank'
      ? [{ path: '/mnt/tank/child', name: 'child', type: 'folder' }]
      : host.items);
    const picker = await TestbedHarnessEnvironment.loader(fixture).getHarness(TnFilePickerHarness);

    await picker.open();
    await picker.navigateToItem('tank');
    expect(await picker.getItemNames()).toEqual(['child']);

    await picker.clickItem('child');
    await picker.clickClearSelection();
    await picker.clickItem('child');
    await picker.clickSelect();
    expect(await picker.getValue()).toBe('/mnt/tank/child');
  });

  it('lets an explicit [placeholder] win over the token', async () => {
    await setup(french);
    fixture.componentInstance.placeholder.set('Pick a backup');
    fixture.detectChanges();

    expect(input().placeholder).toBe('Pick a backup');
  });

  it('keeps reading back the English default from placeholder() while showing the translation', async () => {
    await setup(french);

    expect(fixture.componentInstance.picker().placeholder()).toBe('Select file or folder');
    expect(input().placeholder).toBe('Choisir un fichier');
  });

  it('follows a signal-valued token when the language changes', async () => {
    const labels = signal<TnFilePickerLabels>(TN_FILE_PICKER_DEFAULT_LABELS);
    await setup(labels);
    await open();
    expect(text('.selection-count')).toBe('Current directory selected');

    labels.set(french);
    fixture.detectChanges();

    expect(input().placeholder).toBe('Choisir un fichier');
    expect(text('.selection-count')).toBe('Dossier courant');
  });
});
