import type { HarnessLoader } from '@angular/cdk/testing';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { TnTooltipTesting } from './tooltip-testing';
import { TnTooltipDirective } from './tooltip.directive';
import { TnTooltipHarness } from './tooltip.harness';
import { TnIconTesting } from '../icon/icon-testing';

@Component({
  selector: 'tn-test-host',
  standalone: true,
  imports: [TnTooltipDirective],
  template: `
    <button type="button" [tnTooltip]="message()">host</button>
    <button type="button" id="plain" [tnTooltip]="'Pool is healthy'">plain host</button>
  `,
})
class TestHostComponent {
  // The link makes this tooltip click-to-open; the plain one beside it stays a hover tooltip.
  message = signal('Pool is <a href="#pool">online</a>');
}

describe('TnTooltipHarness', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let rootLoader: HarnessLoader;
  let host: HTMLButtonElement;
  let plainHost: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideHttpClient(),
        TnIconTesting.jest.providers()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    rootLoader = TnTooltipTesting.rootLoader(fixture);
    host = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    plainHost = fixture.nativeElement.querySelector('#plain') as HTMLButtonElement;
  });

  /**
   * Let the directive's show/hide timeout run.
   *
   * `tnTooltip` opens and closes from a `setTimeout`, and until #304 the
   * harness environment's own stabilisation covered it: `forceStabilize()`
   * waits on `fixture.whenStable()`, which under Zone meant "no pending
   * macrotasks". Zoneless, `whenStable()` resolves once Angular's
   * `PendingTasks` set is empty, and a bare `setTimeout` is not one of those —
   * so `getHarness` ran before the panel existed and read an empty document.
   *
   * A real macrotask rather than Jest's fake clock, because the harness
   * environment awaits promises of its own between here and the query.
   */
  function settle(): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve));
  }

  it('finds a hover tooltip and reads its text', async () => {
    plainHost.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();

    const tooltip = await rootLoader.getHarness(TnTooltipHarness);

    expect(await tooltip.getText()).toBe('Pool is healthy');
    expect(await tooltip.isSticky()).toBe(false);
    expect(await tooltip.getDismissLabel()).toBeNull();
  });

  it('reports sticky state and dismisses a pinned tooltip', async () => {
    host.click();

    const tooltip = await rootLoader.getHarness(TnTooltipHarness);
    expect(await tooltip.isSticky()).toBe(true);
    expect(await tooltip.getDismissLabel()).toBe('Close tooltip');

    await tooltip.dismiss();
    await settle();

    expect(await rootLoader.getHarnessOrNull(TnTooltipHarness)).toBeNull();
  });

  it('refuses to dismiss a tooltip that is not sticky', async () => {
    plainHost.dispatchEvent(new MouseEvent('mouseenter'));
    await settle();

    const tooltip = await rootLoader.getHarness(TnTooltipHarness);

    await expect(tooltip.dismiss()).rejects.toThrow(/not sticky/);
  });

  it('clicks interactive content inside a pinned tooltip', async () => {
    host.click();

    const tooltip = await rootLoader.getHarness(TnTooltipHarness);
    await expect(tooltip.clickContent('a')).resolves.not.toThrow();
  });

  it('filters by text and by sticky state', async () => {
    host.click();

    expect(await rootLoader.getHarnessOrNull(TnTooltipHarness.with({ text: 'Pool is online' }))).not.toBeNull();
    expect(await rootLoader.getHarnessOrNull(TnTooltipHarness.with({ text: 'Pool is offline' }))).toBeNull();
    expect(await rootLoader.getHarnessOrNull(TnTooltipHarness.with({ sticky: true }))).not.toBeNull();
    expect(await rootLoader.getHarnessOrNull(TnTooltipHarness.with({ sticky: false }))).toBeNull();
  });
});
