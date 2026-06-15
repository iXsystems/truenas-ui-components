import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TnFormSectionComponent } from './form-section.component';
import { TnFormSectionHarness } from './form-section.harness';

@Component({
  standalone: true,
  imports: [TnFormSectionComponent],
  template: `
    <tn-form-section [heading]="heading" [tooltip]="tooltip">
      <input class="projected" />
    </tn-form-section>
  `,
})
class HostComponent {
  heading = 'Network Settings';
  tooltip = '';
}

describe('TnFormSectionComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a native fieldset that projects its content', () => {
    const fieldset = fixture.debugElement.query(By.css('fieldset.tn-form-section'));
    expect(fieldset).toBeTruthy();
    expect(fieldset.query(By.css('input.projected'))).toBeTruthy();
  });

  it('renders the heading in a legend', () => {
    const legend = fixture.debugElement.query(By.css('.tn-form-section__legend'));
    expect(legend.nativeElement.textContent.trim()).toBe('Network Settings');
  });

  it('keeps the legend a direct child of the fieldset so it names the group', () => {
    // Only a direct-child <legend> acts as the fieldset's accessible caption.
    const legend = fixture.debugElement.query(
      By.css('fieldset.tn-form-section > legend.tn-form-section__header'),
    );
    expect(legend).toBeTruthy();
    expect(legend.nativeElement.textContent.trim()).toContain('Network Settings');
  });

  it('omits the legend when no heading is set', () => {
    host.heading = '';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.tn-form-section__legend'))).toBeNull();
  });

  it('renders lightweight label markup in the heading', () => {
    host.heading = '**Storage** settings';
    fixture.detectChanges();
    const legend = fixture.debugElement.query(By.css('.tn-form-section__legend'));
    expect(legend.nativeElement.innerHTML).toContain('<strong>Storage</strong>');
  });

  it('shows the tooltip button only when a tooltip is set', () => {
    expect(fixture.debugElement.query(By.css('.tn-form-section__tooltip'))).toBeNull();

    host.tooltip = 'Controls how the interface reaches the network.';
    fixture.detectChanges();

    const tooltip = fixture.debugElement.query(By.css('.tn-form-section__tooltip'));
    expect(tooltip).toBeTruthy();
    expect(tooltip.nativeElement.getAttribute('aria-label')).toBe(host.tooltip);
  });

  describe('harness', () => {
    it('reads the heading text', async () => {
      const section = await loader.getHarness(TnFormSectionHarness);
      expect(await section.getHeadingText()).toBe('Network Settings');
    });

    it('reports tooltip presence', async () => {
      const section = await loader.getHarness(TnFormSectionHarness);
      expect(await section.hasTooltip()).toBe(false);

      host.tooltip = 'More info';
      fixture.detectChanges();
      expect(await section.hasTooltip()).toBe(true);
    });

    it('filters by heading via with()', async () => {
      const section = await loader.getHarness(
        TnFormSectionHarness.with({ heading: 'Network Settings' }),
      );
      expect(section).toBeTruthy();
      expect(await loader.getAllHarnesses(TnFormSectionHarness.with({ heading: 'Nope' }))).toHaveLength(0);
    });
  });
});
