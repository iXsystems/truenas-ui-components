import type { CollectionViewer } from '@angular/cdk/collections';
import { fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TnNestedTreeDataSource } from './nested-tree-datasource';
import { createFlatTreeControl } from './tree-control.factory';
import type { TnTreeExpansion } from './tree-expansion.interface';
import { TnTreeFlatDataSource, TnTreeFlattener } from './tree.component';

interface ExampleNode {
  name: string;
  children?: ExampleNode[];
}

interface ExampleFlatNode {
  name: string;
  level: number;
  expandable: boolean;
}

function makeData(): ExampleNode[] {
  return [
    { name: 'banana', children: [{ name: 'zeta' }, { name: 'alpha' }] },
    { name: 'apple' },
  ];
}

describe('TnNestedTreeDataSource', () => {
  const collectionViewer: CollectionViewer = { viewChange: new Subject() };

  function latest(dataSource: TnNestedTreeDataSource<ExampleNode>): ExampleNode[] {
    let value: ExampleNode[] = [];
    const subscription = dataSource.connect(collectionViewer).subscribe((data) => value = data);
    subscription.unsubscribe();
    return value;
  }

  it('emits the data as-is by default', () => {
    const dataSource = new TnNestedTreeDataSource(makeData());
    expect(latest(dataSource).map((node) => node.name)).toEqual(['banana', 'apple']);
  });

  it('sorts recursively when sortComparer is set', () => {
    const dataSource = new TnNestedTreeDataSource<ExampleNode>();
    dataSource.sortComparer = (a, b) => a.name.localeCompare(b.name);
    dataSource.data = makeData();

    const data = latest(dataSource);
    expect(data.map((node) => node.name)).toEqual(['apple', 'banana']);
    expect(data[1].children?.map((node) => node.name)).toEqual(['alpha', 'zeta']);
  });

  it('filters through filterPredicate with a debounce and clears when query is emptied', fakeAsync(() => {
    const dataSource = new TnNestedTreeDataSource(makeData());
    dataSource.filterPredicate = (data, query) => data.filter((node) => node.name.includes(query));

    dataSource.filter('app');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['apple']);

    dataSource.filter('');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['banana', 'apple']);
  }));

  it('keeps filtering functional after a disconnect/reconnect cycle', fakeAsync(() => {
    const dataSource = new TnNestedTreeDataSource(makeData());
    dataSource.filterPredicate = (data, query) => data.filter((node) => node.name.includes(query));

    dataSource.disconnect();

    dataSource.filter('app');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['apple']);
  }));
});

describe('TnTreeFlatDataSource', () => {
  function makeDataSource(): {
    dataSource: TnTreeFlatDataSource<ExampleNode, ExampleFlatNode>;
    treeControl: TnTreeExpansion<ExampleFlatNode>;
  } {
    const treeControl = createFlatTreeControl<ExampleFlatNode>(
      (node) => node.level,
      (node) => node.expandable,
    );
    const flattener = new TnTreeFlattener<ExampleNode, ExampleFlatNode>(
      (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children,
    );
    return { dataSource: new TnTreeFlatDataSource(treeControl, flattener), treeControl };
  }

  function latest(dataSource: TnTreeFlatDataSource<ExampleNode, ExampleFlatNode>): ExampleFlatNode[] {
    let value: ExampleFlatNode[] = [];
    const subscription = dataSource.connect().subscribe((data) => value = data);
    subscription.unsubscribe();
    return value;
  }

  it('flattens data and reveals children on expansion', () => {
    const { dataSource, treeControl } = makeDataSource();
    dataSource.data = makeData();

    expect(latest(dataSource).map((node) => node.name)).toEqual(['banana', 'apple']);

    treeControl.expand(treeControl.dataNodes[0]);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['banana', 'zeta', 'alpha', 'apple']);
  });

  it('sorts top-level data when sortComparer is set', () => {
    const { dataSource } = makeDataSource();
    dataSource.sortComparer = (a, b) => a.name.localeCompare(b.name);
    dataSource.data = makeData();

    expect(latest(dataSource).map((node) => node.name)).toEqual(['apple', 'banana']);
  });

  it('filters through filterPredicate with a debounce', fakeAsync(() => {
    const { dataSource } = makeDataSource();
    dataSource.data = makeData();
    dataSource.filterPredicate = (data, query) => data.filter((node) => node.name.includes(query));

    dataSource.filter('app');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['apple']);

    dataSource.filter('');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['banana', 'apple']);
  }));

  it('keeps filtering functional after a disconnect/reconnect cycle', fakeAsync(() => {
    const { dataSource } = makeDataSource();
    dataSource.data = makeData();
    dataSource.filterPredicate = (data, query) => data.filter((node) => node.name.includes(query));

    dataSource.disconnect();

    dataSource.filter('app');
    tick(200);
    expect(latest(dataSource).map((node) => node.name)).toEqual(['apple']);
  }));

  it('accepts a tree control with a custom trackBy key type', () => {
    const treeControl = createFlatTreeControl<ExampleFlatNode, string>(
      (node) => node.level,
      (node) => node.expandable,
      { trackBy: (node) => node.name },
    );
    const flattener = new TnTreeFlattener<ExampleNode, ExampleFlatNode>(
      (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children,
    );
    const dataSource = new TnTreeFlatDataSource<ExampleNode, ExampleFlatNode, string>(treeControl, flattener);
    dataSource.data = makeData();

    treeControl.expand(treeControl.dataNodes[0]);
    expect(treeControl.isExpanded(treeControl.dataNodes[0])).toBe(true);
  });
});
