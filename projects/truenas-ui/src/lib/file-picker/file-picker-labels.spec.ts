import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TN_FILE_PICKER_DEFAULT_LABELS, TN_FILE_PICKER_LABELS, type TnFilePickerLabels } from './file-picker-labels';
import { TnFilePickerComponent } from './file-picker.component';
import type { FileSystemItem } from './file-picker.interfaces';

/**
 * The app-wide labels for `tn-file-picker` and its popup: everything the
 * picker renders or announces comes from `TN_FILE_PICKER_LABELS`, an explicit
 * `[placeholder]` still wins, and a signal-valued token re-renders when the
 * app switches language.
 */

@Component({
  selector: 'tn-file-picker-labels-host',
  standalone: true,
  imports: [TnFilePickerComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <tn-file-picker [multiSelect]="true" [placeholder]="placeholder()" [callbacks]="callbacks" [createActions]="actions" />
  `,
})
class LabelsHostComponent {
  readonly picker = viewChild.required(TnFilePickerComponent);
  placeholder = signal<string | undefined>(undefined);
  items: FileSystemItem[] = [{ path: '/mnt/tank', name: 'tank', type: 'dataset' }];
  callbacks = { getChildren: (): Promise<FileSystemItem[]> => Promise.resolve(this.items) };
  actions = [{ id: 'folder', label: 'Dossier', create: (): Promise<string> => Promise.resolve('/mnt/x') }];
}

describe('TnFilePickerComponent labels', () => {
  const french: TnFilePickerLabels = {
    ...TN_FILE_PICKER_DEFAULT_LABELS,
    placeholder: 'Choisir un fichier',
    openPicker: 'Ouvrir le sélecteur',
    breadcrumb: 'Chemin',
    noItems: 'Aucun élément',
    nameColumn: 'Nom',
    sizeColumn: 'Taille',
    modifiedColumn: 'Modifié',
    selectItem: (name) => `Choisir ${name}`,
    openItem: (name) => `Ouvrir ${name}`,
    itemsSelected: (count) => `${count} sélectionné(s)`,
    noItemsSelected: 'Rien de sélectionné',
    currentDirectorySelected: 'Dossier courant',
    clearSelection: 'Effacer',
    select: 'Choisir',
    loadFailed: 'Échec du chargement',
    pathOutsideRoot: (root) => `Hors de ${root}`,
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
    expect(headers).toEqual(expect.arrayContaining(['Nom', 'Taille', 'Modifié']));
    expect(overlay.querySelector('[aria-label="Ouvrir tank"]')).not.toBeNull();
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

    const errors: string[] = [];
    fixture.componentInstance.picker().error.subscribe((error) => errors.push(error.message));
    await fixture.componentInstance.picker().selectPath('/elsewhere');
    expect(errors).toEqual(['Hors de /mnt']);
  });

  it('lets an explicit [placeholder] win over the token', async () => {
    await setup(french);
    fixture.componentInstance.placeholder.set('Pick a backup');
    fixture.detectChanges();

    expect(input().placeholder).toBe('Pick a backup');
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
