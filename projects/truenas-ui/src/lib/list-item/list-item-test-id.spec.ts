import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TnListItemComponent } from './list-item.component';
import { TN_TEST_ATTR } from '../test-id';
import type { TnTestIdValue } from '../test-id';

/**
 * A `tn-list-item` is both a click target and a rendered value — the row of a
 * settings card that says what the current configuration is, the row of a
 * picker that selects a VDEV type — and it carried no id at all, so a suite
 * could reach neither. The only handles left were row position and row text,
 * which is what a consumer's test convention exists to avoid.
 *
 * The id lands on the **host**, because that is the element the `(click)` host
 * binding and the `listitem` role are both on: one id addresses the row whether
 * a suite clicks it or reads it. It is written **verbatim**, with no
 * element-type prefix, matching the other components whose host is the target
 * (`tn-tree-node`, `tn-table`) — a list row is not a control whose type the
 * library can name, and what it means comes from the list around it.
 */
@Component({
  selector: 'tn-list-item-test-id-host',
  standalone: true,
  imports: [TnListItemComponent],
  template: `
    <tn-list-item [clickable]="true" [testId]="testId()" (itemClick)="clicks = clicks + 1">
      Mirror
    </tn-list-item>
  `,
})
class ListItemTestIdHostComponent {
  readonly testId = signal<TnTestIdValue>('vdev-type-mirror');
  clicks = 0;
}

describe('TnListItemComponent [testId]', () => {
  type Fixture = ComponentFixture<ListItemTestIdHostComponent>;

  function setup(attr?: 'data-test'): Fixture {
    TestBed.configureTestingModule({
      imports: [ListItemTestIdHostComponent],
      providers: attr ? [{ provide: TN_TEST_ATTR, useValue: attr }] : [],
    });
    const fixture = TestBed.createComponent(ListItemTestIdHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  const row = (fixture: Fixture): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('tn-list-item') as HTMLElement;

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('writes the base verbatim on the host', () => {
    const fixture = setup();

    expect(row(fixture).getAttribute('data-testid')).toBe('vdev-type-mirror');
  });

  it('puts the id on the element that handles the click', () => {
    const fixture = setup();

    // The host owns both `(click)` and role="listitem", so the element a suite
    // clicks by id is the element that emits `itemClick`. Counting through the
    // output rather than a listener on the element is what makes this fail if
    // the click handler ever moves to an inner element: a click on the host
    // does not reach its children.
    const tagged = (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="vdev-type-mirror"]') as HTMLElement;

    expect(tagged.getAttribute('role')).toBe('listitem');

    tagged.click();

    expect(fixture.componentInstance.clicks).toBe(1);
  });

  it('kebab-cases the base and composes an array base in order', () => {
    const fixture = setup();
    fixture.componentInstance.testId.set(['vdevType', undefined, 'RAIDZ2']);
    fixture.detectChanges();

    expect(row(fixture).getAttribute('data-testid')).toBe('vdev-type-raidz2');
  });

  it('writes no attribute when the input is unset', () => {
    const fixture = setup();
    fixture.componentInstance.testId.set(undefined);
    fixture.detectChanges();

    // An empty `data-testid=""` matches an attribute-presence selector while
    // naming nothing, which is worse for a suite than no attribute at all.
    expect(row(fixture).hasAttribute('data-testid')).toBe(false);
  });

  it('writes to the attribute the app configured through TN_TEST_ATTR', () => {
    const fixture = setup('data-test');

    expect(row(fixture).getAttribute('data-test')).toBe('vdev-type-mirror');
    expect(row(fixture).hasAttribute('data-testid')).toBe(false);
  });
});
