import Tree from '.';

describe('test normal tree', () => {
  it('test tree constructor', () => {
    const root = 'root';
    const tree = new Tree<string>(root);
    expect(tree.data).toEqual(root);
  })
  it('test add child', () => {
    
  })
});
