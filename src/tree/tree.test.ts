import Tree from '.';

describe('test normal tree', () => {
  it('test tree constructor', () => {
    const root = 'root';
    const tree = new Tree(root);
    expect(tree.data).toEqual(root);
  })
  it('test add child and del child', () => {
    const root = new Tree('root');
    const a = new Tree('a');
    const b = new Tree('b');
    const c = new Tree('c');
    const d = new Tree('d');
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    expect(c.root).toEqual(root);
    expect(c.parent).toEqual(root);
    expect(b.root).toEqual(a.root);

    root.delNode(a);
    expect(b.root).toEqual(a);
    expect(a.root).toBeUndefined();
  })
});
