import { readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnToastComponent } from './toast.component';
import { TnToastType } from './toast.types';

describe('TnToastComponent', () => {
  let fixture: ComponentFixture<TnToastComponent>;
  let component: TnToastComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TnToastComponent);
    component = fixture.componentInstance;
  });

  describe('icons', () => {
    const iconFor = (type: TnToastType): string => {
      component.type.set(type);
      fixture.detectChanges();
      return component.icon();
    };

    it('resolves a distinct icon for every toast type', () => {
      const icons = Object.values(TnToastType).map(iconFor);

      expect(icons).toEqual(['mat-info', 'mat-check_circle', 'mat-warning', 'mat-error']);
    });

    // These names live in a TS map, so the sprite generator can only see them through
    // the `tnIconMarker()` calls wrapping them. Drop the markers and the icons silently
    // fall out of the sprite on the next regeneration — there is no `material-icons`
    // font bundled here, so the fallback renders nothing at all.
    it('ships every toast icon in the generated sprite', () => {
      const configPath = join(__dirname, '../../../assets/tn-icons/sprite-config.json');
      const { icons } = JSON.parse(readFileSync(configPath, 'utf-8')) as { icons: string[] };

      const missing = Object.values(TnToastType)
        .map(iconFor)
        .filter((icon) => !icons.includes(icon));

      expect(missing).toEqual([]);
    });
  });
});
