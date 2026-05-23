import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TnTablePagerComponent } from './table-pager.component';
import { TnTablePagerHarness } from './table-pager.harness';

@Component({
  selector: 'tn-table-pager-harness-test',
  standalone: true,
  imports: [TnTablePagerComponent],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-table-pager
      [totalItems]="totalItems()"
      [(currentPage)]="currentPage"
      [(pageSize)]="pageSize"
      (pageChange)="pageChanges.push($event)"
      (pageSizeChange)="pageSizeChanges.push($event)" />
  `,
})
class HostComponent {
  totalItems = signal(47);
  currentPage = signal(1);
  pageSize = signal(20);
  pageChanges: number[] = [];
  pageSizeChanges: number[] = [];
}

describe('TnTablePagerHarness', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should render the initial range', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    expect(await pager.getRangeText()).toBe('1 – 20 of 47');
  });

  it('should disable first/previous on page 1', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    expect(await pager.isFirstButtonDisabled()).toBe(true);
    expect(await pager.isPreviousButtonDisabled()).toBe(true);
    expect(await pager.isNextButtonDisabled()).toBe(false);
    expect(await pager.isLastButtonDisabled()).toBe(false);
  });

  it('should advance via nextPage and emit pageChange', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    await pager.nextPage();
    expect(host.currentPage()).toBe(2);
    expect(host.pageChanges).toEqual([2]);
    expect(await pager.getRangeText()).toBe('21 – 40 of 47');
  });

  it('should jump to the last page', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    await pager.goToLastPage();
    expect(host.currentPage()).toBe(3);
    expect(await pager.getRangeText()).toBe('41 – 47 of 47');
  });

  it('should round-trip to the last page and back to the first', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    await pager.goToLastPage();
    expect(host.currentPage()).toBe(3);

    await pager.goToFirstPage();
    expect(host.currentPage()).toBe(1);
    expect(host.pageChanges).toEqual([3, 1]);
    expect(await pager.getRangeText()).toBe('1 – 20 of 47');
  });

  it('should disable next/last on the final page', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    await pager.goToLastPage();
    expect(await pager.isNextButtonDisabled()).toBe(true);
    expect(await pager.isLastButtonDisabled()).toBe(true);
    expect(await pager.isPreviousButtonDisabled()).toBe(false);
  });

  it('should step back via previousPage', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    await pager.nextPage();
    await pager.previousPage();
    expect(host.currentPage()).toBe(1);
    expect(host.pageChanges).toEqual([2, 1]);
  });

  it('should expose the page-size select', async () => {
    const pager = await loader.getHarness(TnTablePagerHarness);
    const select = await pager.getPageSizeSelect();
    expect(select).toBeTruthy();
  });
});
