import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnSlideToggleComponent } from './slide-toggle.component';

@Component({
  selector: 'tn-slide-toggle-change-test',
  standalone: true,
  imports: [TnSlideToggleComponent],
  template: `
    <tn-slide-toggle label="Enable" (change)="changeCount = changeCount + 1" />
  `,
})
class TestHostComponent {
  changeCount = 0;
}

describe('TnSlideToggleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('change binding', () => {
    it('fires a (change) binding exactly once per toggle', () => {
      // The inner input's native change bubbles to the host, where Ivy invokes a
      // (change) binding for BOTH the bubbled DOM event and the component's
      // `change` output — double-firing every listener. The handler stops the
      // native event so only the output reaches consumers.
      const input = fixture.nativeElement.querySelector('.tn-slide-toggle__input') as HTMLInputElement;
      input.click();
      fixture.detectChanges();

      expect(host.changeCount).toBe(1);
    });
  });
});
