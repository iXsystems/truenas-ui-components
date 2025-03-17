import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruenasUiComponent } from './truenas-ui.component';

describe('TruenasUiComponent', () => {
  let component: TruenasUiComponent;
  let fixture: ComponentFixture<TruenasUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruenasUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruenasUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
