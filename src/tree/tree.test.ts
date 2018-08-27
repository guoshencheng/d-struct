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
  it('tree constructor', () => {
    const { root } = trees();
    expect(root.data).toEqual('root');
  })
  it('check tree value equal', () => {
    const { a, b, c } = trees();
    const { a: aa, b: bb, c: cc } = trees();
    const tom = new Tree('tom');
    const bob = new Tree('bob');
    a.addNode(c);
    a.addNode(b);
    c.addNode(tom);
    aa.addNode(cc);
    aa.addNode(bb);
    cc.addNode(bob);
    expect(a.equal(aa)).toBeFalsy();
    bob.data = 'tom';
    expect(a.equal(aa)).toBeTruthy();
  })
  it('add child as node', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    expect(c.root).toEqual(root);
    expect(c.parent).toEqual(root);
    expect(b.root).toEqual(a.root);
  })
  it('del child', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    root.delNode(a);
    expect(b.root).toEqual(a);
    expect(a.root).toBeUndefined();
  })
  it('encode tree as array', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    expect(root.toArray()).toEqual(
      ['root', '@2@', 'a', '@2@', 'b', '@0@', 'd', '@0@', 'c', '@0@']
    )
  })
  it('decode tree from array', () => {
    const { root, a, b, c, d } = trees();
    root.addNode(a);
    a.addNode(b).addNode(d);
    root.addNode(c);
    const arr = ['root', '@2@', 'a', '@2@', 'b', '@0@', 'd', '@0@', 'c', '@0@']
    expect(Tree.fromArray(arr).equal(root)).toBeTruthy();
  })
});
