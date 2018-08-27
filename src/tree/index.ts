import { EventEmitter } from 'fbemitter';

export type TreeDataFilter<T> = (d: T) => boolean;

export type TreeArrayElement<T> = T | string;

export type BaseHandlerCollection = {
  [key: string]: (...args) => void
}

/**
 *  Tree a tree struct to handle data
 *  extends from EventEmitter to make broadcast and emit method
 *
 *  every node is tree and every tree is node
 *  tree has no limit node
 *  the node without parent is root
 *  the node without children is really node
 *
 *  @param parent [the parent of this tree node]
 */
export default class Tree<T> extends EventEmitter {

  parent?: Tree<T>; // reference of parent. undefined means the node is root value
  data: T; // a data the tree carrying
  nodes: Tree<T>[]; // the children
  root?: Tree<T>; // reference of root, undefined means the node is root value

  /**
   * Static
   * fromArray
   *
   * create tree object from a array
   *
   * a algorithm to decode tree from a encode tree array
   * see [toArray] function checkout encode algorithm
   *
   * @param array tree element array
   *
   * @return Tree
   */
  static fromArray<T>(array: TreeArrayElement<T>[]) {
    const length = array.length;
    const less = [] as { nodeLength: number, data: T }[];
    for (let i = 0; i < length / 2; i += 1) {
      const data = array[i * 2] as T
      const nodeSplit = array[i * 2 + 1] as string;
      const nodeLength = Number(nodeSplit.replace(/@(\d+)@/, '$1'))
      less.push({
        nodeLength, data
      });
    }
    function createTree() {
      const cur = less.shift();
      const t = new Tree(cur && cur.data);
      if (cur && cur.nodeLength > 0) {
        for (let i = 0; i < cur.nodeLength; i += 1) {
          const node = createTree();
          t.addNode(node);
        }
      }
      return t;
    }
    const root = createTree();
    return root;
  }

  constructor(data: T) {
    super();
    this.data = data;
    this.nodes = [];
  }

  /**
   * $broadcast
   *
   * broadcast event from up down to notify all children
   *
   * @param event   the event name
   * @param ...args some arguments with event
   */
  $broadcast(event: string, ...args): void {
    this.nodes.forEach(node => {
      node.emit(event, ...args);
      node.$broadcast(event, ...args);
    })
  }

  /**
   * $emit
   *
   * pop up event from down up to notify all parent end with root
   *
   * @param event   the event name
   * @param ...args some arguments with event
   */
  $emit(event: string, ...args): void {
    if (this.parent) {
      this.parent.emit(event, ...args);
      this.parent.$emit(event, ...args);
    }
  }

  /**
   * $updateRoot
   *
   * update node root value when node is add or remove from parent
   * if param root is empty current node will be used as root node
   *
   * @param  root the next root value
   *
   * @return  return self for list call
   */
  $updateRoot(root?: Tree<T>): Tree<T> {
    this.root = root;
    this.nodes.forEach(node => {
      node.$updateRoot(this.root || this);
    })
    return this;
  }

  /**
   * delNode
   *
   * remove node from current node's children
   * change removed node's parent and broadcast change it's children's root
   *
   * @param  t node witch is going to remove
   * @return tree return the current node for list call
   */
  delNode(t: Tree<T>): Tree<T> {
    const index = this.nodes.indexOf(t);
    this.nodes.splice(index, 1);
    delete t.parent;
    t.$updateRoot()
    return this;
  }

  /**
   * addNode
   *
   * add node into current node
   * change added node's parent and broadcast change root into current node's root
   *
   * @param  t [description]
   * @return   [description]
   */
  addNode(t: Tree<T>): Tree<T> {
    this.nodes.push(t);
    t.parent = this;
    t.$updateRoot(this.root || this);
    return this;
  }

  /**
   * toArray
   * encode tree to array
   * @return a tree element array split with @number@
   */
  toArray(): TreeArrayElement<T>[]  {
    return this.nodes.reduce((pre, cur) => pre.concat(cur.toArray()), [this.data, `@${this.nodes.length}@`]);
  }

  /**
   * findAll
   *
   * find all filter value node from current node
   *
   * @param  filter the filter function recive the data carried by node return a boolean value
   * @return return filtered data array;
   */
  findAll(filter: TreeDataFilter<T>): T[] {
    return this.nodes.reduce((pre, cur) => {
      return pre.concat(cur.findAll(filter));
    }, [this.data])
  }

  /**
   * findOne
   *
   * find one filter value node from current node
   *
   * @param filter the filter function recive the data carried by node return a boolean value
   * @return return one filtered data;
   */
  findOne(filter: TreeDataFilter<T>): T | undefined {
    if (filter(this.data)) {
      return this.data;
    }
    if (this.nodes.length > 0) {
      let data;
      for (let i = 0; i < this.nodes.length; i += 1) {
        data = this.nodes[i].findOne(filter);
        if (data) {
          break;
        }
      }
      return data;
    } else {
      return;
    }
  }

  equal(tree: Tree<T>): boolean {
    if (this.data !== tree.data) {
      return false;
    }
    if (this.nodes.length != tree.nodes.length) {
      return false;
    }
    return this.nodes.reduce((pre, t, index) => {
      return pre && t.equal(tree.nodes[index]);
    }, true)
  }
}
