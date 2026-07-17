import type { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CdkTreeModule } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { TnNestedTreeDataSource } from './nested-tree-datasource';
import { TnNestedTreeNodeComponent } from './nested-tree-node.component';
import { createNestedTreeControl } from './tree-control.factory';
import { TnTreeNodeOutletDirective } from './tree-node-outlet.directive';
import { TnTreeComponent } from './tree.component';
import { TnTreeHarness, TnTreeNodeHarness } from './tree.harness';

interface ExampleNode {
  name: string;
  children?: ExampleNode[];
}

const dataset: ExampleNode[] = [
  {
    name: 'pool',
    children: [
      { name: 'mirror', children: [{ name: 'sda' }, { name: 'sdb' }] },
    ],
  },
  { name: 'other' },
];

@Component({
  selector: 'tn-nested-tree-node-test',
  standalone: true,
  imports: [CdkTreeModule, TnTreeComponent, TnNestedTreeNodeComponent, TnTreeNodeOutletDirective],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <tn-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <tn-nested-tree-node *cdkTreeNodeDef="let node" [testId]="node.name">
        {{ node.name }}
      </tn-nested-tree-node>

      <tn-nested-tree-node
        *cdkTreeNodeDef="let node; when: hasChild"
        [testId]="node.name"
        [toggleAriaLabel]="'Toggle ' + node.name"
        [toggleTestId]="['toggle', node.name]"
        [hideToggle]="hideToggle"
      >
        {{ node.name }}
        <ng-container slot="children" tnTreeNodeOutlet />
      </tn-nested-tree-node>
    </tn-tree>
  `,
})
class HostComponent {
  hideToggle = false;

  readonly treeControl = createNestedTreeControl<ExampleNode>((node) => node.children);
  readonly dataSource = new TnNestedTreeDataSource<ExampleNode>(dataset);

  readonly hasChild = (_: number, node: ExampleNode): boolean => !!node.children?.length;
}

describe('TnNestedTreeNodeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    await settle();
  });

  /**
   * Child node insertion is deferred to a microtask (see the component's
   * `updateChildrenNodes`), and each depth level defers again — settle a few
   * rounds so the whole tree is rendered.
   */
  async function settle(passes = 3): Promise<void> {
    for (let i = 0; i < passes; i++) {
      await fixture.whenStable();
      fixture.detectChanges();
    }
  }

  function toggleButton(nodeName: string): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(`[data-testid="button-toggle-${nodeName}"]`);
  }

  it('renders root nodes and keeps children in a hidden group until expanded', () => {
    const wrappers = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLElement>('.tn-nested-tree-node-wrapper'),
    );
    expect(wrappers.length).toBeGreaterThanOrEqual(2);

    const container = fixture.nativeElement.querySelector('.tn-nested-tree-node-container');
    expect(container.classList).toContain('tn-tree-invisible');
  });

  it('renders the built-in toggle with the configured aria-label and test id', () => {
    const toggle = toggleButton('pool');
    expect(toggle).toBeTruthy();
    expect(toggle?.getAttribute('aria-label')).toBe('Toggle pool');
    expect(toggle?.getAttribute('tabindex')).toBe('-1');
  });

  it('expands one level on plain click', () => {
    toggleButton('pool')?.click();
    fixture.detectChanges();

    expect(host.treeControl.isExpanded(dataset[0])).toBe(true);
    expect(host.treeControl.isExpanded(dataset[0].children![0])).toBe(false);
  });

  it('expands the node and all descendants on Alt+click', () => {
    toggleButton('pool')?.dispatchEvent(new MouseEvent('click', { altKey: true, bubbles: true }));
    fixture.detectChanges();

    expect(host.treeControl.isExpanded(dataset[0])).toBe(true);
    expect(host.treeControl.isExpanded(dataset[0].children![0])).toBe(true);
  });

  it('collapses the node and all descendants on Alt+click when expanded', () => {
    host.treeControl.expandDescendants(dataset[0]);
    fixture.detectChanges();

    toggleButton('pool')?.dispatchEvent(new MouseEvent('click', { altKey: true, bubbles: true }));
    fixture.detectChanges();

    expect(host.treeControl.isExpanded(dataset[0])).toBe(false);
    expect(host.treeControl.isExpanded(dataset[0].children![0])).toBe(false);
  });

  it('suppresses the built-in toggle and spacer when hideToggle is set', () => {
    host.hideToggle = true;
    fixture.detectChanges();

    expect(toggleButton('pool')).toBeNull();
    const poolContent = fixture.nativeElement.querySelector('[data-testid="pool"] > .tn-nested-tree-node__content');
    expect(poolContent.querySelector('.tn-nested-tree-node__toggle')).toBeNull();
    expect(poolContent.querySelector('.tn-nested-tree-node__spacer')).toBeNull();
  });

  describe('harnesses', () => {
    it('finds the tree and filters nodes by text and level', async () => {
      const tree = await loader.getHarness(TnTreeHarness);

      const roots = await tree.getNodes({ level: 0 });
      expect(await Promise.all(roots.map((node) => node.getText()))).toEqual(['pool', 'other']);

      const pool = await tree.getNodes({ text: 'pool' });
      expect(pool.length).toBe(1);
      expect(await pool[0].isExpandable()).toBe(true);
      expect(await pool[0].isExpanded()).toBe(false);
    });

    it('expands and collapses through the node harness', async () => {
      const tree = await loader.getHarness(TnTreeHarness);
      const [pool] = await tree.getNodes({ text: 'pool' });

      await pool.expand();
      expect(await pool.isExpanded()).toBe(true);
      expect(host.treeControl.isExpanded(dataset[0])).toBe(true);

      await pool.collapse();
      expect(await pool.isExpanded()).toBe(false);
      expect(host.treeControl.isExpanded(dataset[0])).toBe(false);
    });

    it('toggles descendants through the node harness', async () => {
      const [pool] = await loader.getAllHarnesses(TnTreeNodeHarness.with({ text: 'pool' }));

      await pool.toggleWithDescendants();

      expect(host.treeControl.isExpanded(dataset[0])).toBe(true);
      expect(host.treeControl.isExpanded(dataset[0].children![0])).toBe(true);
    });
  });
});
