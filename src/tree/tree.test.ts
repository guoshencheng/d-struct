import Tree from '.';

const trees = () => {
  const root = new Tree('root');
  const a = new Tree('a');
  const b = new Tree('b');
  const c = new Tree('c');
  const d = new Tree('d');
  return {
    root, a, b, c, d
  }
}

describe('test normal tree', () => {
  it('test tree constructor', () => {
    const { root } = trees();
    expect(root.data).toEqual('root');
  })
  it('test add child and del child', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    expect(c.root).toEqual(root);
    expect(c.parent).toEqual(root);
    expect(b.root).toEqual(a.root);
  })
  it('test del child', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    root.delNode(a);
    expect(b.root).toEqual(a);
    expect(a.root).toBeUndefined();
  })
  it('test encode tree', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    expect(root.toArray()).toEqual(
      ['root', '@2@', 'a', '@2@', 'b', '@0@', 'd', '@0@', 'c', '@0@']
    )
  })
});
